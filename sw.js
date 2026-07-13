const CACHE_VERSION = "v165";
const CORE_CACHE = `timenest-core-${CACHE_VERSION}`;
const IMAGE_CACHE = `timenest-images-${CACHE_VERSION}`;
const DATA_CACHE = `timenest-data-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets-manifest.js",
  "./assets/app-icon-pig-192.png",
  "./assets/app-icon-pig-512.png",
  "./assets/visual/card-pig-passport.svg",
  "./assets/visual/generated/world-map-handdrawn.png",
  "./assets/visual/generated/map-germany-route-handdrawn.png",
  "./assets/visual/generated/map-germany-tuebingen-handdrawn.png",
  "./assets/visual/generated/map-tuebingen-city-handdrawn.png",
  "./assets/visual/generated/card-germany-cities-sprite.png",
  "./assets/visual/generated/card-tuebingen-rewards-sprite.png",
  "./assets/visual/generated/card-tuebingen-handdrawn.png",
  "./assets/visual/generated/card-pig-passport-handdrawn.png"
];

const IMAGE_EXTENSIONS = /\.(?:avif|webp|png|jpg|jpeg|gif|svg)$/i;
const DATA_EXTENSIONS = /\.(?:json|js|css|webmanifest)$/i;
const MAX_IMAGE_ENTRIES = 90;
const MAX_DATA_ENTRIES = 35;

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map(key => cache.delete(key)));
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(cacheName)
      .then(cache => cache.put(request, copy))
      .then(() => trimCache(cacheName, maxEntries))
      .catch(() => {});
  }
  return response;
}

async function networkFirstHtml(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CORE_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match("./index.html");
  }
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  const allowed = new Set([CORE_CACHE, IMAGE_CACHE, DATA_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => !allowed.has(name)).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const wantsHtml = event.request.mode === "navigate"
    || event.request.headers.get("accept")?.includes("text/html");

  if (wantsHtml) {
    event.respondWith(networkFirstHtml(event.request));
    return;
  }

  if (sameOrigin && IMAGE_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
    return;
  }

  if (sameOrigin && DATA_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, DATA_CACHE, MAX_DATA_ENTRIES));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
