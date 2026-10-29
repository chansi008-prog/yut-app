// 윷놀이 한판 서비스 워커: 앱 파일을 저장해 두어 인터넷이 약한 모임 장소에서도 열리게 한다
const VERSION = "yut-v6";
const CORE = ["./", "index.html", "manifest.webmanifest", ...["tiger","rabbit","jindo","bengal","dragon","snake","horse","sheep","monkey","rooster","soccer","helmet","bear","panda","fox","pig","chick","frog","cow","koala","hamster","mouse","penguin","lion"].map(k => `animals/${k}.png`), "icons/icon-192-v1.png", "icons/icon-512-v1.png", "icons/apple-touch-icon-v1.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 저장본을 먼저 보여 주고, 뒤에서 새 파일을 받아 둔다 (글꼴 포함)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const same = url.origin === location.origin;
  if (!same && !url.host.endsWith("fonts.googleapis.com") && !url.host.endsWith("fonts.gstatic.com")) return;
  const key = e.request.mode === "navigate" ? "index.html" : e.request;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(key);
    const net = fetch(e.request).then(r => { if (r.ok || r.type === "opaque") c.put(key, r.clone()); return r; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
