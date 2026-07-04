const MYD1_CACHE = "myd1-pwa-v1";
const CORE_ROUTES = ["/", "/app", "/locked-in", "/sports", "/search", "/brand/MYD1 LOGO.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(MYD1_CACHE).then((cache) => cache.addAll(CORE_ROUTES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== MYD1_CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(MYD1_CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/app"))));
});
