/* 釜山旅行地圖 Beta 2.12.7 PWA Service Worker */
const VERSION = '2.12.7';
const CORE_CACHE = `busan-travel-core-${VERSION}`;
const RUNTIME_CACHE = `busan-travel-runtime-${VERSION}`;
const OFFLINE_HTML = './offline.html';
const OFFLINE_APP = './index.html';
const CORE_ASSETS = [
  './index.html','./app-config.js','./data/city.json','./data/poi-data.json',
  './manifest.webmanifest','./offline.html',
  './icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-512-maskable.png'
];
const OPTIONAL_LIBS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-image@0.4.0/leaflet-image.js'
];
async function fetchFresh(url, init={}) {
  return fetch(url, { ...init, cache:'no-store' });
}
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache = await caches.open(CORE_CACHE);
    // Best effort: one temporary asset failure must never strand users on an older Service Worker.
    await Promise.allSettled(CORE_ASSETS.map(async url => {
      const res = await fetchFresh(url);
      if (res && res.ok) await cache.put(url, res.clone());
    }));
    await Promise.allSettled(OPTIONAL_LIBS.map(async url => {
      const res = await fetch(url, { mode:'no-cors', cache:'reload' });
      await cache.put(url, res);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keep = new Set([CORE_CACHE, RUNTIME_CACHE]);
    for (const key of await caches.keys()) {
      if (key.startsWith('busan-travel-') && !keep.has(key)) await caches.delete(key);
    }
    await self.clients.claim();
    const clients = await self.clients.matchAll({type:'window',includeUncontrolled:true});
    clients.forEach(c=>c.postMessage({type:'SW_ACTIVATED',version:VERSION}));
  })());
});
function isSameOrigin(url){return url.origin===self.location.origin}
function isCoreData(url){return /\/data\/(?:city|poi-data)\.json$/.test(url.pathname)||/\/(?:app-config\.js|manifest\.webmanifest|offline\.html)$/.test(url.pathname)}
function bypassThirdParty(request,url){
  if(request.method!=='GET')return true;
  if(isSameOrigin(url))return false;
  const h=url.hostname.toLowerCase();
  return h.includes('supabase.co')||h.includes('googleapis.com')||h.includes('googleusercontent.com')||h.includes('gstatic.com')||h.includes('kakao')||h.includes('daumcdn')||h.includes('openstreetmap')||h.includes('openstreetmap.fr')||h.includes('nominatim')||h.includes('airport.co.kr')||h.includes('busan.go.kr');
}
async function freshNavigation(request){
  const cache=await caches.open(CORE_CACHE);
  try{
    const res=await fetchFresh(request);
    if(res&&res.ok)await cache.put(OFFLINE_APP,res.clone());
    return res;
  }catch(_){
    return (await cache.match(OFFLINE_APP))||(await cache.match(OFFLINE_HTML))||Response.error();
  }
}
async function networkFirstCore(request){
  const cache=await caches.open(CORE_CACHE);
  try{const res=await fetchFresh(request);if(res&&res.ok)await cache.put(request,res.clone());return res}catch(_){return (await cache.match(request,{ignoreSearch:true}))||Response.error()}
}
async function cacheFirst(request){
  const core=await caches.open(CORE_CACHE);const hit=await core.match(request,{ignoreSearch:true});if(hit)return hit;
  const runtime=await caches.open(RUNTIME_CACHE);const rh=await runtime.match(request,{ignoreSearch:true});if(rh)return rh;
  const res=await fetch(request);if(res&&(res.ok||res.type==='opaque'))await runtime.put(request,res.clone());return res;
}
self.addEventListener('fetch', event => {
  const request=event.request,url=new URL(request.url);
  // These files are the recovery/update escape hatch. Never let any SW cache them.
  if(isSameOrigin(url)&&(/\/reset-pwa\.html$/.test(url.pathname)||/\/version\.json$/.test(url.pathname)||/\/sw\.js$/.test(url.pathname)))return;
  if(request.mode==='navigate'){event.respondWith(freshNavigation(request));return;}
  if(bypassThirdParty(request,url))return;
  if(isSameOrigin(url)&&isCoreData(url)){event.respondWith(networkFirstCore(request));return;}
  if(OPTIONAL_LIBS.includes(url.href)||(isSameOrigin(url)&&/\/icons\//.test(url.pathname))){event.respondWith(cacheFirst(request));}
});
self.addEventListener('message', event => {
  if(event.data==='SKIP_WAITING')self.skipWaiting();
  if(event.data==='GET_VERSION')event.source?.postMessage({type:'PWA_VERSION',version:VERSION});
  if(event.data==='CLEAR_APP_CACHES')event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('busan-travel-'))await caches.delete(k)})());
});
