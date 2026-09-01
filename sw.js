/* Service Worker — English Defense PWA
   Chiến lược: network-first cho HTML/JS/CSS (luôn cập nhật khi online),
   cache fallback để dùng được offline. */
const CACHE = "english-defense-v4";
const CORE = [
  "./",
  "./index.html",
  "./assets/css/style.css",
  "./assets/js/fsrs.js",
  "./assets/js/seed.js",
  "./assets/js/roadmap.js",
  "./assets/js/content.js",
  "./assets/js/store.js",
  "./assets/js/ui.js",
  "./assets/js/rec.js",
  "./assets/js/ai.js",
  "./assets/js/views-core.js",
  "./assets/js/views-vocab.js",
  "./assets/js/views-pron.js",
  "./assets/js/views-shadow.js",
  "./assets/js/views-ai.js",
  "./assets/js/views-defense.js",
  "./assets/js/app.js",
  "./assets/favicon.svg",
  "./manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Chỉ xử lý tài nguyên cùng gốc; để trình duyệt tự lo YouTube/fonts/API
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
  );
});
