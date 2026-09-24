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

  windmill: () => (
    <>
      <path d="M21 60 L25 27 H39 L43 60 Z" fill="#8b5a2b" {...line} />
      <path d="M23 28 L32 17 L41 28 Z" fill="#c0392b" {...line} />
      <path d="M29 60 V53 A3 3 0 0 1 35 53 V60 Z" fill="#5a3a24" {...line} strokeWidth={1.5} />
      <circle cx="32" cy="40" r="3" fill="#fff3b0" {...line} strokeWidth={1.5} />
      <g transform="rotate(20 32 25)">
        <path d="M32 3 V47 M10 25 H54" stroke="#6b4226" strokeWidth={3} strokeLinecap="round" />
        <rect x="33" y="5" width="7" height="17" fill="#fffbe8" {...line} strokeWidth={1.5} />
        <rect x="24" y="28" width="7" height="17" fill="#fffbe8" {...line} strokeWidth={1.5} />
        <rect x="12" y="17" width="17" height="7" fill="#fffbe8" {...line} strokeWidth={1.5} />
        <rect x="35" y="26" width="17" height="7" fill="#fffbe8" {...line} strokeWidth={1.5} />
      </g>
      <circle cx="32" cy="25" r="3" fill={GOLD.dark} {...line} strokeWidth={1.5} />
    </>
  ),

  eiffel: () => (
    <>
      <path
        d="M13 60 C20 47 25 31 29 11 H35 C39 31 44 47 51 60 H42 C40 53 36 49 32 49 C28 49 24 53 22 60 Z"
        fill="#9a7650"
        {...line}
      />
      <rect x="18" y="42" width="28" height="4" rx="1" fill="#6e5236" {...line} strokeWidth={1.5} />
      <rect x="24" y="27" width="16" height="3" rx="1" fill="#6e5236" {...line} strokeWidth={1.5} />
      <path
        d="M24 42 L31 31 M40 42 L33 31 M28 27 L31 15 M36 27 L33 15"
        stroke="#6e5236"
        strokeWidth={1.5}
      />
      <rect x="30" y="4" width="4" height="8" fill="#6e5236" {...line} strokeWidth={1.5} />
    </>
  ),

  pyramids: () => (
    <>
      <circle cx="52" cy="12" r="6" fill="#f7c531" {...line} />
      <path d="M14 60 L37 20 L60 60 Z" fill="#edc56b" {...line} />
      <path d="M37 20 L60 60 H43 Z" fill="#c9953a" {...line} />
      <path d="M27 38 H45 M21 48 H50" stroke="#b07f2a" strokeWidth={1.5} strokeDasharray="4 3" />
      <path d="M3 60 L18 36 L33 60 Z" fill="#edc56b" {...line} />
      <path d="M18 36 L33 60 H23 Z" fill="#c9953a" {...line} />
      <path d="M2 60 H62" {...line} strokeWidth={3} stroke="#b07f2a" />
    </>
  ),

  liberty: () => (
    <>
      <rect x="20" y="46" width="24" height="4" rx="1" fill="#b8a488" {...line} />
      <rect x="23" y="50" width="18" height="10" fill="#c9b79c" {...line} />
      <path d="M25 46 L27 27 C28 23 36 23 37 27 L39 46 Z" fill="#6fbfa8" {...line} />
      <path d="M30 30 L29 44 M34 30 L35 44" stroke="#3f8f7f" strokeWidth={1.5} />
      <path d="M35 29 L39 13 L42 14 L39 30 Z" fill="#6fbfa8" {...line} strokeWidth={1.5} />
      <path d="M38 13 L43 13 L42 9 H39 Z" fill={GOLD.dark} {...line} strokeWidth={1.5} />
      <path
        d="M40.5 9 C38 6 40 3 40.5 1 C42.5 3 44 6 40.5 9 Z"
        fill="#f7c531"
        stroke="#e67e22"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <rect x="21" y="29" width="6" height="9" rx="1" fill="#6fbfa8" {...line} strokeWidth={1.5} />
      <circle cx="32" cy="20" r="4.5" fill="#6fbfa8" {...line} strokeWidth={1.5} />
      <path
        d="M27.5 17 L25 12 M30 15.5 L29.5 10 M32 15 V9 M34 15.5 L34.5 10 M36.5 17 L39 12"
        stroke="#3f8f7f"
        strokeWidth={2}
        strokeLinecap="round"
      />
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
  tulip: () => (
    <>
      <path d="M32 52 V32" stroke="#3aa655" strokeWidth={3} strokeLinecap="round" />
      <path d="M32 48 C24 46 20 40 20 33 C26 35 30 40 32 46 Z" fill="#57b85a" {...line} />
      <path d="M32 46 C35 40 39 37 44 37 C44 43 40 47 32 50 Z" fill="#57b85a" {...line} />
      <path
        d="M22 16 L27 21 L32 12 L37 21 L42 16 L41 27 C40 32 36 34 32 34 C28 34 24 32 23 27 Z"
        fill="#e74c3c"
        {...line}
      />
      <path d="M26 24 C26 27 27 29 29 30" {...shine} strokeWidth={2} />
    </>
  ),
  whale: () => (
    <>
      <path
        d="M26 24 C26 18 22 16 19 14 M26 24 C26 18 30 16 33 14"
        fill="none"
        stroke="#6cb4ee"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M11 38 C11 28 21 25 31 27 C41 29 45 35 49 33 L55 26 L54 36 L58 43 L50 40 C46 46 38 48 28 48 C18 48 11 44 11 38 Z"
        fill="#4a90d9"
        {...line}
      />
      <path
        d="M15 42 C21 46 33 46 41 43"
        fill="none"
        stroke="#bfe3ff"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx="19" cy="35" r="1.8" fill={INK} />
    </>
  ),
  palm: () => (
    <>
      <path
        d="M10 52 C16 50 20 54 26 52 C32 50 36 54 42 52 C48 50 52 54 56 52"
        fill="none"
        stroke="#6cb4ee"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path d="M15 49 C19 42 45 42 49 49 Z" fill="#f3d78a" {...line} />
      <path
        d="M30 45 C30 35 32 27 36 20"
        fill="none"
        stroke="#8b5a2b"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path d="M36 20 C30 14 22 15 17 20 C24 18 30 19 36 20 Z" fill="#3aa655" {...line} />
      <path d="M36 20 C40 12 48 12 52 17 C46 16 40 17 36 20 Z" fill="#3aa655" {...line} />
      <path d="M36 20 C44 20 50 26 50 32 C46 26 40 23 36 20 Z" fill="#57b85a" {...line} />
      <path d="M36 20 C30 22 25 28 24 34 C28 28 32 24 36 20 Z" fill="#57b85a" {...line} />
      <circle cx="34" cy="23" r="2" fill="#6b4226" />
      <circle cx="38" cy="23" r="2" fill="#6b4226" />
    </>
  ),
  balloon: () => (
    <>
      <path
        d="M32 8 C44 8 50 17 50 25 C50 34 40 40 36 44 H28 C24 40 14 34 14 25 C14 17 20 8 32 8 Z"
        fill="#e74c3c"
        {...line}
      />
      <path d="M32 8 C26 14 24 30 28 44 H36 C40 30 38 14 32 8 Z" fill="#f7c531" {...line} />
      <path d="M29 44 L28 49 M35 44 L36 49" stroke={INK} strokeWidth={1.5} />
      <rect x="26" y="49" width="12" height="7" rx="1.5" fill="#b07a45" {...line} />
      <path d="M20 18 C18 22 18 26 19 29" {...shine} />
    </>
  ),
};

