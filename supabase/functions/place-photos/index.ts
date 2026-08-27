const GOOGLE_BASE = "https://places.googleapis.com/v1";
const GOOGLE_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

type PoiRequest = {
  action?: "photos" | "resolveNaver" | "resolvePlace" | "searchExchanges" | "airportCheck";
  poiId?: string;
  name?: string;
  display?: string;
  address?: string;
  lat?: number;
  lon?: number;
  placeId?: string;
  maxPhotos?: number;
  naverUrl?: string;
  cityName?: string;
  cityLat?: number;
  cityLon?: number;
};

function cors(origin: string | null) {
  const allow = ALLOWED_ORIGIN === "*" ? "*" : (origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : ALLOWED_ORIGIN);
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(data: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(data), { status, headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000, r = (v: number) => v * Math.PI / 180;
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
async function googleFetch(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {}); headers.set("X-Goog-Api-Key", GOOGLE_KEY);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) { const text = await res.text(); throw new Error(`GOOGLE_API_${res.status}: ${text.slice(0, 500)}`); }
  return res;
}
async function details(placeId: string) {
  const fields = "id,displayName,formattedAddress,location,primaryType,primaryTypeDisplayName,types,photos,googleMapsUri";
  const res = await googleFetch(`${GOOGLE_BASE}/places/${encodeURIComponent(placeId)}?languageCode=ko&regionCode=KR`, { headers: { "X-Goog-FieldMask": fields } });
  return await res.json();
}
async function searchPlace(body: PoiRequest, radius = 2000) {
  const lat = Number(body.lat), lon = Number(body.lon);
  const query = [body.name || body.display, body.address].filter(Boolean).join(" ").trim();
  if (!query) return null;
  const reqBody: Record<string, unknown> = { textQuery: query, languageCode: "ko", regionCode: "KR", maxResultCount: 5 };
  if (Number.isFinite(lat) && Number.isFinite(lon)) reqBody.locationBias = { circle: { center: { latitude: lat, longitude: lon }, radius: Math.max(500, Math.min(50000, radius)) } };
  const res = await googleFetch(`${GOOGLE_BASE}/places:searchText`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.primaryTypeDisplayName,places.types,places.photos,places.googleMapsUri" },
    body: JSON.stringify(reqBody),
  });
  const data = await res.json(); const places = Array.isArray(data.places) ? data.places : [];
  if (!places.length) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return places[0];
  const ranked = places.map((p: any) => { const pl = p.location || {}; const d = Number.isFinite(pl.latitude) && Number.isFinite(pl.longitude) ? haversineM(lat, lon, pl.latitude, pl.longitude) : 999999; return { p, d }; }).sort((a: any, b: any) => a.d - b.d);
  if (!ranked[0] || ranked[0].d > Math.max(2500, radius * 1.2)) return null;
  return ranked[0].p;
}
async function photoUrl(photoName: string) {
  const res = await googleFetch(`${GOOGLE_BASE}/${photoName}/media?maxWidthPx=1100&maxHeightPx=800&skipHttpRedirect=true`);
  const data = await res.json(); return data.photoUri || "";
}
function decodeHtml(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}
function cleanNaverTitle(s: string) {
  return decodeHtml((s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).replace(/\s*[-|]\s*네이버\s*지도\s*$/i, "").trim();
}
function titleFromHtml(html: string) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (og) return cleanNaverTitle(og[1]);
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i); return m ? cleanNaverTitle(m[1]) : "";
}
function naverStructuredHints(html: string) {
  const src = String(html || "").replace(/\\"/g, '"');
  const pick = (keys: string[]) => {
    for (const k of keys) {
      const re = new RegExp(`"${k}"\\s*:\\s*"([^"]{1,180})"`, "i"), m = src.match(re);
      if (m?.[1]) return decodeHtml(m[1].replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))));
    }
    return "";
  };
  const num = (keys: string[]) => {
    for (const k of keys) {
      const re = new RegExp(`"${k}"\\s*:\\s*"?(-?\\d{1,3}\\.\\d+)"?`, "i"), m = src.match(re);
      if (m?.[1]) { const v = Number.parseFloat(m[1]); if (Number.isFinite(v)) return v; }
    }
    return NaN;
  };
  const name = pick(["businessName","placeName","name"]), address = pick(["roadAddress","address"]);
  let lon = num(["longitude","x"]), lat = num(["latitude","y"]);
  if (!(Number.isFinite(lat) && Number.isFinite(lon) && lat > 30 && lat < 40 && lon > 120 && lon < 135)) { lat = NaN; lon = NaN; }
  return { name, address, lat, lon };
}
function naverSearchCandidates(name: string) {
  const raw = cleanNaverTitle(name); const out = [raw];
  let short = raw.replace(/[（(][^）)]*[）)]/g, " ").replace(/\s+/g, " ").trim();
  short = short.replace(/\s+(택시|차로|찍는|찍을|가는|여기로|여기서|여기)\b.*$/i, "").trim();
  if (short && short !== raw) out.push(short);
  return [...new Set(out.filter(x => x.length >= 2))];
}
function parseCoords(urlText: string) {
  try {
    const u = new URL(urlText);
    const latRaw = u.searchParams.get("lat") || u.searchParams.get("y");
    const lonRaw = u.searchParams.get("lng") || u.searchParams.get("lon") || u.searchParams.get("x");
    if (latRaw && lonRaw) { const lat = Number.parseFloat(latRaw), lon = Number.parseFloat(lonRaw); if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(Math.abs(lat) < .0001 && Math.abs(lon) < .0001)) return { lat, lon }; }
    const c = u.searchParams.get("c");
    if (c) { const nums = c.split(",").map(v => Number.parseFloat(v)); if (nums.length >= 2) { const lon = nums[0], lat = nums[1]; if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon }; } }
  } catch (_) {}
  return { lat: NaN, lon: NaN };
}
function parseNaverPlaceId(urlText: string) { const m = String(urlText || "").match(/(?:entry\/place|place)\/(\d+)/i); return m?.[1] || ""; }
function categoryFromGoogle(place: any) {
  const types = [place?.primaryType, ...(Array.isArray(place?.types) ? place.types : [])].filter(Boolean).map((x: any) => String(x).toLowerCase());
  const has = (...keys: string[]) => keys.some(k => types.includes(k));
  if (has("restaurant","meal_takeaway","meal_delivery","food")) return "餐廳";
  if (has("cafe","coffee_shop","bakery","dessert_shop")) return "咖啡廳";
  if (has("bar","pub","night_club")) return "酒吧";
  if (has("lodging","hotel","motel","hostel","guest_house")) return "住宿";
  if (has("shopping_mall","department_store","store","clothing_store","market")) return "購物";
  if (has("airport","train_station","subway_station","bus_station","transit_station")) return "交通";
  if (has("hospital","police","post_office","city_hall","local_government_office")) return "公共設施";
  if (has("amusement_park","aquarium","movie_theater","spa","bowling_alley","gym")) return "休閒娛樂";
  if (has("tourist_attraction","museum","park","landmark","historical_landmark","beach","place_of_worship")) return "旅遊景點";
  return "旅遊景點";
}
async function fetchNaverPage(url: string) {
  const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; TravelMap/1.0)", "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6" } });
  const text = await res.text(); return { finalUrl: res.url || url, text };
}
async function resolveNaver(body: PoiRequest) {
  const raw = String(body.naverUrl || "").trim(); if (!raw) throw new Error("NAVER_URL_REQUIRED");
  let input: URL; try { input = new URL(raw); } catch (_) { throw new Error("INVALID_NAVER_URL"); }
  const host = input.hostname.toLowerCase(); if (!(host === "naver.me" || host.endsWith("naver.com"))) throw new Error("INVALID_NAVER_URL");
  let finalUrl = raw, html = ""; const pages: string[] = [];
  try { const r = await fetchNaverPage(raw); finalUrl = r.finalUrl; html = r.text; pages.push(r.text); } catch (_) {}
  const placeId = parseNaverPlaceId(finalUrl) || parseNaverPlaceId(raw);
  if (placeId) {
    for (const u of [`https://pcmap.place.naver.com/place/${placeId}/home`, `https://map.naver.com/p/entry/place/${placeId}`, `https://pcmap.place.naver.com/place/${placeId}/home?from=map&locale=ko&svcName=map_pcv5`]) {
      try { const r = await fetchNaverPage(u); pages.push(r.text); if (!finalUrl || finalUrl === raw) finalUrl = r.finalUrl; } catch (_) {}
    }
  }
  let name = "", address = "", coords = parseCoords(finalUrl); if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lon)) coords = parseCoords(raw);
  for (const page of pages) { const hints = naverStructuredHints(page); if (!name) name = hints.name || titleFromHtml(page); if (!address) address = hints.address; if ((!Number.isFinite(coords.lat) || !Number.isFinite(coords.lon)) && Number.isFinite(hints.lat) && Number.isFinite(hints.lon)) coords = { lat: hints.lat, lon: hints.lon }; }
  const cityLat = Number(body.cityLat), cityLon = Number(body.cityLon), biasLat = Number.isFinite(coords.lat) ? coords.lat : cityLat, biasLon = Number.isFinite(coords.lon) ? coords.lon : cityLon;
  let place: any = null;
  for (const q of naverSearchCandidates(name)) { place = await searchPlace({ name: q, address: address || body.cityName || "", lat: biasLat, lon: biasLon }, Number.isFinite(coords.lat) ? 6000 : 50000); if (place?.id) break; }
  if (!place?.id && name) for (const q of naverSearchCandidates(name)) { place = await searchPlace({ name: q, address: body.cityName || "", lat: cityLat, lon: cityLon }, 50000); if (place?.id) break; }
  const pLat = Number(place?.location?.latitude), pLon = Number(place?.location?.longitude), lat = Number.isFinite(pLat) ? pLat : coords.lat, lon = Number.isFinite(pLon) ? pLon : coords.lon;
  if (!name && place?.displayName?.text) name = place.displayName.text;
  const valid = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(Math.abs(lat) < .0001 && Math.abs(lon) < .0001);
  if (!valid) throw new Error("NAVER_PLACE_NOT_RESOLVED");
  return { naverPlaceId: placeId, finalUrl, displayName: place?.displayName?.text || name || `Naver Place ${placeId}`, address: place?.formattedAddress || address || "", lat, lon, googlePlaceId: place?.id || "", primaryType: place?.primaryType || "", category: place ? categoryFromGoogle(place) : "旅遊景點", googleMapsUri: place?.googleMapsUri || "" };
}


