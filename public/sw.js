// Offline: a página vem da rede quando dá (atualização na hora) e do cache quando não dá;
// os arquivos com hash no nome (assets/) nunca mudam, então saem direto do cache.
// Só o que é deste site: Discord, imagens de fora e o resto passam direto, sem cache.
const CACHE = 'ficha-rpg-v1';

// A página inicial entra já na instalação: o primeiro acesso offline não depende de ter navegado antes.
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.add('./')).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) =>
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())),
);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const guardar = (res) => {
    // Clona já: depois que a página lê o corpo, clonar falha (e em silêncio).
    if (res.ok) {
      const copia = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copia));
    }
    return res;
  };
  if (url.pathname.includes('/assets/')) {
    e.respondWith(caches.match(req).then((achou) => achou || fetch(req).then(guardar)));
  } else {
    e.respondWith(fetch(req).then(guardar).catch(() => caches.match(req).then((achou) => achou || caches.match('./'))));
  }
});
