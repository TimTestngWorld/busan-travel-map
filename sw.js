/* 釜山旅行地圖 Beta 2.12 Final HF2 — network-first, versioned offline shell */
const VERSION='2.12-final-hf2';
const CACHE='busan-travel-shell-'+VERSION;
const APP_SHELL='./index.html';
const OFFLINE='./offline.html';
const CORE=[
  APP_SHELL,
  OFFLINE,
  './app-config.js',
  './data/city.json',
  './data/poi-data.json',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];
const VENDOR=[
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-image@0.4.0/leaflet-image.js'
];
const CORE_PATHS=new Set(CORE.map(u=>new URL(u,self.registration.scope).pathname));
const VENDOR_URLS=new Set(VENDOR);

async function fetchFresh(request){
  return fetch(new Request(request,{cache:'no-store'}));
}
async function updateCache(key,response){
  if(response && (response.ok || response.type==='opaque')){
    try{const c=await caches.open(CACHE);await c.put(key,response.clone())}catch(_){}
  }
  return response;
}

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  await Promise.allSettled([...CORE,...VENDOR].map(async url=>{
    try{
      const r=await fetch(url,{cache:'reload'});
      if(r.ok || r.type==='opaque')await c.put(url,r);
    }catch(_){}
  }));
  await self.skipWaiting();
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('busan-travel-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));

self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING')self.skipWaiting();
  if(event.data==='GET_VERSION')event.source?.postMessage({type:'PWA_VERSION',version:VERSION,label:'2.12 Final HF2'});
});

self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);

  // HTML navigation is always network-first/no-store so a prior PWA cannot lock an old release.
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const r=await fetchFresh(req);
        if(r.ok)await updateCache(APP_SHELL,r.clone());
        return r;
      }catch(_){
        return (await caches.match(APP_SHELL)) || (await caches.match(OFFLINE)) || Response.error();
      }
    })());
    return;
  }

  // Only cache the local app core and fixed Leaflet libraries. API calls, photos, weather and map tiles stay online-only.
  const isCore=url.origin===self.location.origin && CORE_PATHS.has(url.pathname);
  const isVendor=VENDOR_URLS.has(req.url);
  if(isCore || isVendor){
    event.respondWith((async()=>{
      try{return await updateCache(req,await fetchFresh(req))}
      catch(_){return (await caches.match(req)) || Response.error()}
    })());
  }
});
