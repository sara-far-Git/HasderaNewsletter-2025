const BACKEND_ORIGIN = "https://hasderanewsletter-2025.onrender.com";

export async function onRequest({ request, params }) {
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
  const splat = params?.path;
  const rest = Array.isArray(splat) ? splat.join("/") : (splat ?? "");

  const targetUrl = new URL(`/api/${rest}`, BACKEND_ORIGIN);
  targetUrl.search = incomingUrl.search;

  const proxiedRequest = new Request(targetUrl.toString(), request);

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
