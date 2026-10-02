// Bir durağı ({provinceId, districtId?, placeId?}) koordinat ve etikete çevirir.
export function resolveStop(stop, lookup) {
  if (!stop?.provinceId) return null;
  const province = lookup.provinceById.get(stop.provinceId);
  if (!province) return null;
  const district = stop.districtId ? lookup.districtById.get(stop.districtId) : null;
  const place = stop.placeId ? lookup.placeById.get(stop.placeId) : null;
  const point = place ?? district ?? province;
  return {
    province,
    district,
    place,
    lat: point.lat,
    lng: point.lng,
    title: place ? place.name : district ? district.name : province.name,
    subtitle: place ? `${district?.name ?? ''}, ${province.name}` : district ? province.name : `${province.region} Bölgesi`,
  };
}
