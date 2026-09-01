/* Service Worker — English Defense PWA
   Chiến lược: network-first cho HTML/JS/CSS (luôn cập nhật khi online),
   cache fallback để dùng được offline. */
const VERSION = "3.0.1"; // PHẢI khớp ?v= trong index.html
const CACHE = "english-defense-v5-" + VERSION;
const CORE = [
  "./",
  "./index.html",
  "./assets/css/style.css?v=" + VERSION,
  "./assets/js/fsrs.js?v=" + VERSION,
  "./assets/js/seed.js?v=" + VERSION,
  "./assets/js/roadmap.js?v=" + VERSION,
  "./assets/js/content.js?v=" + VERSION,
  "./assets/js/store.js?v=" + VERSION,
  "./assets/js/ui.js?v=" + VERSION,
  "./assets/js/rec.js?v=" + VERSION,
  "./assets/js/ai.js?v=" + VERSION,
  "./assets/js/views-core.js?v=" + VERSION,
  "./assets/js/views-vocab.js?v=" + VERSION,
  "./assets/js/views-pron.js?v=" + VERSION,
  "./assets/js/views-shadow.js?v=" + VERSION,
  "./assets/js/views-ai.js?v=" + VERSION,
  "./assets/js/views-defense.js?v=" + VERSION,
  "./assets/js/app.js?v=" + VERSION,
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
      .catch(() => caches.match(req).then((r) => {
        if (r) return r;
        // chỉ điều hướng trang mới rơi về index.html — KHÔNG trả HTML cho
        // request JS/CSS (tránh "Unexpected token <" khi cache thiếu file)
        if (req.mode === "navigate") return caches.match("./index.html");
        return new Response("", { status: 504, statusText: "offline" });
      }))
  );
});
