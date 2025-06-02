export const COIN_STORAGE_KEY = 'topositev2_total_coins';

export function getTotalCoins(): number {
  const coins = localStorage.getItem(COIN_STORAGE_KEY);
  return coins ? parseInt(coins, 10) : 0;
}

export function setTotalCoins(amount: number) {
  localStorage.setItem(COIN_STORAGE_KEY, amount.toString());
}

export function addCoins(amount: number) {
  const current = getTotalCoins();
  setTotalCoins(current + amount);
} 