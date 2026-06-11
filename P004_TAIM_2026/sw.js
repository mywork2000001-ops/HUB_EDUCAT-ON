'use strict';

const CACHE = 'taim-v12';

const ASSETS = [
  './',
  './index.html',
  './quiz.html',
  './style.css',
  './engine.js',
  './protect.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './test-1.html',
  './test-2.html',
  './test-3.html',
  './test-4.html',
  './test-5.html',
  './test-6.html',
  './test-7.html',
  './test-8.html',
  './test-9.html',
  './test-10.html',
  './test-11.html',
  './test-12.html',
  './test-13.html',
  './test-14.html',
  './test-15.html',
  './test-16.html',
  './test-17.html',
  './test-18.html',
  './test-19.html',
  './test-20.html',
  './test-21.html',
  './test-22.html',
  './test-23.html',
  './test-24.html',
  './test-25.html',
  './test-26.html',
  './test-27.html',
  './test-28.html',
  './test-29.html',
  './test-30.html',
  './test-31.html',
  './test-32.html',
  './test-33.html',
  './test-34.html',
  './test-35.html',
  './test-36.html',
  './test-37.html',
  './test-38.html',
  './test-fs1.html',
  './test-fs2.html',
  './test-fs3.html',
  './test-fs4.html',
  './test-fs5.html',
  './test-fs6.html',
  './test-us1.html',
  './test-us2.html',
  './test-us3.html',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
