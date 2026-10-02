import { formatKm } from '../utils/geo';

export default function PlaceCard({ place, lookup, distanceKm, isFavorite, onFavorite, showLocation }) {
  const district = lookup.districtById.get(place.districtId);
  return (
    <article className={`place place--${place.type.toLowerCase()}`}>
      <span className="place__icon">{place.icon}</span>
      <div className="place__body">
        <h4>{place.name}</h4>
        <p>
          {place.type} · ⭐ {place.rating} · {place.durationHours} sa
          {showLocation && district && <> · {district.name}/{district.province.name}</>}
          {distanceKm != null && <> · {formatKm(distanceKm)}</>}
        </p>
      </div>
      <button type="button" className={`btn btn--icon btn--fav ${isFavorite ? 'is-active' : ''}`} onClick={onFavorite} title="Favorilere ekle">★</button>
    </article>
  );
}
