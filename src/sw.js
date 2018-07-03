self.addEventListener('install', event => {
  let cachingPromise = caches.open('v1')
    .then(cache => {
      return cache.addAll([
        'main.js',
        'polyfills.js',
        'runtime.js',
        'styles.js',
        'vendor.js',
        'favicon.ico',
        'index.html',
        'assets/logo.png',
        'assets/manifest.json',
      ]);
    });

  event.waitUntil(cachingPromise);
});

self.addEventListener('fetch', event => {
  let cachedResponsePromise = caches.open('v1')
    .then(cache => cache.match(event.request))
    .then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
    .catch(error => {
      console.error(error);
      throw error;
    })

  event.respondWith(cachedResponsePromise);
});