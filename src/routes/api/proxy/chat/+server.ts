export async function POST({ request }) {
  // Using Gemini Flash Lite model for faster responses
  const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent';
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  try {
    const requestData = await request.json();
    
    // Transform messages from ChatGPT/DeepSeek format to Gemini format
    const contents = requestData.messages.map(msg => {
      // Handle system message differently since Gemini doesn't have system messages
      if (msg.role === 'system') {
        return {
          role: 'user',
          parts: [{ text: msg.content }]
        };
      }
      
      // Map user and assistant roles
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      };
    });

    // Prepare Gemini API request
    const geminiRequest = {
      contents,
      generationConfig: {
        temperature: requestData.temperature || 0.7,
        topP: requestData.top_p || 0.95,
        topK: requestData.top_k || 40,
        maxOutputTokens: requestData.max_tokens || 1024,
      }
    };

    // Set up streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(`${GEMINI_API}?key=${apiKey}&alt=sse`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(geminiRequest)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            controller.enqueue(encoder.encode(JSON.stringify({
              error: `Gemini API error: ${response.status}`,
              details: errorText
            })));
            controller.close();
            return;
          }

          // Gemini returns Server-Sent Events
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Stream reader not available');
          }

          let accumulatedContent = '';
          let decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Process the chunk
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = line.substring(6);
                  
                  // Skip "[DONE]" marker which indicates the end of the stream
                  if (data.trim() === '[DONE]') continue;
                  
                  const parsed = JSON.parse(data);
                  
                  // Extract the content from the SSE response
                  if (parsed.candidates && 
                      parsed.candidates[0]?.content?.parts && 
                      parsed.candidates[0].content.parts[0]?.text) {
                    const newContent = parsed.candidates[0].content.parts[0].text;
                    accumulatedContent += newContent;
                    
                    // Create a streaming-compatible response chunk
                    const streamChunk = {
                      choices: [{
                        delta: {
                          content: newContent
                        },
                        index: 0,
                        finish_reason: null
                      }],
                      model: 'gemini-flash-lite'
                    };
                    
                    controller.enqueue(encoder.encode(JSON.stringify(streamChunk) + '\n'));
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e, line);
                }
              }
            }
          }
          
          // Send the final chunk with finish_reason
          const finalChunk = {
            choices: [{
              delta: { content: '' },
              index: 0,
              finish_reason: 'stop'
            }],
            model: 'gemini-flash-lite'
          };
          
          controller.enqueue(encoder.encode(JSON.stringify(finalChunk) + '\n'));
          controller.close();
        } catch (e) {
          console.error('Streaming error:', e);
          controller.enqueue(encoder.encode(JSON.stringify({ 
            error: 'Streaming error', 
            details: e.message 
          })));
          controller.close();
        }
      }
    });
    
    // Use the streaming response instead of a single JSON response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });

    // This section is replaced by the streaming implementation above
  } catch (e) {
    console.error('Proxy error:', e);
    return new Response(JSON.stringify({ 
      error: 'Proxy error', 
      details: e.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
