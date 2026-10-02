// Veri üretici: il/ilçe isimlerini turkiyeapi.dev'den çeker,
// ilçe koordinatlarını (API sağlamadığı için) il merkezine göre FARAZİ üretir,
// turistik yerleri de test amaçlı rastgele (seed'li) oluşturur.
// Kullanım: node scripts/generate-data.mjs
import { writeFile } from 'node:fs/promises';

const API = 'https://api.turkiyeapi.dev/v1';

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(28092025);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

function haversine(a, b) {
  const R = 6371, toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const CENTRAL = ['Merkez', 'Seyhan', 'Çankaya', 'Muratpaşa', 'Osmangazi', 'Konak', 'Fatih', 'Selçuklu', 'Kocasinan', 'Şahinbey', 'Atakum', 'Pamukkale', 'Ortahisar', 'Yeşilyurt', 'İzmit', 'Adapazarı', 'Tepebaşı', 'Odunpazarı', 'Yunusemre', 'Menteşe', 'Karesi', 'Artuklu', 'Haliliye', 'Antakya', 'Dulkadiroğlu', 'Akdeniz', 'Eyyübiye', 'Kepez', 'Battalgazi', 'Bağlar', 'Tuşba', 'Palandöken', 'İpekyolu', 'Yakutiye'];

const TYPES = [
  { type: 'Tarihi', icon: '🏛️', names: ['Antik Kenti', 'Kalesi', 'Camii', 'Hanı', 'Kervansarayı', 'Köprüsü', 'Hamamı', 'Kilisesi'] },
  { type: 'Doğa', icon: '🌲', names: ['Şelalesi', 'Kanyonu', 'Gölü', 'Yaylası', 'Mağarası', 'Tabiat Parkı', 'Ormanı'] },
  { type: 'Müze', icon: '🖼️', names: ['Kent Müzesi', 'Etnografya Müzesi', 'Arkeoloji Müzesi', 'Sanat Galerisi'] },
  { type: 'Gastronomi', icon: '🍽️', names: ['Çarşısı', 'Yöresel Lezzetler Sokağı', 'Pazar Yeri', 'Kahvesi'] },
  { type: 'Manzara', icon: '🌄', names: ['Seyir Terası', 'Tepesi', 'Sahili', 'Koyu'] },
];
const PREFIX = ['Eski', 'Büyük', 'Yukarı', 'Aşağı', 'Kızıl', 'Yeşil', 'Ak', 'Kara', 'Gök', 'Yeni', 'Sultan', 'Paşa'];

const [provRes, distRes] = await Promise.all([
  fetch(`${API}/provinces?limit=100`).then((r) => r.json()),
  fetch(`${API}/districts?limit=1000`).then((r) => r.json()),
]);

const places = [];
const provinces = provRes.data
  .sort((a, b) => a.id - b.id)
  .map((p) => {
    const center = { lat: p.coordinates.latitude, lng: p.coordinates.longitude };
    const districts = distRes.data
      .filter((d) => d.provinceId === p.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
      .map((d) => {
        const isCentral = CENTRAL.includes(d.name);
        // Farazi koordinat: merkez ilçeler merkeze çok yakın, diğerleri 10-70 km arası
        const radiusDeg = isCentral ? rand() * 0.04 : 0.1 + rand() * 0.55;
        const angle = rand() * Math.PI * 2;
        const lat = round(center.lat + Math.sin(angle) * radiusDeg);
        const lng = round(center.lng + (Math.cos(angle) * radiusDeg) / Math.cos((center.lat * Math.PI) / 180));
        const district = {
          id: d.id, name: d.name, population: d.population, lat, lng,
          distanceToCenterKm: Math.round(haversine(center, { lat, lng }) * 10) / 10,
        };
        const count = 2 + Math.floor(rand() * 4);
        for (let i = 0; i < count; i++) {
          const t = pick(TYPES);
          const name = `${rand() > 0.5 ? d.name : pick(PREFIX)} ${pick(t.names)}`;
          places.push({
            id: `${d.id}-${i}`, districtId: d.id, provinceId: p.id, name, type: t.type, icon: t.icon,
            rating: round(3 + rand() * 2, 1),
            durationHours: pick([1, 1.5, 2, 3, 4, 6]),
            lat: round(lat + (rand() - 0.5) * 0.05), lng: round(lng + (rand() - 0.5) * 0.05),
          });
        }
        return district;
      });
    return { id: p.id, name: p.name, region: p.region?.tr ?? '', plate: String(p.id).padStart(2, '0'), ...center, districts };
  });

await writeFile(new URL('../public/data/provinces.json', import.meta.url), JSON.stringify(provinces));
await writeFile(new URL('../public/data/places.json', import.meta.url), JSON.stringify(places));
console.log(`${provinces.length} il, ${provinces.reduce((s, p) => s + p.districts.length, 0)} ilçe, ${places.length} yer üretildi.`);