function businessStatusZh(s: string) {
  if (s === "OPERATIONAL") return "營業中";
  if (s === "CLOSED_TEMPORARILY") return "暫時停業";
  if (s === "CLOSED_PERMANENTLY") return "永久停業";
  if (s === "FUTURE_OPENING") return "即將開業";
  return "";
}
async function resolvePlace(body: PoiRequest) {
  const cityLat = Number(body.cityLat), cityLon = Number(body.cityLon);
  const place = await searchPlace({ name: body.name || body.display, address: body.address || body.cityName || "", lat: cityLat, lon: cityLon }, 50000);
  if (!place?.id) throw new Error("PLACE_NOT_RESOLVED");
  return {
    googlePlaceId: place.id,
    displayName: place?.displayName?.text || "",
    address: place?.formattedAddress || "",
    lat: Number(place?.location?.latitude),
    lon: Number(place?.location?.longitude),
    category: categoryFromGoogle(place),
    primaryType: place?.primaryType || "",
    googleMapsUri: place?.googleMapsUri || "",
  };
}
async function searchExchangeQuery(textQuery: string, lat: number, lon: number) {
  const reqBody: Record<string, unknown> = { textQuery, languageCode: "ko", regionCode: "KR", pageSize: 12 };
  if (Number.isFinite(lat) && Number.isFinite(lon)) reqBody.locationBias = { circle: { center: { latitude: lat, longitude: lon }, radius: 40000 } };
  const fields = "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.primaryTypeDisplayName,places.types,places.googleMapsUri,places.businessStatus";
  const res = await googleFetch(`${GOOGLE_BASE}/places:searchText`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-FieldMask": fields },
    body: JSON.stringify(reqBody),
  });
  const data = await res.json(); return Array.isArray(data.places) ? data.places : [];
}
async function searchExchanges(body: PoiRequest) {
  const city = String(body.cityName || "釜山").trim() || "釜山";
  const lat = Number(body.cityLat), lon = Number(body.cityLon);
  const queries = [`환전소 ${city}`, `currency exchange ${city}`, `money exchange ${city}`, "김해공항 환전소"];
  const settled = await Promise.allSettled(queries.map(q => searchExchangeQuery(q, lat, lon)));
  const seen = new Map<string, any>();
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const place of result.value) {
      if (!place?.id || seen.has(place.id)) continue;
      const pLat = Number(place?.location?.latitude), pLon = Number(place?.location?.longitude);
      if (!Number.isFinite(pLat) || !Number.isFinite(pLon)) continue;
      if (Number.isFinite(lat) && Number.isFinite(lon) && haversineM(lat, lon, pLat, pLon) > 55000) continue;
      if (place.businessStatus === "CLOSED_PERMANENTLY") continue;
      seen.set(place.id, {
        placeId: place.id,
        name: place?.displayName?.text || "換錢所",
        ko: place?.displayName?.text || "",
        address: place?.formattedAddress || "",
        lat: pLat,
        lon: pLon,
        category: place?.primaryTypeDisplayName?.text || place?.primaryType || "",
        primaryType: place?.primaryType || "",
        businessStatus: businessStatusZh(place?.businessStatus || ""),
        googleMapsUri: place?.googleMapsUri || "",
      });
    }
  }
  const items = [...seen.values()].sort((a: any, b: any) => {
    const da = Number.isFinite(lat) && Number.isFinite(lon) ? haversineM(lat, lon, a.lat, a.lon) : 0;
    const db = Number.isFinite(lat) && Number.isFinite(lon) ? haversineM(lat, lon, b.lat, b.lon) : 0;
    return da - db;
  }).slice(0, 30);
  if (!items.length) throw new Error("GOOGLE_EXCHANGE_EMPTY");
  return { items };
}

