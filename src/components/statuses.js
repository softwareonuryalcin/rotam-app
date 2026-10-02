export const STATUSES = [
  { id: 'planned', label: 'Planlandı', icon: '🗓️' },
  { id: 'visited', label: 'Gittim', icon: '✅' },
  { id: 'skipped', label: 'Gitmedim', icon: '✖️' },
  { id: 'postponed', label: 'Ertelendi', icon: '⏳' },
];
export const statusById = Object.fromEntries(STATUSES.map((s) => [s.id, s]));
