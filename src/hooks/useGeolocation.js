import { useCallback, useState } from 'react';

export function useGeolocation() {
  const [state, setState] = useState({ coords: null, loading: false, error: null });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, loading: false, error: 'Tarayıcınız konum desteği sunmuyor.' });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          loading: false,
          error: null,
        }),
      (err) =>
        setState({
          coords: null,
          loading: false,
          error: err.code === 1 ? 'Konum izni reddedildi.' : 'Konum alınamadı.',
        }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // İzin verilmediğinde test için manuel konum seçimi
  const setManual = useCallback((coords) => setState({ coords, loading: false, error: null }), []);

  return { ...state, locate, setManual };
}
