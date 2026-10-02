import { useState } from 'react';
import LocationPicker from './LocationPicker';
import PlaceCard from './PlaceCard';
import { driveHours, formatHours, formatKm, haversineKm, roadKm } from '../utils/geo';
import { resolveStop } from '../utils/stops';

const empty = { provinceId: null, districtId: null };

export default function RouteForm({ provinces, lookup, draft, isFavorite, toggleFavorite, onSubmit, onCancel }) {
  const [from, setFrom] = useState(draft?.from ?? empty);
  const [to, setTo] = useState(draft?.to ?? empty);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const a = resolveStop(from, lookup);
  const b = resolveStop(to, lookup);
  const km = a && b ? haversineKm(a, b) : null;
  const sameStop = a && b && a.lat === b.lat && a.lng === b.lng;

  const destPlaces = to.districtId
    ? lookup.placesByDistrict.get(to.districtId) ?? []
    : b
      ? b.province.districts.flatMap((d) => lookup.placesByDistrict.get(d.id) ?? []).sort((x, y) => y.rating - x.rating).slice(0, 6)
      : [];

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!a || !b || sameStop) return;
    onSubmit({ from, to, date, note: note.trim(), placeId: to.placeId ?? null });
  };

  return (
    <form className="card route-form" onSubmit={submit}>
      <div className="card__head">
        <h2>Yeni Rota</h2>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Kapat</button>
      </div>

      <div className="route-form__pickers">
        <LocationPicker label="📍 Nereden" provinces={provinces} lookup={lookup} value={from} onChange={setFrom} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
        <button type="button" className="btn btn--icon route-form__swap" onClick={swap} title="Yer değiştir">⇄</button>
        <LocationPicker label="🏁 Nereye" provinces={provinces} lookup={lookup} value={to} onChange={setTo} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
      </div>

      {km != null && (
        <div className="route-form__summary">
          <div><span>Kuş uçuşu</span><strong>{formatKm(km)}</strong></div>
          <div><span>Tahmini yol</span><strong>{formatKm(roadKm(km))}</strong></div>
          <div><span>Sürüş (~80 km/s)</span><strong>{formatHours(driveHours(km))}</strong></div>
        </div>
      )}

      <div className="route-form__extra">
        <label className="field">
          <span>Planlanan tarih</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field field--grow">
          <span>Not</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Örn. bahar aylarında, arkadaşlarla…" />
        </label>
      </div>

      {destPlaces.length > 0 && (
        <div className="route-form__places">
          <h3>{to.districtId ? `${b.title} gezilecek yerler` : `${b.province.name} öne çıkanlar`}</h3>
          <div className="place-grid">
            {destPlaces.map((pl) => (
              <PlaceCard
                key={pl.id}
                place={pl}
                lookup={lookup}
                isFavorite={isFavorite({ provinceId: pl.provinceId, districtId: pl.districtId, placeId: pl.id })}
                onFavorite={() => toggleFavorite({ provinceId: pl.provinceId, districtId: pl.districtId, placeId: pl.id })}
              />
            ))}
          </div>
        </div>
      )}

      <div className="route-form__actions">
        {sameStop && <span className="hint hint--error">Başlangıç ve varış aynı olamaz.</span>}
        <button type="submit" className="btn btn--primary" disabled={!a || !b || sameStop}>Rotayı Kaydet</button>
      </div>
    </form>
  );
}
