const BACKEND_ORIGIN = "https://hasderanewsletter-2025.onrender.com";

export async function onRequest({ request, params }) {
  const incomingUrl = new URL(request.url);

  const splat = params?.path;
  const rest = Array.isArray(splat) ? splat.join("/") : (splat ?? "");

  const targetUrl = new URL(`/api/User/${rest}`, BACKEND_ORIGIN);
  targetUrl.search = incomingUrl.search;

  const proxiedRequest = new Request(targetUrl.toString(), request);
  return fetch(proxiedRequest);
}
