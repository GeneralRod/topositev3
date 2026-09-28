// De lijst van de categorie "Landen van de wereld" (van de eigenaar): 75 landen in
// 3 pakketten. Pakket 1 is ook per werelddeel te oefenen, daarom heeft elk land
// uit pakket 1 een groep per werelddeel. Na aanpassen:
//   node scripts/landen/build.mjs
//
// atlas: naam (of namen) van het land in world-atlas (Natural Earth 1:50 miljoen),
//        dezelfde kaart als de wereldkaart van de site, dus precies passend.
// within: alleen de delen van het land binnen dit kader [west, zuid, oost, noord]
//         (bijv. Frankrijk zonder Frans-Guyana).

const WERELDDELEN = {
  europa: 'Europa',
  afrika: 'Afrika',
  'noord-amerika': 'Noord-Amerika',
  azie: 'Azië',
  'zuid-amerika': 'Zuid-Amerika',
  oceanie: 'Oceanië',
};

/** [naam, atlasnaam of -namen, extra] per werelddeel. */
const PAKKET_1 = {
  europa: [
    ['Nederland', 'Netherlands', { within: [3, 50, 8, 54] }],
    ['Duitsland', 'Germany'],
    ['Frankrijk', 'France', { within: [-6, 41, 10, 52] }],
    // Op de wereldkaart is het Verenigd Koninkrijk één land; Engeland komt uit de
    // 'map units' van Natural Earth (zie build.mjs).
    ['Engeland', null, { england: true }],
    ['Spanje', 'Spain'],
    ['Italië', 'Italy'],
    ['Zweden', 'Sweden'],
    ['IJsland', 'Iceland'],
  ],
  afrika: [
    ['Zuid-Afrika', 'South Africa'],
    ['Egypte', 'Egypt'],
    ['Madagaskar', 'Madagascar'],
    ['Marokko', 'Morocco'],
    ['Ghana', 'Ghana'],
    // Somaliland hoort er (volgens de rest van de wereld) bij.
    ['Somalië', ['Somalia', 'Somaliland']],
    ['Sudan', 'Sudan'],
    ['Democratische Republiek Kongo', 'Dem. Rep. Congo'],
    ['Algerije', 'Algeria'],
    ['Tunesië', 'Tunisia'],
    ['Libië', 'Libya'],
    ['Angola', 'Angola'],
  ],
  'noord-amerika': [
    ['Verenigde Staten', 'United States of America'],
    ['Canada', 'Canada'],
    ['Mexico', 'Mexico'],
    ['Cuba', 'Cuba'],
  ],
  azie: [
    ['Rusland', 'Russia'],
    ['Turkije', 'Turkey'],
    ['Israël', 'Israel'],
    ['Syrië', 'Syria'],
    ['Iran', 'Iran'],
    ['Irak', 'Iraq'],
    ['Saudi-Arabië', 'Saudi Arabia'],
    ['Kazachstan', 'Kazakhstan'],
    ['Afghanistan', 'Afghanistan'],
    ['China', 'China'],
    ['Mongolië', 'Mongolia'],
    ['Japan', 'Japan'],
    ['Noord-Korea', 'North Korea'],
    ['Zuid-Korea', 'South Korea'],
    ['Thailand', 'Thailand'],
    ['India', 'India'],
    ['Filipijnen', 'Philippines'],
    ['Indonesië', 'Indonesia'],
  ],
  'zuid-amerika': [
    ['Brazilië', 'Brazil'],
    ['Argentinië', 'Argentina'],
    ['Chili', 'Chile'],
    ['Colombia', 'Colombia'],
    ['Venezuela', 'Venezuela'],
    ['Suriname', 'Suriname'],
  ],
  oceanie: [
    ['Australië', 'Australia'],
    ['Nieuw-Zeeland', 'New Zealand'],
  ],
};

const PAKKET_2 = [
  ['Noorwegen', 'Norway', 'europa'],
  ['Griekenland', 'Greece', 'europa'],
  ['Jamaica', 'Jamaica', 'noord-amerika'],
  ['Peru', 'Peru', 'zuid-amerika'],
  ['Bolivia', 'Bolivia', 'zuid-amerika'],
  ['Nigeria', 'Nigeria', 'afrika'],
  ['Ethiopië', 'Ethiopia', 'afrika'],
  ['Papoea-Nieuw-Guinea', 'Papua New Guinea', 'oceanie'],
  ['Pakistan', 'Pakistan', 'azie'],
  ['Vietnam', 'Vietnam', 'azie'],
];

const PAKKET_3 = [
  ['Oostenrijk', 'Austria', 'europa'],
  ['Oekraïne', 'Ukraine', 'europa'],
  ['Finland', 'Finland', 'europa'],
  ['Haïti', 'Haiti', 'noord-amerika'],
  ['Panama', 'Panama', 'noord-amerika'],
  ['Ecuador', 'Ecuador', 'zuid-amerika'],
  ['Paraguay', 'Paraguay', 'zuid-amerika'],
  ['Uruguay', 'Uruguay', 'zuid-amerika'],
  ['Kenia', 'Kenya', 'afrika'],
  ['Senegal', 'Senegal', 'afrika'],
  ['Tanzania', 'Tanzania', 'afrika'],
  ['Qatar', 'Qatar', 'azie'],
  ['Jemen', 'Yemen', 'azie'],
  ['Myanmar', 'Myanmar', 'azie'],
  ['Maleisië', 'Malaysia', 'azie'],
];

const asList = (atlas) => (atlas === null ? [] : Array.isArray(atlas) ? atlas : [atlas]);

export const items = [
  ...Object.entries(PAKKET_1).flatMap(([deel, landen]) =>
    landen.map(([name, atlas, extra = {}]) => ({
      name,
      package: `landen1-${deel}`,
      hint: WERELDDELEN[deel],
      atlas: asList(atlas),
      ...extra,
    })),
  ),
  ...[
    ['landen2', PAKKET_2],
    ['landen3', PAKKET_3],
  ].flatMap(([pkg, landen]) =>
    landen.map(([name, atlas, deel]) => ({
      name,
      package: pkg,
      hint: WERELDDELEN[deel],
      atlas: asList(atlas),
    })),
  ),
];
