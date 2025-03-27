export async function createChatCompletion(messages: any[]): Promise<string> {
  console.log('Starting chat completion with messages:', messages);
  try {
    const response = await fetch('/api/proxy/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash", // Updated to Flash Lite model
        messages,
        temperature: 0.7,
        max_tokens: 1024 // Optional: control response length
      })
    });
    console.log('Chat response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Chat API error details:', errorBody);
      throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Stream reader not available');
    }

    let fullContent = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.choices && data.choices[0]?.delta?.content) {
            fullContent += data.choices[0].delta.content;
          }
        } catch (e) {
          console.error('Error parsing stream chunk:', e);
        }
      }
    }

    return fullContent;
  } catch (e) {
    console.error('Chat completion failed:', e);
    throw e;
  }
}
