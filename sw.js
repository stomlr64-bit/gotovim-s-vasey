// Простой офлайн-кэш: оболочка приложения и просмотренные картинки.
// Рецепты и страница берутся из сети первыми, чтобы новые рецепты появлялись сразу.
const VERSION = 'gotovim-v1';
const SHELL = ['./', 'index.html', 'app.js', 'extras.js', 'extras.css', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'data/recipes.json', 'data/translations.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  const isImage = /\.(png|jpe?g|webp|gif|svg)$/i.test(url.pathname);
  if (isImage) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
      return res;
    })));
    return;
  }

  e.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(VERSION).then(c => c.put(req, copy));
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true })));
});
