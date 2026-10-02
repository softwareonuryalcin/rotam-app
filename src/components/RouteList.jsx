import { useState } from 'react';
import { STATUSES, statusById } from './statuses';
import { driveHours, formatHours, formatKm, haversineKm, roadKm } from '../utils/geo';
import { resolveStop } from '../utils/stops';

export default function RouteList({ routes, lookup, onUpdate, onRemove, onNewRoute }) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? routes : routes.filter((r) => r.status === filter);

  return (
    <section className="card">
      <div className="card__head">
        <h2>Rotalarım</h2>
        <div className="tabs" role="tablist">
          <button className={`tab ${filter === 'all' ? 'is-active' : ''}`} onClick={() => setFilter('all')}>Tümü</button>
          {STATUSES.map((s) => (
            <button key={s.id} className={`tab ${filter === s.id ? 'is-active' : ''}`} onClick={() => setFilter(s.id)}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>{routes.length ? 'Bu durumda rota yok.' : 'Henüz bir rota oluşturmadın.'}</p>
          {!routes.length && <button className="btn btn--primary" onClick={onNewRoute}>＋ İlk rotanı oluştur</button>}
        </div>
      ) : (
        <div className="route-grid">
          {visible.map((r) => (
            <RouteCard key={r.id} route={r} lookup={lookup} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </div>
      )}
    </section>
  );
}

function RouteCard({ route, lookup, onUpdate, onRemove }) {
  const a = resolveStop(route.from, lookup);
  const b = resolveStop(route.to, lookup);
  if (!a || !b) return null;
  const km = haversineKm(a, b);
  const status = statusById[route.status];

  return (
    <article className={`route route--${route.status}`}>
      <div className="route__badge">{status.icon} {status.label}</div>
      <div className="route__path">
        <div className="route__stop">
          <strong>{a.title}</strong>
          <span>{a.subtitle}</span>
        </div>
        <div className="route__line"><span>{formatKm(roadKm(km))}</span></div>
        <div className="route__stop route__stop--end">
          <strong>{b.title}</strong>
          <span>{b.subtitle}</span>
        </div>
      </div>
      <p className="route__meta">
        🚗 {formatHours(driveHours(km))}
        {route.date && <> · 📅 {new Date(route.date).toLocaleDateString('tr-TR')}</>}
      </p>
      {route.note && <p className="route__note">“{route.note}”</p>}
      <div className="route__actions">
        <div className="segmented">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              className={route.status === s.id ? 'is-active' : ''}
              onClick={() => onUpdate(route.id, { status: s.id })}
              title={s.label}
            >
              {s.icon}<span>{s.label}</span>
            </button>
          ))}
        </div>
        <button className="btn btn--ghost btn--danger" onClick={() => onRemove(route.id)} title="Sil">🗑</button>
      </div>
    </article>
  );
}