function stripHtmlText(html: string) {
  return decodeHtml(String(html || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}
async function sha256Text(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text.slice(0, 180000)));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function fetchOfficialSource(id: string, url: string) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(9000), headers: { "User-Agent": "Mozilla/5.0 (compatible; TravelMap/1.0)", "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6" } });
    const html = await res.text();
    if (!res.ok) return { id, url, ok: false, status: res.status, hash: "" };
    const text = stripHtmlText(html);
    return { id, url: res.url || url, ok: true, status: res.status, hash: await sha256Text(text), text };
  } catch (e) {
    return { id, url, ok: false, status: 0, hash: "", error: String((e as Error)?.message || e) };
  }
}
async function airportCheck() {
  const defs = [
    ["kacMain", "https://www.airport.co.kr/gimhae/"],
    ["kacFacilities", "https://www.airport.co.kr/gimhae/cms/frCon/index.do?MENU_ID=220&acd=A1102"],
    ["kacContacts", "https://www.airport.co.kr/gimhae/cms/frCon/index.do?MENU_ID=310"],
    ["kacSchedule", "https://www.airport.co.kr/gimhae/cms/frCon/index.do?MENU_ID=120"],
    ["busanLimo", "https://www.busan.go.kr/depart/khairportlm"],
  ] as const;
  const raw = await Promise.all(defs.map(([id, url]) => fetchOfficialSource(id, url)));
  const contact = raw.find(x => x.id === "kacContacts" && x.ok)?.text || "";
  const m = contact.match(/1661-2626.{0,100}?(\d{2}:\d{2}).{0,30}?(\d{2}:\d{2})/);
  const customerCenter = m ? `1661-2626（${m[1]}–${m[2]}）` : (contact.includes("1661-2626") ? "1661-2626" : "");
  return { checkedAt: Date.now(), customerCenter, sources: raw.map(({ text, error, ...x }) => x) };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin"); if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405, origin);
  if (!GOOGLE_KEY) return json({ error: "GOOGLE_MAPS_API_KEY secret is missing" }, 500, origin);
  if (ALLOWED_ORIGIN !== "*" && origin && origin !== ALLOWED_ORIGIN) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403, origin);
  try {
    const body = await req.json() as PoiRequest;
    if (body.action === "resolveNaver") return json(await resolveNaver(body), 200, origin);
    if (body.action === "resolvePlace") return json(await resolvePlace(body), 200, origin);
    if (body.action === "searchExchanges") return json(await searchExchanges(body), 200, origin);
    if (body.action === "airportCheck") return json(await airportCheck(), 200, origin);
    let place: any = null; if (body.placeId) { try { place = await details(body.placeId); } catch (_) { place = null; } }
    if (!place) place = await searchPlace(body); if (!place?.id) return json({ placeId: null, photos: [] }, 200, origin);
    const maxPhotos = Math.max(1, Math.min(2, Number(body.maxPhotos || 2))), photos = [];
    for (const ph of (place.photos || []).slice(0, maxPhotos)) {
      if (!ph?.name) continue; const url = await photoUrl(ph.name); if (!url) continue;
      photos.push({ url, authorAttributions: Array.isArray(ph.authorAttributions) ? ph.authorAttributions.map((a: any) => ({ displayName: a.displayName || "Google Maps contributor", uri: a.uri || "", photoUri: a.photoUri || "" })) : [] });
    }
    return json({ poiId: body.poiId || "", placeId: place.id, displayName: place.displayName?.text || place.displayName || "", googleMapsUri: place.googleMapsUri || "", photos }, 200, origin);
  } catch (e) { console.error(e); return json({ error: String((e as Error)?.message || e) }, 500, origin); }
});
