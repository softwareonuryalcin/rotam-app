export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Karayolu mesafesi kuş uçuşunun yaklaşık 1.3 katı kabul edilir (farazi).
export const roadKm = (km) => Math.round(km * 1.3);
export const driveHours = (km) => roadKm(km) / 80;

export function formatKm(km) {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString('tr-TR')} km`;
}

export function formatHours(h) {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  return hours ? `${hours} sa ${mins} dk` : `${mins} dk`;
}
