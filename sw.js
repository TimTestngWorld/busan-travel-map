/* 釜山旅行地圖 Beta 2.12.4 PWA Service Worker */
const VERSION = '2.12.4';
const CORE_CACHE = `busan-travel-core-${VERSION}`;
const RUNTIME_CACHE = `busan-travel-runtime-${VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './app-config.js',
  './data/city.json',
  './data/poi-data.json',
  './manifest.webmanifest',
  './offline.html',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];
const OPTIONAL_LIBS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-image@0.4.0/leaflet-image.js'
];

async function putFresh(cache, url) {
  const res = await fetch(url, { cache: 'reload' });
  if (!res || !res.ok) throw new Error(`precache ${url} ${res?.status || 'failed'}`);
  await cache.put(url, res.clone());
}
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache = await caches.open(CORE_CACHE);
    // Never let the browser HTTP cache seed a new PWA cache with the previous Beta.
    await Promise.all(CORE_ASSETS.map(url => putFresh(cache, url)));
    await Promise.allSettled(OPTIONAL_LIBS.map(async url => {
      const res = await fetch(url, { mode: 'no-cors', cache: 'reload' });
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
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(c => c.postMessage({ type:'SW_ACTIVATED', version:VERSION }));
  })());
});

function isLocalCore(url) {
  if (url.origin !== self.location.origin) return false;
  const p = url.pathname;
  return /\/(?:index\.html|app-config\.js|manifest\.webmanifest|offline\.html)$/.test(p) || /\/data\/(?:city|poi-data)\.json$/.test(p);
}
function shouldBypass(request, url) {
  if (request.method !== 'GET') return true;
  if (url.origin === self.location.origin) return false;
  const host = url.hostname.toLowerCase();
  if (host.includes('supabase.co') || host.includes('googleapis.com') || host.includes('googleusercontent.com') || host.includes('gstatic.com')) return true;
  if (host.includes('kakao') || host.includes('daumcdn') || host.includes('openstreetmap') || host.includes('openstreetmap.fr') || host.includes('nominatim')) return true;
  if (host.includes('airport.co.kr') || host.includes('busan.go.kr')) return true;
  return false;
}
async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CORE_CACHE);
  try {
    // Critical: bypass both browser HTTP cache and old SW cache for HTML/core version checks.
    const freshRequest = new Request(request, { cache: 'no-store' });
    const res = await fetch(freshRequest);
    if (res && res.ok && request.method === 'GET') await cache.put(request, res.clone());
    return res;
  } catch (_) {
    return (await cache.match(request, { ignoreSearch:true })) || (fallbackUrl ? await cache.match(fallbackUrl, { ignoreSearch:true }) : undefined) || Response.error();
  }
}
async function cacheFirst(request) {
  const core = await caches.open(CORE_CACHE);
  const hit = await core.match(request, { ignoreSearch:true });
  if (hit) return hit;
  const runtime = await caches.open(RUNTIME_CACHE);
  const rhit = await runtime.match(request);
  if (rhit) return rhit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === 'opaque')) await runtime.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html').catch(async()=> (await caches.match('./offline.html')) || Response.error()));
    return;
  }
  if (shouldBypass(request, url)) return;
  if (isLocalCore(url)) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (OPTIONAL_LIBS.includes(url.href) || (url.origin === self.location.origin && /\/icons\//.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'GET_VERSION') event.source?.postMessage({ type:'PWA_VERSION', version:VERSION });
});
