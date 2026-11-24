// PWA v0.28: アプリ本体のみをオフライン保存。レシピ/写真は端末のlocalStorage内。
const CACHE_NAME = 'amari-kondate-pwa-v028';
const APP_FILES = ['./index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
const BASE_URL = new URL('./', self.registration.scope);
const HOME_URL = new URL('./index.html', BASE_URL).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(APP_FILES))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('amari-kondate-pwa-') && k !== CACHE_NAME).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const reqURL = new URL(req.url);
  if (reqURL.origin !== self.location.origin || !reqURL.href.startsWith(BASE_URL.href)) return;
  if (req.mode === 'navigate') {
    event.respondWith(caches.match(HOME_URL).then(cached => cached || fetch(req)));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
