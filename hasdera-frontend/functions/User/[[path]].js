const BACKEND_ORIGIN = "https://hasderanewsletter-2025.onrender.com";

export async function onRequest({ request, params }) {
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

  const targetUrl = new URL(`/api/User/${rest}`, BACKEND_ORIGIN);
  targetUrl.search = incomingUrl.search;

  // העברת method + body, ושמירה על headers קריטיים
  const headers = new Headers();
  const authHeader = request.headers.get('Authorization');
  if (authHeader) headers.set('Authorization', authHeader);
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);
  const accept = request.headers.get('Accept');
  if (accept) headers.set('Accept', accept);

  // Clone request body if needed (for POST/PUT requests)
  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.clone().arrayBuffer();
  }

  const proxiedRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers,
    body: body,
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
