/* Cache dei soli file dell'app: i video restano in streaming da YouTube. Cambiare VERSION a ogni rilascio.
   GitHub Pages manda max-age=600: senza cache:"reload"/"no-cache" il service worker servirebbe
   e salverebbe per 10 minuti la versione vecchia anche dopo un aggiornamento. */
const VERSION = "scheda-shara-v8";
const SHELL = ["./", "index.html", "app.js", "config.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // rete prima (rivalidata col server), cache se offline
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" })
      .then(r => { if (r.ok) { const c = r.clone(); caches.open(VERSION).then(k => k.put(e.request, c)); } return r; })
      .catch(() => caches.match(e.request).then(m => m || caches.match("index.html")))
  );
});
