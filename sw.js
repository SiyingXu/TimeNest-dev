const CACHE_NAME = "timenest-pwa-v9";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/app-icon-pig-192.png",
  "./assets/app-icon-pig-512.png",
  "./assets/visual/card-pig-passport.svg",
  "./assets/visual/generated/world-map-handdrawn.png",
  "./assets/visual/generated/map-china-shanghai-handdrawn.png",
  "./assets/visual/generated/map-germany-tuebingen-handdrawn.png",
  "./assets/visual/generated/map-shanghai-city-handdrawn.png",
  "./assets/visual/generated/map-tuebingen-city-handdrawn.png",
  "./assets/visual/generated/card-shanghai-handdrawn.png",
  "./assets/visual/generated/card-tuebingen-handdrawn.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
