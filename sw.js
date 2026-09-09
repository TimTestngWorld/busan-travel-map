/* 釜山旅行地圖 Beta 2.12.9 — stability-first PWA worker */
const VERSION='2.12.9';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys()) if(key.startsWith('busan-travel-')) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();if(event.data==='GET_VERSION')event.source?.postMessage({type:'PWA_VERSION',version:VERSION})});
// Intentionally no fetch handler in the emergency stable build: GitHub always serves the live app.
