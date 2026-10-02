// Tüm veriler istemci tarafında fetch ile çekilir.
const BASE = import.meta.env.BASE_URL;

async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} yüklenemedi (${res.status})`);
  return res.json();
}

export const fetchProvinces = () => getJSON('data/provinces.json');
export const fetchPlaces = () => getJSON('data/places.json');

// Koordinattan adres bulma (OpenStreetMap Nominatim) — başarısız olursa null döner.
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr&zoom=10`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name ?? null;
  } catch {
    return null;
  }
}
