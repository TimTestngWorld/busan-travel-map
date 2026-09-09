/* 釜山旅行地圖 Beta 2.12.12 — navigation-safe installable PWA */
const VERSION='2.12.12';
const CACHE='busan-travel-shell-'+VERSION;
const OFFLINE='./offline.html';
const CORE=[OFFLINE,'./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-512-maskable.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.allSettled(CORE.map(u=>c.add(new Request(u,{cache:'reload'}))));await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('busan-travel-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();if(event.data==='GET_VERSION')event.source?.postMessage({type:'PWA_VERSION',version:VERSION})});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;if(req.mode==='navigate')event.respondWith((async()=>{try{return await fetch(new Request(req,{cache:'no-store'}))}catch(_){return (await caches.match(OFFLINE))||Response.error()}})())});
