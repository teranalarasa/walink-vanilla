var CACHE_NAME = "walink";
var ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/countries.js",
  "/js/i18n.js",
  "/js/normalizePhone.js",
  "/js/app.js",
  "/manifest.json",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) {
            return k !== CACHE_NAME;
          })
          .map(function (k) {
            return caches.delete(k);
          }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(function () {
        return caches.match(e.request);
      }),
  );
});
