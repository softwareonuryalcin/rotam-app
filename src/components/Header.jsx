import { STATUSES } from './statuses';

export default function Header({ theme, onToggleTheme, routes, favorites, onNewRoute }) {
  const count = (s) => routes.filter((r) => r.status === s).length;

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo">🧭</span>
        <div>
          <h1>Rota Defteri</h1>
          <p>81 il · 973 ilçe · senin rotaların</p>
        </div>
      </div>

      <div className="header__stats">
        <div className="stat"><strong>{routes.length}</strong><span>Rota</span></div>
        {STATUSES.map((s) => (
          <div key={s.id} className={`stat stat--${s.id}`}><strong>{count(s.id)}</strong><span>{s.label}</span></div>
        ))}
        <div className="stat"><strong>{favorites.length}</strong><span>Favori</span></div>
      </div>

      <div className="header__actions">
        <button className="btn btn--primary" onClick={onNewRoute}>＋ Yeni Rota Oluştur</button>
        <button className="btn btn--icon" onClick={onToggleTheme} aria-label="Temayı değiştir" title="Temayı değiştir">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