// Prestatieprijzen: een medaille aan een lint, met een eigen teken in het midden.

function starPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

function Flame({ label }: { label: string }) {
  return (
    <>
      <path
        d="M32 29 C36 34 41 37 41 44 C41 50 37 53 32 53 C27 53 23 50 23 44 C23 39 27 37 28 32 C30 35 31 36 32 29 Z"
        fill="#f39c12"
        {...line}
        strokeWidth={1.5}
      />
      <path
        d="M32 40 C35 43 37 45 37 48 C37 51 35 52 32 52 C29 52 27 51 27 48 C27 45 30 43 32 40 Z"
        fill="#f7c531"
      />
      <text x="32" y="51" textAnchor="middle" fontSize="11" fontWeight="bold" fill={INK}>
        {label}
      </text>
    </>
  );
}

interface MedalLook {
  ribbon: [string, string];
  metal: Metal;
  emblem: (metal: Metal) => React.ReactElement;
}

const medals: Record<string, MedalLook> = {
  'first-game': {
    ribbon: ['#3f7fd9', '#e74c3c'],
    metal: BRONZE,
    emblem: () => (
      <>
        <path d="M27 53 V32" {...line} strokeWidth={2.5} />
        <path d="M27 32 L40 37 L27 42 Z" fill="#e74c3c" {...line} strokeWidth={1.5} />
      </>
    ),
  },
  practice: {
    ribbon: ['#3aa655', '#2b7f40'],
    metal: BRONZE,
    emblem: () => (
      <>
        <circle cx="32" cy="42" r="10" fill="#ffffff" {...line} strokeWidth={1.5} />
        <circle cx="32" cy="42" r="6.5" fill="#e74c3c" {...line} strokeWidth={1.5} />
        <circle cx="32" cy="42" r="3" fill="#ffffff" {...line} strokeWidth={1.5} />
        <path d="M32 42 L41 33 M38 32 L41 33 L42 36" {...line} fill="none" strokeWidth={2} />
      </>
    ),
  },
  'streak-3': {
    ribbon: ['#f39c12', '#e74c3c'],
    metal: SILVER,
    emblem: () => <Flame label="3" />,
  },
  flawless: {
    ribbon: ['#3aa655', '#3f7fd9'],
    metal: SILVER,
    emblem: () => (
      <path
        d="M24 42 L30 48 L41 35"
        fill="none"
        stroke="#2b7f40"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  'quiz-master': {
    ribbon: ['#9b59b6', '#3f7fd9'],
    metal: SILVER,
    emblem: () => (
      <text x="32" y="50" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#7b3fa0">
        ?
      </text>
    ),
  },
  'streak-7': {
    ribbon: ['#e74c3c', '#f39c12'],
    metal: GOLD,
    emblem: () => <Flame label="7" />,
  },
  'all-stars': {
    ribbon: ['#3f7fd9', '#f7c531'],
    metal: GOLD,
    emblem: (metal) => (
      <>
        {[
          [32, 36, 6.5],
          [25, 46, 5.5],
          [39, 46, 5.5],
        ].map(([cx, cy, r]) => (
          <polygon
            key={`${cx}-${cy}`}
            points={starPoints(cx, cy, r)}
            fill="#fff3b0"
            stroke={metal.dark}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ))}
      </>
    ),
  },
  'world-tour': {
    ribbon: ['#1abc9c', '#3f7fd9'],
    metal: GOLD,
    emblem: () => (
      <>
        <circle cx="32" cy="42" r="10" fill="#4aa3df" {...line} strokeWidth={1.5} />
        <path d="M25 37 C28 35 31 38 29 41 C27 44 31 46 34 44 C36 43 36 48 33 50" fill="#57b85a" />
        <path d="M35 34 C39 34 41 38 38 40 C36 41 34 38 35 34 Z" fill="#57b85a" />
        <circle cx="32" cy="42" r="10" fill="none" {...line} strokeWidth={1.5} />
        <ellipse cx="32" cy="42" rx="4.5" ry="10" fill="none" stroke={INK} strokeWidth={1} />
      </>
    ),
  },
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

/** Medaille van een prestatieprijs. */
export const AchievementArt: React.FC<ArtProps> = ({ id, size = 64 }) => {
  const look = medals[id];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {look && (
        <>
          <path d="M19 3 H30 L36 27 H27 Z" fill={look.ribbon[0]} {...line} />
          <path d="M45 3 H34 L28 27 H37 Z" fill={look.ribbon[1]} {...line} />
          <circle cx="32" cy="42" r="18" fill={look.metal.body} {...line} />
          <circle cx="32" cy="42" r="14" fill="none" stroke={look.metal.dark} strokeWidth={2} />
          {look.emblem(look.metal)}
          <path d="M19 36 C20 33 22 30 25 28" {...shine} />
        </>
      )}
    </svg>
  );
};
