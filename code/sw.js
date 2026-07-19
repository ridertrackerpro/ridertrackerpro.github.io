const CACHE_NAME = 'registro-gps-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Solo GET, e solo stesse origine (mai intercettare chiamate GPS/rete esterne)
  if (e.request.method !== 'GET') return;

  // NETWORK-FIRST: prova sempre la rete per avere l'ultima versione;
  // usa la cache solo come fallback se offline. Così ogni aggiornamento
  // caricato su GitHub viene visto subito, senza restare bloccati su una
  // versione vecchia salvata in cache.
  e.respondWith(
    fetch(e.request).then(function(res){
      if (res && res.status === 200 && res.type === 'basic') {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(e.request, resClone);
        });
      }
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(cached){
        if (cached) return cached;
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
