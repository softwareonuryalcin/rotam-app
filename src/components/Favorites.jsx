import { resolveStop } from '../utils/stops';

export default function Favorites({ favorites, lookup, onRemove, onRouteTo }) {
  return (
    <section className="card">
      <div className="card__head">
        <h2>⭐ Favori Duraklar</h2>
        <span className="muted">Sonra gitmek istediklerin</span>
      </div>
      {favorites.length === 0 ? (
        <p className="empty">Rota oluştururken ya da yakın önerilerde ★ ile durak ekleyebilirsin.</p>
      ) : (
        <ul className="fav-list">
          {favorites.map((f) => {
            const s = resolveStop(f, lookup);
            if (!s) return null;
            return (
              <li key={f.id} className="fav">
                <span className="fav__icon">{s.place ? s.place.icon : s.district ? '🏘️' : '🏙️'}</span>
                <div className="fav__body">
                  <strong>{s.title}</strong>
                  <span>{s.subtitle}</span>
                </div>
                <button className="btn btn--small" onClick={() => onRouteTo({ provinceId: f.provinceId, districtId: f.districtId ?? null, placeId: f.placeId ?? null })}>
                  Rota →
                </button>
                <button className="btn btn--icon btn--ghost" onClick={() => onRemove(f)} title="Kaldır">✕</button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
