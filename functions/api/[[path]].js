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
  return fetch(proxiedRequest);
}
