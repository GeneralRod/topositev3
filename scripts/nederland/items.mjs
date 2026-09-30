// De lijst van de categorie "Nederland": 79 onderdelen in 6 pakketten.
// Na aanpassen: node scripts/nederland/build.mjs
//
// Soorten:
//   province  provincie (vlak)         city   stad (stip)
//   sea       water (vlak, onder het land getekend: het land tekent de kust)
//   river     rivier of kanaal (lijn)  island eiland (vlak)
//   region    streek of polder (vlak)  dike   dijk (lijn)     peak  berg (driehoekje)
//
// Bron per soort (zie build.mjs):
//   province: CBS-provincie (naam zoals CBS die schrijft)
//   city:     vaste coördinaten van het centrum; gecontroleerd tegen de CBS-gemeente
//   sea:      waterindeling uit water.mjs (zaadpunten en knippen)
//   river:    Rijkswaterstaat NWB vaarwegen, op naam van het vaarwegvak
//   island/region: CBS-gemeenten samen, of een TOP10NL-streek (Kadaster)

export const items = [
  // ---------- Pakket 1: de 12 provincies ----------
  ...[
    ['Groningen (provincie)', 'Groningen', 'In het noordoosten, aan de Waddenzee'],
    ['Friesland', 'Fryslân', 'In het noorden, met vier Waddeneilanden'],
    ['Drenthe', 'Drenthe', 'In het noordoosten, zonder zee of grote rivier'],
    ['Overijssel', 'Overijssel', 'In het oosten, aan de Duitse grens'],
    ['Flevoland', 'Flevoland', 'In het midden, drooggelegd land'],
    ['Gelderland', 'Gelderland', 'In het oosten: de grootste provincie'],
    ['Utrecht (provincie)', 'Utrecht', 'In het midden: de kleinste provincie op het vasteland'],
    ['Noord-Holland', 'Noord-Holland', 'In het westen, tussen Noordzee en IJsselmeer'],
    ['Zuid-Holland', 'Zuid-Holland', 'In het westen, aan de Noordzee'],
    ['Zeeland', 'Zeeland', 'In het zuidwesten: eilanden en zeearmen'],
    ['Noord-Brabant', 'Noord-Brabant', 'In het zuiden, aan de Belgische grens'],
    ['Limburg', 'Limburg', 'In het zuidoosten: de smalle strook langs de Maas'],
  ].map(([name, cbs, hint]) => ({
    name,
    package: 'nederland1',
    kind: 'province',
    province: cbs,
    hint,
  })),

  // ---------- Pakket 2: hoofdstad en provinciehoofdsteden ----------
  ...[
    ['Amsterdam', 52.3728, 4.8936, 'Amsterdam', 'Hoofdstad van Nederland (Noord-Holland)'],
    ['Groningen', 53.2192, 6.5667, 'Groningen', 'Provincie Groningen'],
    ['Leeuwarden', 53.2012, 5.7999, 'Leeuwarden', 'Provincie Friesland'],
    ['Assen', 52.9925, 6.5649, 'Assen', 'Provincie Drenthe'],
    ['Zwolle', 52.5125, 6.0944, 'Zwolle', 'Provincie Overijssel'],
    ['Lelystad', 52.5185, 5.4714, 'Lelystad', 'Provincie Flevoland'],
    ['Arnhem', 51.9851, 5.8987, 'Arnhem', 'Provincie Gelderland'],
    ['Utrecht', 52.0907, 5.1214, 'Utrecht', 'Provincie Utrecht'],
    ['Haarlem', 52.3809, 4.6368, 'Haarlem', 'Provincie Noord-Holland'],
    ['Den Haag', 52.0799, 4.3113, "'s-Gravenhage", 'Provincie Zuid-Holland (regering)'],
    ['Middelburg', 51.4988, 3.6109, 'Middelburg (Z.)', 'Provincie Zeeland'],
    ["'s-Hertogenbosch", 51.6887, 5.3033, "'s-Hertogenbosch", 'Provincie Noord-Brabant'],
    ['Maastricht', 50.8487, 5.6889, 'Maastricht', 'Provincie Limburg'],
  ].map(([name, lat, lng, gemeente, hint]) => ({
    name,
    package: 'nederland2',
    kind: 'city',
    lat,
    lng,
    gemeente,
    hint,
  })),

  // ---------- Pakket 3: grote steden ----------
  ...[
    ['Rotterdam', 51.9225, 4.4792, 'Rotterdam', 'Provincie Zuid-Holland'],
    ['Eindhoven', 51.4416, 5.4697, 'Eindhoven', 'Provincie Noord-Brabant'],
    ['Tilburg', 51.5555, 5.0913, 'Tilburg', 'Provincie Noord-Brabant'],
    ['Almere', 52.3702, 5.2141, 'Almere', 'Provincie Flevoland'],
    ['Breda', 51.589, 4.7759, 'Breda', 'Provincie Noord-Brabant'],
    ['Nijmegen', 51.8475, 5.8625, 'Nijmegen', 'Provincie Gelderland'],
    ['Apeldoorn', 52.2112, 5.9699, 'Apeldoorn', 'Provincie Gelderland'],
    ['Enschede', 52.2215, 6.8937, 'Enschede', 'Provincie Overijssel'],
    ['Amersfoort', 52.1561, 5.3878, 'Amersfoort', 'Provincie Utrecht'],
    ['Leiden', 52.1601, 4.497, 'Leiden', 'Provincie Zuid-Holland'],
    ['Dordrecht', 51.8133, 4.6901, 'Dordrecht', 'Provincie Zuid-Holland'],
    ['Deventer', 52.255, 6.1639, 'Deventer', 'Provincie Overijssel'],
    ['Venlo', 51.3704, 6.1724, 'Venlo', 'Provincie Limburg'],
    ['Den Helder', 52.9563, 4.7601, 'Den Helder', 'Provincie Noord-Holland'],
    ['Emmen', 52.7792, 6.9069, 'Emmen', 'Provincie Drenthe'],
  ].map(([name, lat, lng, gemeente, hint]) => ({
    name,
    package: 'nederland3',
    kind: 'city',
    lat,
    lng,
    gemeente,
    hint,
  })),

  // ---------- Pakket 4: zeeën, meren en zeearmen ----------
  ...[
    ['Noordzee', 'Zee ten westen en noorden van Nederland'],
    ['Waddenzee', 'Tussen de Waddeneilanden en het vasteland'],
    ['IJsselmeer', 'Meer achter de Afsluitdijk'],
    ['Markermeer', 'Meer tussen Noord-Holland en Flevoland'],
    ['Veluwemeer', 'Randmeer tussen Flevoland en de Veluwe'],
    ['Lauwersmeer', 'Meer tussen Friesland en Groningen'],
    ['Dollard', 'Baai in het uiterste noordoosten, bij Duitsland'],
    ['Oosterschelde', 'Zeearm in Zeeland met de stormvloedkering'],
    ['Westerschelde', 'Zeearm in Zeeland, de vaarweg naar Antwerpen'],
    ['Grevelingenmeer', 'Meer tussen Schouwen-Duiveland en Goeree-Overflakkee'],
    ['Haringvliet', 'Water ten zuiden van Voorne-Putten en de Hoeksche Waard'],
    ['Hollands Diep', 'Breed water tussen Zuid-Holland en Noord-Brabant'],
  ].map(([name, hint]) => ({ name, package: 'nederland4', kind: 'sea', hint })),

  // ---------- Pakket 5: rivieren (wens eigenaar: alleen deze, en tot aan zee) ----------
  // De Rijn komt via Nederrijn, Lek, Nieuwe Maas en Nieuwe Waterweg in zee; de Waal
  // via de Merwede en de Maas via de Amer in het Hollands Diep (en zo in zee).
  ...[
    ['Rijn', ['Boven-Rijn', 'Bijlandsch Kanaal, Boven-Rijn'], 'Komt bij Lobith Nederland binnen'],
    ['Waal', ['Waal'], 'Grootste rivier, langs Nijmegen'],
    [
      'Nederrijn',
      [
        'Pannerdensch Kanaal',
        'Neder-Rijn',
        'Voorhavens Sluiscomplex Driel, Neder-Rijn',
        'Bovenstrooms Stuwkanaal te Driel, Neder-Rijn',
        'Benedenstrooms Stuwkanaal te Driel, Neder-Rijn',
        'Voorhavens Sluiscomplex Amerongen, Neder-Rijn',
        'Bovenstrooms Stuwkanaal te Amerongen, Neder-Rijn',
        'Benedenstrooms Stuwkanaal te Amerongen, Neder-Rijn',
      ],
      'Langs Arnhem en Wageningen',
    ],
    [
      'Lek',
      [
        'Lek',
        'Voorhavens Sluiscomplex Hagestein, Lek',
        'Bovenstrooms Stuwkanaal te Hagestein, Lek',
        'Benedenstrooms Stuwkanaal te Hagestein, Lek',
      ],
      'Vervolg van de Nederrijn, tot bij Rotterdam',
    ],
    ['IJssel', ['Geldersche IJssel'], 'Van Arnhem naar het Ketelmeer, langs Deventer en Zwolle'],
    [
      'Maas',
      ['Maas', 'Bergsche Maas', 'Amer'],
      'Door Limburg en Brabant, langs Maastricht en Venlo, tot het Hollands Diep',
    ],
    [
      'Merwede',
      ['Boven-Merwede', 'Boven Merwede', 'Beneden-Merwede', 'Nieuwe Merwede'],
      'Vervolg van de Waal, bij Dordrecht',
    ],
    ['Nieuwe Maas', ['Nieuwe Maas'], 'Vervolg van de Lek, door Rotterdam'],
    [
      'Nieuwe Waterweg',
      // Het Scheur verbindt de Nieuwe Maas met de Nieuwe Waterweg; de Maasmond is de monding.
      ['Het Scheur', 'Nieuwe Waterweg', 'Maasmond'],
      'Van Rotterdam naar zee bij Hoek van Holland',
    ],
  ].map(([name, vaarwegen, hint]) => ({
    name,
    package: 'nederland5',
    kind: 'river',
    vaarwegen,
    hint,
    // Wens eigenaar: de Rijn een stukje Duitsland in (tot Duisburg), zodat je ziet
    // waar hij vandaan komt.
    ...(name === 'Rijn' ? { duitsland: [6.709, 51.446] } : {}),
  })),

  // ---------- Pakket 6: Waddeneilanden, gebieden en bijzondere plekken ----------
  ...[
    ['Texel', ['Texel'], 'Grootste Waddeneiland (Noord-Holland)'],
    ['Vlieland', ['Vlieland'], 'Waddeneiland (Friesland)'],
    ['Terschelling', ['Terschelling'], 'Waddeneiland (Friesland)'],
    ['Ameland', ['Ameland'], 'Waddeneiland (Friesland)'],
    ['Schiermonnikoog', ['Schiermonnikoog'], 'Kleinste bewoonde Waddeneiland (Friesland)'],
  ].map(([name, gemeenten, hint]) => ({
    name,
    package: 'nederland6',
    kind: 'island',
    gemeenten,
    hint,
  })),
  ...[
    ['Veluwe', { streek: 'Veluwe' }, 'Bosrijk gebied in Gelderland'],
    ['Achterhoek', { streek: 'Achterhoek' }, 'Oosten van Gelderland, aan de Duitse grens'],
    ['Twente', { streek: 'Twente' }, 'Oosten van Overijssel, met Enschede'],
    [
      'Noordoostpolder',
      { gemeenten: ['Noordoostpolder', 'Urk'] },
      'Flevoland, drooggelegd in 1942',
    ],
    [
      'Biesbosch',
      { streek: 'Biesbosch' },
      'Zoetwatergetijdengebied bij Dordrecht (nationaal park)',
    ],
    [
      'Loonse en Drunense Duinen',
      { streek: 'Loonse en Drunense Duinen' },
      'Zandverstuiving in Noord-Brabant (nationaal park)',
    ],
  ].map(([name, source, hint]) => ({
    name,
    package: 'nederland6',
    kind: 'region',
    ...source,
    hint,
  })),
  {
    name: 'Afsluitdijk',
    package: 'nederland6',
    kind: 'dike',
    hint: 'Dijk tussen Noord-Holland en Friesland',
  },
  {
    name: 'Vaalserberg',
    package: 'nederland6',
    kind: 'peak',
    streek: 'Vaalserberg',
    hint: 'Hoogste punt van Nederland (Limburg)',
  },
];
