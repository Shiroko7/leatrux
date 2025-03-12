// New streaming version
export async function createStreamingChatCompletion(
  messages: any[], 
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): Promise<void> {
  console.log('Starting streaming chat completion with messages:', messages);
  try {
    const response = await fetch('/api/proxy/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        stream: true
      })
    });
    
    console.log('Streaming chat response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Chat API error details:', errorBody);
      onError(new Error(`Chat API error: ${response.status} ${response.statusText}`));
      return;
    }

    // Get the response as a stream
    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('Failed to get stream reader'));
      return;
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      // Decode the chunk and add to buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete event chunks in the buffer
      while (buffer.includes('\n')) {
        const lineEnd = buffer.indexOf('\n');
        const line = buffer.substring(0, lineEnd).trim();
        buffer = buffer.substring(lineEnd + 1);

        if (line.startsWith('data: ')) {
          const data = line.substring(6); // Remove 'data: ' prefix
          
          if (data === '[DONE]') {
            // Stream is complete
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.warn('Failed to parse streaming chunk:', data, e);
          }
        }
      }
    }
    
    onComplete();
  } catch (e) {
    console.error('Streaming chat completion failed:', e);
    onError(e instanceof Error ? e : new Error(String(e)));
  }
}
