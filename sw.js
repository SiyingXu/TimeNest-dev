const CACHE_NAME = "timenest-pwa-v94";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/app-icon-pig-192.png",
  "./assets/app-icon-pig-512.png",
  "./assets/visual/card-pig-passport.svg",
  "./assets/visual/generated/world-map-handdrawn.png",
  "./assets/visual/generated/map-china-shanghai-handdrawn.png",
  "./assets/visual/generated/map-germany-route-handdrawn.png",
  "./assets/visual/generated/map-germany-tuebingen-handdrawn.png",
  "./assets/visual/generated/map-shanghai-city-handdrawn.png",
  "./assets/visual/generated/map-tuebingen-city-handdrawn.png",
  "./assets/visual/generated/map-freiburg-city-handdrawn.png",
  "./assets/visual/generated/map-stuttgart-city-handdrawn.png",
  "./assets/visual/generated/map-heidelberg-city-handdrawn.png",
  "./assets/visual/generated/map-frankfurt-city-handdrawn.png",
  "./assets/visual/generated/map-cologne-city-handdrawn.png",
  "./assets/visual/generated/map-aachen-city-handdrawn.png",
  "./assets/visual/generated/map-bremen-city-handdrawn.png",
  "./assets/visual/generated/map-hamburg-city-handdrawn.png",
  "./assets/visual/generated/map-lubeck-city-handdrawn.png",
  "./assets/visual/generated/map-berlin-city-handdrawn.png",
  "./assets/visual/generated/map-dresden-city-handdrawn.png",
  "./assets/visual/generated/map-leipzig-city-handdrawn.png",
  "./assets/visual/generated/map-nuremberg-city-handdrawn.png",
  "./assets/visual/generated/map-rothenburg-city-handdrawn.png",
  "./assets/visual/generated/map-ulm-city-handdrawn.png",
  "./assets/visual/generated/map-munich-city-handdrawn.png",
  "./assets/visual/generated/map-fussen-city-handdrawn.png",
  "./assets/visual/generated/pet-room-user-pink-v2.png",
  "./assets/visual/generated/pet-stamp-germany-sprite.png",
  "./assets/visual/generated/card-germany-cities-sprite.png",
  "./assets/visual/generated/card-tuebingen-rewards-sprite.png",
  "./assets/visual/generated/card-freiburg-rewards-sprite.png",
  "./assets/visual/generated/card-stuttgart-rewards-sprite.png",
  "./assets/visual/generated/card-heidelberg-rewards-sprite.png",
  "./assets/visual/generated/card-frankfurt-rewards-sprite.png",
  "./assets/visual/generated/card-cologne-rewards-sprite.png",
  "./assets/visual/generated/card-aachen-rewards-sprite.png",
  "./assets/visual/generated/card-bremen-rewards-sprite.png",
  "./assets/visual/generated/card-hamburg-rewards-sprite.png",
  "./assets/visual/generated/card-lubeck-rewards-sprite.png",
  "./assets/visual/generated/card-berlin-rewards-sprite.png",
  "./assets/visual/generated/card-dresden-rewards-sprite.png",
  "./assets/visual/generated/card-leipzig-rewards-sprite.png",
  "./assets/visual/generated/card-nuremberg-rewards-sprite.png",
  "./assets/visual/generated/card-rothenburg-rewards-sprite.png",
  "./assets/visual/generated/card-ulm-rewards-sprite.png",
  "./assets/visual/generated/card-munich-rewards-sprite.png",
  "./assets/visual/generated/card-fussen-rewards-sprite.png",
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

  const wantsHtml = event.request.mode === "navigate"
    || event.request.headers.get("accept")?.includes("text/html");

  if (wantsHtml) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

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
