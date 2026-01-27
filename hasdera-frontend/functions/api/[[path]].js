const BACKEND_ORIGIN = "https://hasderanewsletter-2025.onrender.com";

export async function onRequest({ request, params }) {
  try {
    // טיפול ב-OPTIONS requests עבור CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const incomingUrl = new URL(request.url);
    const splat = params?.path;
    const rest = Array.isArray(splat) ? splat.join("/") : (splat ?? "");

    // אם rest כבר מתחיל ב-api/, נסיר את זה כדי לא לכפול
    // אבל בדרך כלל זה לא צריך לקרות כי params.path לא כולל את "api/"
    let cleanRest = rest;
    if (rest.startsWith('api/')) {
      cleanRest = rest.substring(4);
    }
    
    // אם cleanRest ריק, זה אומר שהבקשה היא /api/ בלבד
    if (!cleanRest) {
      return new Response(JSON.stringify({ error: 'Invalid API path', path: rest, params: params }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'X-Hasdera-Proxy': 'pages-api-error',
        },
      });
    }
    
    const targetUrl = new URL(`/api/${cleanRest}`, BACKEND_ORIGIN);
    targetUrl.search = incomingUrl.search;

    const auth = request.headers.get("Authorization");
    
    // Clone request body if needed (for POST/PUT requests)
    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.clone().arrayBuffer();
    }
    
    const proxiedRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: body,
    });

    const response = await fetch(proxiedRequest);
    
    // העברת ה-headers מה-response (כולל CORS)
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Debug headers (safe): helps verify requests are passing through Pages Functions
    responseHeaders.set('X-Hasdera-Proxy', 'pages-api');
    responseHeaders.set('X-Hasdera-Proxy-Target', targetUrl.pathname);
    responseHeaders.set('X-Hasdera-Proxy-Auth', auth ? 'present' : 'absent');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    // אם יש שגיאה, נחזיר שגיאה עם debug info
    return new Response(JSON.stringify({ 
      error: 'Proxy error', 
      message: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'X-Hasdera-Proxy': 'pages-api-error',
      },
    });
  }
}
