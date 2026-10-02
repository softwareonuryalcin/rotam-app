import { useEffect, useMemo, useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { reverseGeocode } from '../api';
import { driveHours, formatHours, formatKm, haversineKm } from '../utils/geo';
import PlaceCard from './PlaceCard';

const TABS = [
  { id: 'places', label: 'Gezilecek' },
  { id: 'districts', label: 'İlçeler' },
  { id: 'provinces', label: 'İller' },
];

export default function NearbyPanel({ provinces, places, lookup, isFavorite, toggleFavorite, onRouteFrom }) {
  const { coords, loading, error, locate, setManual } = useGeolocation();
  const [tab, setTab] = useState('places');
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (!coords) return;
    setAddress(null);
    let alive = true;
    reverseGeocode(coords.lat, coords.lng).then((a) => alive && setAddress(a));
    return () => {
      alive = false;
    };
  }, [coords]);

  const nearby = useMemo(() => {
    if (!coords) return null;
    const withDist = (arr) => arr.map((x) => ({ ...x, km: haversineKm(coords, x) })).sort((a, b) => a.km - b.km);
    const districts = withDist([...lookup.districtById.values()]);
    return {
      provinces: withDist(provinces).slice(0, 8),
      districts: districts.slice(0, 8),
      places: withDist(places).slice(0, 8),
      here: districts[0],
    };
  }, [coords, provinces, places, lookup]);

  return (
    <section className="card nearby">
      <div className="card__head">
        <h2>📡 Yakınımda</h2>
        <button className="btn btn--small" onClick={locate} disabled={loading}>
          {loading ? 'Aranıyor…' : coords ? 'Yenile' : 'Konumumu bul'}
        </button>
      </div>

      {error && <p className="hint hint--error">{error}</p>}

      {!coords && (
        <label className="field">
          <span>…ya da test için bir il merkezi seç</span>
          <select defaultValue="" onChange={(e) => {
            const p = lookup.provinceById.get(Number(e.target.value));
            if (p) setManual({ lat: p.lat, lng: p.lng });
          }}>
            <option value="" disabled>İl seçin</option>
            {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}

      {nearby && (
        <>
          <div className="nearby__here">
            <div>
              <span className="muted">Muhtemelen buradasın</span>
              <strong>{nearby.here.name}, {nearby.here.province.name}</strong>
              <small>{address ?? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}</small>
              <small>
                {nearby.here.province.name} merkezine {formatKm(haversineKm(coords, nearby.here.province))}
              </small>
            </div>
            <button className="btn btn--small" onClick={() => onRouteFrom({ provinceId: nearby.here.province.id, districtId: nearby.here.id })}>
              Buradan rota
            </button>
          </div>

          <div className="tabs tabs--full">
            {TABS.map((t) => (
              <button key={t.id} className={`tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {tab === 'places' && (
            <div className="place-grid place-grid--single">
              {nearby.places.map((pl) => {
                const stop = { provinceId: pl.provinceId, districtId: pl.districtId, placeId: pl.id };
                return (
                  <PlaceCard key={pl.id} place={pl} lookup={lookup} distanceKm={pl.km} showLocation
                    isFavorite={isFavorite(stop)} onFavorite={() => toggleFavorite(stop)} />
                );
              })}
            </div>
          )}

          {tab === 'districts' && (
            <ul className="near-list">
              {nearby.districts.map((d) => {
                const stop = { provinceId: d.province.id, districtId: d.id };
                return (
                  <li key={d.id}>
                    <div>
                      <strong>{d.name}</strong>
                      <span>{d.province.name} · il merkezine {formatKm(d.distanceToCenterKm)}</span>
                    </div>
                    <em>{formatKm(d.km)}</em>
                    <button className={`btn btn--icon btn--fav ${isFavorite(stop) ? 'is-active' : ''}`} onClick={() => toggleFavorite(stop)}>★</button>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === 'provinces' && (
            <ul className="near-list">
              {nearby.provinces.map((p) => {
                const stop = { provinceId: p.id, districtId: null };
                return (
                  <li key={p.id}>
                    <div>
                      <strong>{p.plate} · {p.name}</strong>
                      <span>Merkeze {formatKm(p.km)} · 🚗 {formatHours(driveHours(p.km))}</span>
                    </div>
                    <em>{formatKm(p.km)}</em>
                    <button className={`btn btn--icon btn--fav ${isFavorite(stop) ? 'is-active' : ''}`} onClick={() => toggleFavorite(stop)}>★</button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
