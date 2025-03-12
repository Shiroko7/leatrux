export async function POST({ request }) {
  const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  try {
    const body = await request.json();
    const isStream = body.stream === true;
    
    const response = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `API error: ${response.status} ${response.statusText}` 
        }), 
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Handle streaming response differently
    if (isStream) {
      // Pass the stream directly to the client
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      // For non-streaming, just return the JSON response as before
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ 
        error: 'Proxy error', 
        details: e instanceof Error ? e.message : String(e) 
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
