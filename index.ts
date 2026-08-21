const GOOGLE_BASE = "https://places.googleapis.com/v1";
const GOOGLE_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

type PoiRequest = {
  poiId?: string;
  name?: string;
  display?: string;
  address?: string;
  lat?: number;
  lon?: number;
  placeId?: string;
  maxPhotos?: number;
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
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const r = (v: number) => v * Math.PI / 180;
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function googleFetch(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("X-Goog-Api-Key", GOOGLE_KEY);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GOOGLE_API_${res.status}: ${text.slice(0, 500)}`);
  }
  return res;
}

async function details(placeId: string) {
  const fields = "id,displayName,location,photos,googleMapsUri";
  const res = await googleFetch(`${GOOGLE_BASE}/places/${encodeURIComponent(placeId)}?languageCode=ko&regionCode=KR`, {
    headers: { "X-Goog-FieldMask": fields },
  });
  return await res.json();
}

async function searchPlace(body: PoiRequest) {
  const lat = Number(body.lat), lon = Number(body.lon);
  const query = [body.name || body.display, body.address].filter(Boolean).join(" ").trim();
  if (!query) return null;

  const reqBody: Record<string, unknown> = {
    textQuery: query,
    languageCode: "ko",
    regionCode: "KR",
    maxResultCount: 5,
  };
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    reqBody.locationBias = {
      circle: { center: { latitude: lat, longitude: lon }, radius: 2000.0 },
    };
  }

  const res = await googleFetch(`${GOOGLE_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.photos,places.googleMapsUri",
    },
    body: JSON.stringify(reqBody),
  });
  const data = await res.json();
  const places = Array.isArray(data.places) ? data.places : [];
  if (!places.length) return null;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return places[0];
  const ranked = places.map((p: any) => {
    const pl = p.location || {};
    const d = Number.isFinite(pl.latitude) && Number.isFinite(pl.longitude)
      ? haversineM(lat, lon, pl.latitude, pl.longitude)
      : 999999;
    return { p, d };
  }).sort((a: any, b: any) => a.d - b.d);

  if (!ranked[0] || ranked[0].d > 2000) return null;
  return ranked[0].p;
}

async function photoUrl(photoName: string) {
  const url = `${GOOGLE_BASE}/${photoName}/media?maxWidthPx=1100&maxHeightPx=800&skipHttpRedirect=true`;
  const res = await googleFetch(url);
  const data = await res.json();
  return data.photoUri || "";
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405, origin);
  if (!GOOGLE_KEY) return json({ error: "GOOGLE_MAPS_API_KEY secret is missing" }, 500, origin);
  if (ALLOWED_ORIGIN !== "*" && origin && origin !== ALLOWED_ORIGIN) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403, origin);

  try {
    const body = await req.json() as PoiRequest;
    let place: any = null;

    if (body.placeId) {
      try { place = await details(body.placeId); } catch (_) { place = null; }
    }
    if (!place) place = await searchPlace(body);
    if (!place?.id) return json({ placeId: null, photos: [] }, 200, origin);

    const maxPhotos = Math.max(1, Math.min(2, Number(body.maxPhotos || 2)));
    const photos = [];
    for (const ph of (place.photos || []).slice(0, maxPhotos)) {
      if (!ph?.name) continue;
      const url = await photoUrl(ph.name);
      if (!url) continue;
      photos.push({
        url,
        authorAttributions: Array.isArray(ph.authorAttributions) ? ph.authorAttributions.map((a: any) => ({
          displayName: a.displayName || "Google Maps contributor",
          uri: a.uri || "",
          photoUri: a.photoUri || "",
        })) : [],
      });
    }

    return json({
      poiId: body.poiId || "",
      placeId: place.id,
      displayName: place.displayName?.text || place.displayName || "",
      googleMapsUri: place.googleMapsUri || "",
      photos,
    }, 200, origin);
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error)?.message || e) }, 500, origin);
  }
});
