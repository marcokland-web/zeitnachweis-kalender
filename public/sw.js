// Service Worker: hält die App-Hülle für den Start ohne Netz bereit. Netz zuerst, Ablage nur als Rückfall.
const CACHE = "zeitnachweis-2026-11-11.3";
const SHELL = ["./", "style.css", "app.js", "early.js", "manifest.webmanifest?v=1", "icons/icon.svg?v=1", "icons/icon-192.png?v=1"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match("./")))
  );
});
