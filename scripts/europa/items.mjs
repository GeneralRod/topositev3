// De lijst van de categorie "Europa": 88 onderdelen in 6 pakketten (indeling
// goedgekeurd door de eigenaar, 1 oktober 2026). Na aanpassen:
//   node scripts/europa/build.mjs
//
// Soorten:
//   country  land (vlak), uit Natural Earth 1:10 miljoen (world-atlas); `atlas` zijn
//            de namen daar (meer namen = samen één land)
//   city     hoofdstad of klein land (stip), met vaste coördinaten

const country = (pkg) => (row) => {
  const [name, atlas, hint] = row;
  return { name, package: pkg, kind: 'country', atlas, hint };
};
const city = (pkg) => (row) => {
  const [name, lat, lng, hint] = row;
  return { name, package: pkg, kind: 'city', lat, lng, hint };
};

export const items = [
  // ---------- Pakket 1: landen van West- en Noord-Europa ----------
  ...[
    ['Nederland', ['Netherlands'], 'Aan de Noordzee, tussen België en Duitsland'],
    ['België', ['Belgium'], 'Tussen Nederland en Frankrijk'],
    ['Luxemburg', ['Luxembourg'], 'Klein land tussen België, Frankrijk en Duitsland'],
    ['Duitsland', ['Germany'], 'Groot land ten oosten van Nederland'],
    ['Frankrijk', ['France'], 'Ten zuiden van België, met kust aan twee zeeën'],
    [
      'Verenigd Koninkrijk',
      ['United Kingdom', 'Isle of Man', 'Jersey', 'Guernsey'],
      'Eilanden aan de overkant van de Noordzee',
    ],
    ['Ierland', ['Ireland'], 'Eiland ten westen van Groot-Brittannië'],
    ['IJsland', ['Iceland'], 'Eiland ver in het noordwesten, in de Atlantische Oceaan'],
    ['Noorwegen', ['Norway'], 'Lang land langs de westkust van Scandinavië'],
    ['Zweden', ['Sweden'], 'In het midden van Scandinavië'],
    ['Finland', ['Finland', 'Åland'], 'Ten oosten van Zweden, aan de Oostzee'],
    ['Denemarken', ['Denmark'], 'Ten noorden van Duitsland, tussen Noordzee en Oostzee'],
    ['Spanje', ['Spain'], 'Het grootste deel van het Iberisch Schiereiland'],
    ['Portugal', ['Portugal'], 'Aan de westkust van het Iberisch Schiereiland'],
    ['Italië', ['Italy'], 'De laars in de Middellandse Zee'],
    ['Zwitserland', ['Switzerland'], 'Bergland in de Alpen, zonder zee'],
    ['Oostenrijk', ['Austria'], 'In de Alpen, ten oosten van Zwitserland'],
  ].map(country('europa1')),

  // ---------- Pakket 2: landen van Midden- en Oost-Europa ----------
  ...[
    ['Polen', ['Poland'], 'Ten oosten van Duitsland, aan de Oostzee'],
    ['Tsjechië', ['Czechia'], 'Ten zuidoosten van Duitsland, zonder zee'],
    ['Slowakije', ['Slovakia'], 'Tussen Polen en Hongarije'],
    ['Hongarije', ['Hungary'], 'In Midden-Europa, aan de Donau'],
    ['Slovenië', ['Slovenia'], 'Klein land tussen Italië, Oostenrijk en Kroatië'],
    ['Estland', ['Estonia'], 'Het noordelijkste van de drie Baltische staten'],
    ['Letland', ['Latvia'], 'De middelste van de drie Baltische staten'],
    ['Litouwen', ['Lithuania'], 'Het zuidelijkste van de drie Baltische staten'],
    ['Wit-Rusland', ['Belarus'], 'Tussen Polen en Rusland, zonder zee'],
    ['Oekraïne', ['Ukraine'], 'Groot land aan de Zwarte Zee'],
    ['Moldavië', ['Moldova'], 'Klein land tussen Roemenië en Oekraïne'],
    ['Rusland', ['Russia'], 'Het grootste land: het oosten van Europa (en Azië)'],
  ].map(country('europa2')),

  // ---------- Pakket 3: landen van Zuidoost-Europa ----------
  ...[
    ['Kroatië', ['Croatia'], 'Lange kust aan de Adriatische Zee'],
    ['Bosnië en Herzegovina', ['Bosnia and Herz.'], 'Op de Balkan, tussen Kroatië en Servië'],
    ['Servië', ['Serbia'], 'Midden op de Balkan, zonder zee'],
    ['Montenegro', ['Montenegro'], 'Klein land aan de Adriatische Zee, ten zuiden van Bosnië'],
    ['Kosovo', ['Kosovo'], 'Klein land ten zuiden van Servië'],
    ['Albanië', ['Albania'], 'Aan de Adriatische Zee, tegenover de hak van Italië'],
    ['Noord-Macedonië', ['Macedonia'], 'Ten noorden van Griekenland, zonder zee'],
    ['Griekenland', ['Greece'], 'In het zuidoosten, met heel veel eilanden'],
    ['Bulgarije', ['Bulgaria'], 'Aan de Zwarte Zee, ten zuiden van Roemenië'],
    ['Roemenië', ['Romania'], 'Aan de Zwarte Zee, ten noorden van Bulgarije'],
    ['Turkije', ['Turkey'], 'Voor een klein deel in Europa, de rest in Azië'],
    [
      'Cyprus',
      ['Cyprus', 'N. Cyprus', 'Cyprus U.N. Buffer Zone', 'Akrotiri', 'Dhekelia'],
      'Eiland in het oosten van de Middellandse Zee',
    ],
  ].map(country('europa3')),

  // ---------- Pakket 4: hoofdsteden van West- en Noord-Europa ----------
  ...[
    ['Amsterdam', 52.3728, 4.8936, 'Hoofdstad van Nederland'],
    ['Brussel', 50.8467, 4.3525, 'Hoofdstad van België'],
    ['Luxemburg (stad)', 49.6116, 6.1319, 'Hoofdstad van Luxemburg'],
    ['Berlijn', 52.52, 13.405, 'Hoofdstad van Duitsland'],
    ['Parijs', 48.8566, 2.3522, 'Hoofdstad van Frankrijk'],
    ['Londen', 51.5074, -0.1278, 'Hoofdstad van het Verenigd Koninkrijk'],
    ['Dublin', 53.3498, -6.2603, 'Hoofdstad van Ierland'],
    ['Reykjavik', 64.1466, -21.9426, 'Hoofdstad van IJsland'],
    ['Oslo', 59.9139, 10.7522, 'Hoofdstad van Noorwegen'],
    ['Stockholm', 59.3293, 18.0686, 'Hoofdstad van Zweden'],
    ['Helsinki', 60.1699, 24.9384, 'Hoofdstad van Finland'],
    ['Kopenhagen', 55.6867, 12.5701, 'Hoofdstad van Denemarken'],
    ['Madrid', 40.4168, -3.7038, 'Hoofdstad van Spanje'],
    ['Lissabon', 38.7223, -9.1393, 'Hoofdstad van Portugal'],
    ['Rome', 41.9028, 12.4964, 'Hoofdstad van Italië'],
    ['Bern', 46.948, 7.4474, 'Hoofdstad van Zwitserland'],
    ['Wenen', 48.2082, 16.3738, 'Hoofdstad van Oostenrijk'],
  ].map(city('europa4')),

  // ---------- Pakket 5: hoofdsteden van Midden-, Oost- en Zuidoost-Europa ----------
  ...[
    ['Warschau', 52.2297, 21.0122, 'Hoofdstad van Polen'],
    ['Praag', 50.0755, 14.4378, 'Hoofdstad van Tsjechië'],
    ['Bratislava', 48.1486, 17.1077, 'Hoofdstad van Slowakije'],
    ['Boedapest', 47.4979, 19.0402, 'Hoofdstad van Hongarije'],
    ['Ljubljana', 46.0569, 14.5058, 'Hoofdstad van Slovenië'],
    ['Tallinn', 59.437, 24.7536, 'Hoofdstad van Estland'],
    ['Riga', 56.9496, 24.1052, 'Hoofdstad van Letland'],
    ['Vilnius', 54.6872, 25.2797, 'Hoofdstad van Litouwen'],
    ['Minsk', 53.9006, 27.559, 'Hoofdstad van Wit-Rusland'],
    ['Kyiv', 50.4501, 30.5234, 'Hoofdstad van Oekraïne'],
    ['Chisinau', 47.0105, 28.8638, 'Hoofdstad van Moldavië'],
    ['Moskou', 55.7558, 37.6173, 'Hoofdstad van Rusland'],
    ['Zagreb', 45.815, 15.9819, 'Hoofdstad van Kroatië'],
    ['Sarajevo', 43.8563, 18.4131, 'Hoofdstad van Bosnië en Herzegovina'],
    ['Belgrado', 44.7866, 20.4489, 'Hoofdstad van Servië'],
    ['Podgorica', 42.4304, 19.2594, 'Hoofdstad van Montenegro'],
    ['Pristina', 42.6629, 21.1655, 'Hoofdstad van Kosovo'],
    ['Tirana', 41.3275, 19.8187, 'Hoofdstad van Albanië'],
    ['Skopje', 41.9981, 21.4254, 'Hoofdstad van Noord-Macedonië'],
    ['Athene', 37.9838, 23.7275, 'Hoofdstad van Griekenland'],
    ['Sofia', 42.6977, 23.3219, 'Hoofdstad van Bulgarije'],
    ['Boekarest', 44.4268, 26.1025, 'Hoofdstad van Roemenië'],
    ['Ankara', 39.9334, 32.8597, 'Hoofdstad van Turkije'],
    ['Nicosia', 35.1856, 33.3823, 'Hoofdstad van Cyprus'],
  ].map(city('europa5')),

  // ---------- Pakket 6: kleine landen (stip; als vlak te klein om aan te klikken) ----------
  ...[
    ['Andorra', 42.5462, 1.6016, 'In de Pyreneeën, tussen Frankrijk en Spanje'],
    ['Monaco', 43.7384, 7.4246, 'Aan de Franse kust, vlak bij Italië'],
    ['Liechtenstein', 47.141, 9.5209, 'Tussen Zwitserland en Oostenrijk'],
    ['San Marino', 43.9424, 12.4578, 'Midden in Italië'],
    ['Vaticaanstad', 41.9029, 12.4534, 'Midden in Rome: het kleinste land van de wereld'],
    ['Malta', 35.9175, 14.4091, 'Eilandjes ten zuiden van Sicilië'],
  ].map(city('europa6')),
];

/** De kleine landen van pakket 6 met hun naam in world-atlas (getekend als land). */
export const smallCountries = {
  Andorra: 'Andorra',
  Monaco: 'Monaco',
  Liechtenstein: 'Liechtenstein',
  'San Marino': 'San Marino',
  Vaticaanstad: 'Vatican',
  Malta: 'Malta',
};
