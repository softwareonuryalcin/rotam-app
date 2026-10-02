import { useEffect, useMemo, useState } from 'react';
import { fetchPlaces, fetchProvinces } from './api';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import Header from './components/Header';
import RouteForm from './components/RouteForm';
import RouteList from './components/RouteList';
import Favorites from './components/Favorites';
import NearbyPanel from './components/NearbyPanel';

const uid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [provinces, setProvinces] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [routes, setRoutes] = useLocalStorage('rd-routes', []);
  const [favorites, setFavorites] = useLocalStorage('rd-favorites', []);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(null); // Form'a dışarıdan ön doldurma

  useEffect(() => {
    Promise.all([fetchProvinces(), fetchPlaces()])
      .then(([p, pl]) => {
        setProvinces(p);
        setPlaces(pl);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Hızlı erişim tabloları
  const lookup = useMemo(() => {
    const provinceById = new Map(provinces.map((p) => [p.id, p]));
    const districtById = new Map();
    provinces.forEach((p) => p.districts.forEach((d) => districtById.set(d.id, { ...d, province: p })));
    const placesByDistrict = new Map();
    places.forEach((pl) => {
      if (!placesByDistrict.has(pl.districtId)) placesByDistrict.set(pl.districtId, []);
      placesByDistrict.get(pl.districtId).push(pl);
    });
    const placeById = new Map(places.map((pl) => [pl.id, pl]));
    return { provinceById, districtById, placesByDistrict, placeById };
  }, [provinces, places]);

  const addRoute = (route) => {
    setRoutes((rs) => [{ id: uid(), status: 'planned', createdAt: Date.now(), ...route }, ...rs]);
    setFormOpen(false);
    setDraft(null);
  };
  const updateRoute = (id, patch) => setRoutes((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRoute = (id) => setRoutes((rs) => rs.filter((r) => r.id !== id));

  const favKey = (s) => `${s.provinceId}-${s.districtId ?? ''}-${s.placeId ?? ''}`;
  const isFavorite = (stop) => favorites.some((f) => favKey(f) === favKey(stop));
  const toggleFavorite = (stop) =>
    setFavorites((fs) =>
      fs.some((f) => favKey(f) === favKey(stop))
        ? fs.filter((f) => favKey(f) !== favKey(stop))
        : [{ id: uid(), addedAt: Date.now(), ...stop }, ...fs],
    );

  const openForm = (prefill = null) => {
    setDraft(prefill);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="splash"><span className="spinner" />Veriler yükleniyor…</div>;
  if (error) return <div className="splash splash--error">⚠️ {error}</div>;

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggleTheme} routes={routes} favorites={favorites} onNewRoute={() => openForm()} />

      <main className="layout">
        <section className="layout__main">
          {formOpen && (
            <RouteForm
              key={JSON.stringify(draft)}
              provinces={provinces}
              lookup={lookup}
              draft={draft}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              onSubmit={addRoute}
              onCancel={() => setFormOpen(false)}
            />
          )}
          <RouteList routes={routes} lookup={lookup} onUpdate={updateRoute} onRemove={removeRoute} onNewRoute={() => openForm()} />
        </section>

        <aside className="layout__side">
          <NearbyPanel
            provinces={provinces}
            places={places}
            lookup={lookup}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            onRouteFrom={(from) => openForm({ from })}
          />
          <Favorites
            favorites={favorites}
            lookup={lookup}
            onRemove={toggleFavorite}
            onRouteTo={(to) => openForm({ to })}
          />
        </aside>
      </main>

      <footer className="footer">
        İl/ilçe adları turkiyeapi.dev kaynaklıdır · İlçe koordinatları ve turistik yerler test amaçlı farazi üretilmiştir.
      </footer>
    </div>
  );
}
