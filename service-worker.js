const CACHE = "rider-prod-v1.3.0";

const FILES = [
  "./",
  "./index.html",
  "./app.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;

  if (req.destination === "image") {
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(r => r || fetch(req))
  );
});
