const BACKEND_ORIGIN = "https://hasderanewsletter-2025.onrender.com";

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`/api/Issues`, BACKEND_ORIGIN);
  targetUrl.search = incomingUrl.search;

  // בניית headers חדשים - רק אלה שצריך להעביר
  const headers = new Headers();
  // העברת Authorization header (חשוב מאוד!)
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }
  // העברת Content-Type אם קיים
  const contentType = request.headers.get('Content-Type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  // העברת headers נוספים אם צריך
  const accept = request.headers.get('Accept');
  if (accept) {
    headers.set('Accept', accept);
  }

  // העברת method, headers, ו-body
  const proxiedRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers: headers,
    body: request.body,
  });

  const response = await fetch(proxiedRequest);
  
  // העברת ה-headers מה-response (כולל CORS)
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

