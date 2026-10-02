import { formatKm } from '../utils/geo';

export default function LocationPicker({ label, provinces, lookup, value, onChange, isFavorite, toggleFavorite }) {
  const province = lookup.provinceById.get(Number(value.provinceId));
  const district = province?.districts.find((d) => d.id === Number(value.districtId));
  const stop = { provinceId: province?.id, districtId: district?.id ?? null };

  return (
    <fieldset className="picker">
      <legend>{label}</legend>
      <div className="picker__row">
        <label className="field">
          <span>İl</span>
          <select
            value={value.provinceId ?? ''}
            onChange={(e) => onChange({ provinceId: Number(e.target.value) || null, districtId: null })}
          >
            <option value="">İl seçin</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.plate} · {p.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>İlçe</span>
          <select
            value={value.districtId ?? ''}
            disabled={!province}
            onChange={(e) => onChange({ ...value, districtId: Number(e.target.value) || null })}
          >
            <option value="">{province ? 'Tüm il / merkez' : 'Önce il seçin'}</option>
            {province?.districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={`btn btn--icon btn--fav ${province && isFavorite(stop) ? 'is-active' : ''}`}
          disabled={!province}
          onClick={() => toggleFavorite(stop)}
          title="Favori duraklara ekle"
        >
          ★
        </button>
      </div>
      {province && (
        <p className="picker__meta">
          <span className="chip">{province.region}</span>
          {district ? (
            <>
              <span className="chip">İl merkezine {formatKm(district.distanceToCenterKm)}</span>
              <span className="chip">👥 {district.population?.toLocaleString('tr-TR')}</span>
            </>
          ) : (
            <span className="chip">{province.districts.length} ilçe</span>
          )}
        </p>
      )}
    </fieldset>
  );
}
