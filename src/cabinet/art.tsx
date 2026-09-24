// Tekeningen van alle prijzen en stickers, in één stijl: platte kleuren met
// een donkerbruine omlijning. Allemaal 64×64 en ze 'staan' onderaan (y = 60),
// zodat ze netjes op een plank passen.

import React from 'react';

const INK = '#3b2a1a';
const line = {
  stroke: INK,
  strokeWidth: 2,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;
const shine = {
  fill: 'none',
  stroke: '#ffffff',
  strokeOpacity: 0.7,
  strokeWidth: 3,
  strokeLinecap: 'round',
} as const;

interface Metal {
  body: string;
  dark: string;
}

const BRONZE: Metal = { body: '#d08a4c', dark: '#9c5f2c' };
const SILVER: Metal = { body: '#cfd8e3', dark: '#8d9aab' };
const GOLD: Metal = { body: '#f7c531', dark: '#c48f10' };

function Trophy({ metal, star = false }: { metal: Metal; star?: boolean }) {
  return (
    <>
      <path d="M17 17 C8 17 8 31 19 31" fill="none" {...line} strokeWidth={4} stroke={metal.dark} />
      <path
        d="M47 17 C56 17 56 31 45 31"
        fill="none"
        {...line}
        strokeWidth={4}
        stroke={metal.dark}
      />
      <path d="M17 17 C8 17 8 31 19 31 M47 17 C56 17 56 31 45 31" fill="none" {...line} />
      <rect x="18" y="50" width="28" height="10" rx="2" fill="#6b4226" {...line} />
      <rect x="25" y="53" width="14" height="4" rx="1" fill={metal.body} />
      <path d="M28 40 H36 L38 50 H26 Z" fill={metal.dark} {...line} />
      <path
        d="M16 10 H48 V20 C48 32 41 40 32 40 C23 40 16 32 16 20 Z"
        fill={metal.body}
        {...line}
      />
      <path d="M22 15 V21 C22 27 24 31 27 34" {...shine} />
      {star && (
        <path
          d="M32 17 L34.4 22 L39.6 22.6 L35.7 26 L36.8 31.2 L32 28.5 L27.2 31.2 L28.3 26 L24.4 22.6 L29.6 22 Z"
          fill="#fff3b0"
          stroke={metal.dark}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      )}
    </>
  );
}

const prizeArt: Record<string, () => React.ReactElement> = {
  'mini-trophy': () => <Trophy metal={BRONZE} />,
  'silver-trophy': () => <Trophy metal={SILVER} />,
  'gold-trophy': () => <Trophy metal={GOLD} star />,

  cup: () => (
    <>
      <path
        d="M13 12 C3 12 3 30 16 30 M51 12 C61 12 61 30 48 30"
        fill="none"
        {...line}
        strokeWidth={5}
        stroke={GOLD.dark}
      />
      <path d="M13 12 C3 12 3 30 16 30 M51 12 C61 12 61 30 48 30" fill="none" {...line} />
      <rect x="16" y="52" width="32" height="8" rx="2" fill="#6b4226" {...line} />
      <rect x="21" y="46" width="22" height="6" rx="2" fill={GOLD.dark} {...line} />
      <path d="M29 36 H35 V46 H29 Z" fill={GOLD.dark} {...line} />
      <path
        d="M12 6 H52 L48 26 C46 33 40 37 32 37 C24 37 18 33 16 26 Z"
        fill={GOLD.body}
        {...line}
      />
      <path d="M18 11 L21 24 C22 28 24 30 27 32" {...shine} />
      <path d="M26 40 L20 48 M38 40 L44 48" {...line} stroke="#d93a3a" strokeWidth={4} />
      <circle cx="32" cy="40" r="4" fill="#e74c3c" {...line} />
      <text x="32" y="25" textAnchor="middle" fontSize="11" fontWeight="bold" fill={GOLD.dark}>
        1
      </text>
    </>
  ),

  book: () => (
    <>
      <rect x="15" y="8" width="34" height="52" rx="3" fill="#3f7fd9" {...line} />
      <rect x="15" y="8" width="8" height="52" rx="2" fill="#2c5fa8" {...line} />
      <path d="M49 12 V56" stroke="#fff8e1" strokeWidth={3} />
      <circle cx="36" cy="28" r="9" fill="#bfe3ff" {...line} />
      <path
        d="M31 25 C34 22 37 26 35 29 C33 32 36 34 39 32"
        fill="none"
        stroke="#3aa655"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <rect x="28" y="44" width="16" height="4" rx="2" fill="#f7c531" />
      <path d="M27 12 V20" {...shine} />
    </>
  ),

  atlas: () => (
    <>
      <path d="M6 22 L32 27 L58 22 L58 54 L32 59 L6 54 Z" fill="#c0392b" {...line} />
      <path d="M8 18 L32 23 V55 L8 50 Z" fill="#fffbe8" {...line} />
      <path d="M56 18 L32 23 V55 L56 50 Z" fill="#fffbe8" {...line} />
      <path
        d="M12 26 C16 23 21 27 19 31 C17 35 22 38 26 36"
        fill="none"
        stroke="#3aa655"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M13 40 C17 38 20 43 24 42"
        fill="none"
        stroke="#6cb4ee"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M38 28 C42 25 47 29 45 33 C43 37 48 40 52 36"
        fill="none"
        stroke="#3aa655"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M38 44 C42 42 46 47 50 45"
        fill="none"
        stroke="#e0a526"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </>
  ),

  map: () => (
    <>
      <rect x="12" y="12" width="40" height="42" fill="#f3dca5" {...line} />
      <rect x="9" y="6" width="46" height="8" rx="4" fill="#d9b36a" {...line} />
      <rect x="9" y="52" width="46" height="8" rx="4" fill="#d9b36a" {...line} />
      <path
        d="M18 44 C22 36 28 42 32 34 C35 28 40 30 42 24"
        fill="none"
        stroke="#c0392b"
        strokeWidth={2.5}
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      <path
        d="M40 19 L47 26 M47 19 L40 26"
        stroke="#c0392b"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M17 22 C20 19 24 22 22 26"
        fill="none"
        stroke="#3aa655"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx="44" cy="44" r="4" fill="none" stroke={INK} strokeWidth={1.5} />
      <path d="M44 39 V41 M44 47 V49" stroke={INK} strokeWidth={1.5} />
    </>
  ),

  globe: () => (
    <>
      <path d="M22 60 H42 L38 54 H26 Z" fill="#6b4226" {...line} />
      <path d="M32 54 V48" {...line} strokeWidth={3} />
      <path
        d="M14 26 A20 20 0 0 0 50 38"
        fill="none"
        stroke={GOLD.dark}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx="32" cy="27" r="17" fill="#4aa3df" {...line} />
      <path
        d="M22 18 C27 15 30 20 27 24 C24 28 29 31 33 29 C37 27 36 34 32 37"
        fill="#57b85a"
        stroke="none"
      />
      <path d="M38 14 C43 15 46 20 43 23 C41 25 38 22 38 19 Z" fill="#57b85a" />
      <path d="M40 31 C44 30 46 34 43 37 C41 38 39 35 40 31 Z" fill="#57b85a" />
      <circle cx="32" cy="27" r="17" fill="none" {...line} />
      <path d="M22 17 C19 21 18 26 20 31" {...shine} />
    </>
  ),

  compass: () => (
    <>
      <rect x="29" y="6" width="6" height="7" rx="2" fill={GOLD.dark} {...line} />
      <circle cx="32" cy="36" r="23" fill={GOLD.body} {...line} />
      <circle cx="32" cy="36" r="17" fill="#fffaf0" {...line} />
      <path d="M32 21 V24 M32 48 V51 M17 36 H20 M44 36 H47" stroke={INK} strokeWidth={1.5} />
      <path d="M32 22 L36 36 H28 Z" fill="#e74c3c" {...line} strokeWidth={1.5} />
      <path d="M32 50 L28 36 H36 Z" fill="#4a6fa5" {...line} strokeWidth={1.5} />
      <circle cx="32" cy="36" r="2.5" fill={INK} />
      <path d="M17 26 C19 22 22 19 26 17" {...shine} />
    </>
  ),

  binoculars: () => (
    <>
      <rect x="10" y="22" width="18" height="36" rx="6" fill="#2f3b4c" {...line} />
      <rect x="36" y="22" width="18" height="36" rx="6" fill="#2f3b4c" {...line} />
      <rect x="26" y="26" width="12" height="14" rx="2" fill="#475569" {...line} />
      <rect x="12" y="10" width="14" height="14" rx="3" fill="#475569" {...line} />
      <rect x="38" y="10" width="14" height="14" rx="3" fill="#475569" {...line} />
      <circle cx="19" cy="50" r="5" fill="#8fd3ff" {...line} />
      <circle cx="45" cy="50" r="5" fill="#8fd3ff" {...line} />
      <path d="M14 28 V38 M40 28 V38" {...shine} strokeOpacity={0.4} />
    </>
  ),

  camera: () => (
    <>
      <path d="M20 22 L24 14 H40 L44 22 Z" fill="#475569" {...line} />
      <rect x="6" y="22" width="52" height="36" rx="6" fill="#e2574c" {...line} />
      <rect x="6" y="30" width="52" height="20" fill="#2f3b4c" {...line} />
      <circle cx="32" cy="40" r="13" fill="#e2e8f0" {...line} />
      <circle cx="32" cy="40" r="8" fill="#1e3a5f" {...line} />
      <circle cx="29" cy="37" r="2.5" fill="#ffffff" />
      <rect x="46" y="25" width="8" height="4" rx="1" fill="#fff3b0" />
    </>
  ),

  ship: () => (
    <>
      <path d="M22 60 H42 M26 60 V55 M38 60 V55" {...line} stroke="#6b4226" strokeWidth={3} />
      <path d="M6 42 H58 L50 55 H14 Z" fill="#8b5a2b" {...line} />
      <path d="M10 46 H54" stroke="#f7c531" strokeWidth={2} />
      <path d="M32 42 V6" {...line} strokeWidth={3} />
      <path d="M33 9 C46 14 48 28 34 38 Z" fill="#ffffff" {...line} />
      <path d="M31 13 C21 18 19 30 30 38 Z" fill="#fdf6e3" {...line} />
      <path d="M32 6 L42 4 L40 8 L42 11 L32 10 Z" fill="#e74c3c" {...line} strokeWidth={1.5} />
    </>
  ),

  medal: () => (
    <>
      <path d="M18 4 H30 L36 26 H26 Z" fill="#3f7fd9" {...line} />
      <path d="M46 4 H34 L28 26 H38 Z" fill="#e74c3c" {...line} />
      <circle cx="32" cy="42" r="16" fill={GOLD.body} {...line} />
      <circle cx="32" cy="42" r="11" fill="none" stroke={GOLD.dark} strokeWidth={2} />
      <path
        d="M32 34 L34.4 39 L39.6 39.6 L35.7 43 L36.8 48.2 L32 45.5 L27.2 48.2 L28.3 43 L24.4 39.6 L29.6 39 Z"
        fill="#fff3b0"
        stroke={GOLD.dark}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d="M21 36 C22 33 24 31 27 29" {...shine} />
    </>
  ),

  mountain: () => (
    <>
      <path d="M8 60 C10 50 18 48 32 48 C46 48 54 50 56 60 Z" fill="#8d7b6a" {...line} />
      <path d="M24 50 L28 18 L36 12 L40 50 Z" fill="#b57edc" {...line} />
      <path d="M28 18 L32 50 M36 12 L32 50" stroke="#7e4fa8" strokeWidth={1.5} />
      <path d="M14 52 L16 32 L22 28 L26 52 Z" fill="#d0a7f0" {...line} />
      <path d="M40 52 L44 26 L50 32 L50 52 Z" fill="#9a62c7" {...line} />
      <path d="M31 20 L30 34" {...shine} />
      <path
        d="M50 12 L51.5 15.5 L55 17 L51.5 18.5 L50 22 L48.5 18.5 L45 17 L48.5 15.5 Z"
        fill="#fff3b0"
      />
    </>
  ),

  diamond: () => (
    <>
      <path d="M10 60 C10 52 16 48 32 48 C48 48 54 52 54 60 Z" fill="#c0392b" {...line} />
      <path d="M18 14 H46 L56 26 L32 52 L8 26 Z" fill="#7fdcf2" {...line} />
      <path
        d="M8 26 H56 M18 14 L26 26 L32 14 L38 26 L46 14 M26 26 L32 52 L38 26"
        fill="none"
        stroke="#2b8fb0"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d="M20 18 L16 24" {...shine} />
      <path
        d="M52 6 L53.5 9.5 L57 11 L53.5 12.5 L52 16 L50.5 12.5 L47 11 L50.5 9.5 Z"
        fill="#fff3b0"
      />
    </>
  ),

  crown: () => (
    <>
      <path d="M8 60 C8 52 16 49 32 49 C48 49 56 52 56 60 Z" fill="#7b3fa0" {...line} />
      <path d="M10 18 L20 30 L32 12 L44 30 L54 18 L50 46 H14 Z" fill={GOLD.body} {...line} />
      <rect x="14" y="40" width="36" height="6" fill={GOLD.dark} {...line} />
      <circle cx="10" cy="17" r="3" fill={GOLD.body} {...line} />
      <circle cx="32" cy="11" r="3" fill={GOLD.body} {...line} />
      <circle cx="54" cy="17" r="3" fill={GOLD.body} {...line} />
      <circle cx="32" cy="32" r="4" fill="#e74c3c" {...line} strokeWidth={1.5} />
      <circle cx="21" cy="36" r="2.5" fill="#3f7fd9" {...line} strokeWidth={1.5} />
      <circle cx="43" cy="36" r="2.5" fill="#3aa655" {...line} strokeWidth={1.5} />
      <path d="M18 26 L20 36" {...shine} />
    </>
  ),
};

const stickerArt: Record<string, () => React.ReactElement> = {
  star: () => (
    <path
      d="M32 12 L37.6 24.2 L50.8 25.5 L40.8 34.4 L43.7 47.5 L32 40.7 L20.3 47.5 L23.2 34.4 L13.2 25.5 L26.4 24.2 Z"
      fill="#f7c531"
      {...line}
    />
  ),
  sun: () => (
    <>
      <path
        d="M32 10 V16 M32 48 V54 M10 32 H16 M48 32 H54 M16.4 16.4 L20.7 20.7 M43.3 43.3 L47.6 47.6 M16.4 47.6 L20.7 43.3 M43.3 20.7 L47.6 16.4"
        stroke="#f39c12"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="11" fill="#f7c531" {...line} />
      <path
        d="M28 34 C30 36 34 36 36 34"
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx="28.5" cy="29.5" r="1.5" fill={INK} />
      <circle cx="35.5" cy="29.5" r="1.5" fill={INK} />
    </>
  ),
  plane: () => (
    <>
      <path d="M14 36 L50 22 C54 20 56 24 52 26 L20 42 Z" fill="#ffffff" {...line} />
      <path d="M30 32 L24 18 L30 17 L40 28 Z" fill="#3f7fd9" {...line} />
      <path d="M32 36 L30 48 L35 47 L40 33 Z" fill="#3f7fd9" {...line} />
      <path d="M16 36 L12 28 L16 27 L22 34 Z" fill="#e74c3c" {...line} />
    </>
  ),
  anchor: () => (
    <>
      <circle cx="32" cy="16" r="5" fill="none" {...line} strokeWidth={3} stroke="#2c5fa8" />
      <path d="M32 21 V50 M22 28 H42" stroke="#2c5fa8" strokeWidth={4} strokeLinecap="round" />
      <path
        d="M14 38 C16 48 24 52 32 52 C40 52 48 48 50 38"
        fill="none"
        stroke="#2c5fa8"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M10 40 L14 36 L18 41 M46 41 L50 36 L54 40"
        fill="none"
        stroke="#2c5fa8"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  rainbow: () => (
    <>
      <path d="M10 44 A22 22 0 0 1 54 44" fill="none" stroke="#e74c3c" strokeWidth={5} />
      <path d="M15 44 A17 17 0 0 1 49 44" fill="none" stroke="#f39c12" strokeWidth={5} />
      <path d="M20 44 A12 12 0 0 1 44 44" fill="none" stroke="#3aa655" strokeWidth={5} />
      <path d="M25 44 A7 7 0 0 1 39 44" fill="none" stroke="#3f7fd9" strokeWidth={5} />
      <ellipse cx="14" cy="46" rx="8" ry="5" fill="#ffffff" {...line} />
      <ellipse cx="50" cy="46" rx="8" ry="5" fill="#ffffff" {...line} />
    </>
  ),
  rocket: () => (
    <>
      <path d="M32 8 C42 16 44 30 40 42 H24 C20 30 22 16 32 8 Z" fill="#e2e8f0" {...line} />
      <circle cx="32" cy="26" r="5" fill="#8fd3ff" {...line} />
      <path d="M24 34 L16 44 L24 44 Z M40 34 L48 44 L40 44 Z" fill="#e74c3c" {...line} />
      <path d="M27 44 L32 56 L37 44 Z" fill="#f39c12" {...line} />
    </>
  ),
};

interface ArtProps {
  id: string;
  size?: number;
}

/** Tekening van een prijs; een grijs vraagteken als het id onbekend is. */
export const PrizeArt: React.FC<ArtProps> = ({ id, size = 64 }) => {
  const Art = prizeArt[id];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {Art ? (
        <Art />
      ) : (
        <text x="32" y="44" textAnchor="middle" fontSize="36" fill="#999">
          ?
        </text>
      )}
    </svg>
  );
};

/** Ronde sticker met witte rand, zoals een echte plaksticker. */
export const StickerArt: React.FC<ArtProps> = ({ id, size = 64 }) => {
  const Art = stickerArt[id];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#ffffff" stroke="#e5d6bf" strokeWidth={2} />
      <circle cx="32" cy="32" r="26" fill="#fff8e7" />
      {Art && <Art />}
    </svg>
  );
};
