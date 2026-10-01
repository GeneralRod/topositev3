// Oefenkaart printen: een blinde kaart met nummers, invulregels en een antwoordblad.
// Pure functies, getest in printMap.test.ts.

export interface PrintPlace {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Nummers in leesvolgorde, zoals je een kaart afleest: in stroken van boven naar
 * beneden, en in elke strook van links naar rechts. Dan staan de nummers niet
 * kriskras door elkaar en is de lijst makkelijk te volgen.
 */
export function numberPlaces<T extends PrintPlace>(places: T[], rows = 5): T[] {
  if (places.length === 0) return [];
  const lats = places.map((p) => p.lat);
  const top = Math.max(...lats);
  const height = top - Math.min(...lats) || 1;
  const row = (p: T) => Math.min(rows - 1, Math.floor(((top - p.lat) / height) * rows));
  return [...places].sort((a, b) => row(a) - row(b) || a.lng - b.lng || b.lat - a.lat);
}

/** Het stuk kaart dat geprint wordt: alle plekken, met wat ruimte eromheen. */
export function printBounds(places: PrintPlace[]): [[number, number], [number, number]] {
  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);
  const [south, north] = [Math.min(...lats), Math.max(...lats)];
  const [west, east] = [Math.min(...lngs), Math.max(...lngs)];
  const padLat = Math.max(0.3, (north - south) * 0.08);
  const padLng = Math.max(0.3, (east - west) * 0.08);
  return [
    [Math.max(-80, south - padLat), Math.max(-180, west - padLng)],
    [Math.min(85, north + padLat), Math.min(180, east + padLng)],
  ];
}
