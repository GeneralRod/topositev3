const RIBBONS_KEY = 'topositev2_ribbons_owned';
const REAL_PRIZES_KEY = 'topositev2_real_prizes_owned';

export function saveRibbonsOwned(ribbons: { [id: string]: number }) {
  localStorage.setItem(RIBBONS_KEY, JSON.stringify(ribbons));
}

export function loadRibbonsOwned(): { [id: string]: number } {
  const data = localStorage.getItem(RIBBONS_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveRealPrizesOwned(prizes: string[]) {
  localStorage.setItem(REAL_PRIZES_KEY, JSON.stringify(prizes));
}

export function loadRealPrizesOwned(): string[] {
  const data = localStorage.getItem(REAL_PRIZES_KEY);
  return data ? JSON.parse(data) : [];
} 