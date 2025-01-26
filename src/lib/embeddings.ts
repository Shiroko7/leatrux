export async function createChatCompletion(messages: any[]): Promise<string> {
    console.log('Starting chat completion with messages:', messages);
    try {
      const response = await fetch('/api/proxy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7
        })
      });
      console.log('Chat response status:', response.status);
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Chat API error details:', errorBody);
        throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      console.error('Chat completion failed:', e);
      throw e;
    }
  }
