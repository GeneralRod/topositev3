# Herbouwplan Topografiewereld

Doel: het project een stabiele basis geven waar weer op verder gebouwd kan worden,
zonder dat de live site ooit stuk gaat tijdens het werk.

## Werkafspraken (sandbox)

- **`main` = de live site.** Netlify (`topografiewereld.netlify.app`) bouwt en publiceert
  automatisch alles wat op `main` komt. Er wordt dus **nooit direct op `main` gepusht**.
- Al het werk gebeurt op branch `herbouw` (of een branch daarvan) en gaat via een pull request.
  De eigenaar bekijkt de preview en merget zelf pas als alles werkt.
- Elke fase eindigt met een werkende build (`npm run build`), lint (`npm run lint`) en tests.
- De site is Nederlandstalig; teksten voor spelers blijven Nederlands.
- Voortgang en munten van bestaande spelers (localStorage) mogen niet verloren gaan.

## Doelgroep

Kinderen die topografie oefenen, op een **laptop of computer** (niet bedoeld voor telefoons).
Mobiel is daarom geen prioriteit; muis en toetsenbord wel.

## Huidige stand (september 2026)

- React 19 + TypeScript + Vite 7 + react-leaflet + three.js. Ongeveer 3.000 regels code.
- Hosting: **Netlify is de enige hosting** (besluit eigenaar). GitHub Pages staat nog aan, maar
  serveert de ruwe broncode van `main` en toont een wit scherm; dat wordt opgeruimd. Het domein
  `topografiewereld.nl` is opgezegd: verwijzingen ernaar (o.a. `homepage` in `package.json`,
  README) moeten weg.

### Gevonden problemen

1. `src/components/TitlePage.tsx`: de animatielus (`requestAnimationFrame`) wordt nooit gestopt.
   Elke keer terug naar de startpagina start een extra lus: geheugen- en CPU-lek.
2. `src/components/Game.tsx` (700 regels): spelregels, opslag, munten en UI door elkaar.
   - `selectNextCity` wordt vanuit meerdere plekken aangeroepen (klik-handler én een effect dat
     op elke `cityStatus`-wijziging reageert), dus de gevraagde stad kan verspringen en een
     opgeslagen `currentCity` wordt overschreven.
   - Het voltooiingseffect roept `addCoins(bonus)` aan zolang alles groen is; bij opnieuw
     renderen of een hervat voltooid spel kan de bonus meerdere keren worden uitgekeerd.
   - `setScore` wordt binnen een `setCityStatus`-updater aangeroepen (bijwerking in updater).
3. Kaart kan niet zoomen of slepen: in Europa liggen stippen op elkaar; op mobiel slecht speelbaar.
4. Dode/halve code: `WorldMap.tsx`, `worldMapData.ts`, `continentsGeo.ts` worden niet gebruikt;
   `features/trophy-system` bevat Engelse placeholderdata en een ongebruikte hook.
5. Externe afhankelijkheden: aarde-texture van threejs.org, marker-iconen van cdnjs.
6. CI (`.github/workflows`) draait op Node 18, terwijl Vite 7 Node 20.19+ nodig heeft.
   Twee deploy-routes (GitHub Pages-workflow én Netlify).
7. Bundel van ~1 MB in één bestand, grotendeels three.js voor de startpagina.
8. Rommel in git: `dist/`, `.jest-cache/`, lege `.env`; `package.json` heet nog `topositev2`;
   README bevat placeholders.

## Fases

### Fase 1: veiligheidsnet en opruimen

- [x] `dist/`, `.jest-cache/`, `.env`, `*.tsbuildinfo` uit git en in `.gitignore`
- [x] Ongebruikte bestanden verwijderen
- [x] CI naar Node 22; één workflow die lint + typecheck + test + build draait op PR's
- [x] GitHub Pages-deploy-workflow, `gh-pages`-script/dependency en `public/404.html`-hack weghalen;
      `vite.config.ts` base op `/`. (GitHub Pages zelf uitzetten in de repo-instellingen doet de
      eigenaar, of na expliciete toestemming.)
- [x] `package.json` naam/versie, README bijwerken
- [x] Openstaande dependabot-PR's beoordelen (o.a. Vite 8): Vite 8, @vitejs/plugin-react 6,
      react-icons 5.6 en eslint-plugin-react-refresh 0.5 zijn meegenomen. ESLint 10 (#64) wacht nog:
      nog niet alle lint-plugins ondersteunen ESLint 10.

### Fase 2: nieuwe fundering

- [x] Testopzet met Vitest
- [x] Spelregels als pure functies (`src/game/`): volgende stad kiezen, antwoord verwerken,
      munten/bonus berekenen, voltooiing. Met unit tests.
- [x] Eén opslaglaag met versienummer en migratie van de huidige localStorage-sleutels
      (`topografie_game_state_*`, `topositev2_total_coins`, `topositev2_ribbons_owned`,
      `topositev2_real_prizes_owned`)
- [x] Inhoud als data: categorieën → pakketten → locaties, zodat een nieuw onderwerp alleen data is
- [x] `Game.tsx` opsplitsen in kleine componenten die de spelregels gebruiken
- [x] Gedeelde UI-componenten (knoppen, kaarten, header) in plaats van kopieën per scherm

### Fase 3: sneller

- [x] Routes lazy laden (code splitting); three.js alleen op de startpagina
- [x] Animatielek fixen; lichtere wereldbol, texture zelf hosten
- [x] Marker-iconen lokaal (niet meer nodig: het spel gebruikt eigen stippen, CDN-verwijzing is weg)

### Fase 4: nieuwe features

- [x] Prijzenkast opnieuw ontworpen (`src/cabinet/`): houten ontdekkerskast met 4 thema-planken
      × 4 plekken, eigen tekeningen, lege plekken als doel (schaduw + prijs), stickers op de
      zijpanelen, kopen vanuit de kast. Oude prijzen blijven; linten en deurspullen worden
      teruggegeven als munten (opslag versie 2). Ontwikkelaarsknoppen alleen met `?ontwikkelaar`.
- [x] Werkplaats: kast opknappen met kleuren (kersen, walnoot, zeeblauw, mintgroen, snoeproze)
      en extra's (lampjes, windroos, gouden randen, glitters); gekocht = altijd wisselbaar.

### Fase 5: nieuw design

- [ ] Consistente stijl (kleuren, typografie), mobile-first

### Fase 6: verbeterplan (september 2026)

Afspraak: elk deel is een eigen pull request met voorbeeldlink. De eigenaar test en geeft een
oké; pas dan gaat het live. Het huidige pakket "Hoofd- en wereldsteden" blijft zoals het is.

**Deel 1: de kaart**

- [x] Zoomen en slepen met de muis, plus een knop "Hele wereld" die de kaart terugzet
- [x] Kaart zonder namen, zodat inzoomen het antwoord niet verraadt: eigen kaart met landen en
      grenzen uit Natural Earth (`world-atlas`), geen externe kaartdienst of sleutel nodig
- [x] Versienummer bijwerken (9.0)
- [ ] GitHub Pages uitzetten (instelling op GitHub, door de eigenaar)

**Deel 2: slimmer oefenen**

- [x] Oefenrondje "Mijn lastige steden": een stad is lastig na een fout, tot je hem twee keer
      achter elkaar in één keer goed hebt (`src/game/progress.ts`)
- [x] Sterren per pakket (3 = foutloos, 2 = hooguit 1 fout per 10 steden, anders 1), beste
      score zichtbaar op de pakketkaarten en in het eindscherm

**Deel 3: tweede speelmanier**

- [x] Meerkeuze: een stip knippert, kies de goede naam uit vier (ook met toetsen 1-4); hint haalt
      twee foute antwoorden weg; halve munten, geen sterren; keuze onthouden op het pakketscherm
- [x] Maximaal aantal hints per spel: 5 bij aanwijzen, 3 bij meerkeuze (teller op de knop)

**Deel 4: dagelijkse uitdaging**

- [x] Elke dag 10 vaste steden (voor iedereen dezelfde); bonus 50 munten +10 per dag in je reeks
      (max 120); één keer per dag (`src/game/daily.ts`)

**Deel 5: meer om te verdienen**

- [x] Extra prijzen en stickers: vijfde plank "Wereldwonderen" (molen, Eiffeltoren, piramides,
      Vrijheidsbeeld) en 4 stickers (tulp, palmboom, walvis, luchtballon)
- [x] Prestatieprijzen, niet te koop maar te verdienen: 8 medailles (`src/game/achievements.ts`),
      bijv. foutloos, 3 dagen op rij, pakket 1 + 2 + 3. De kast staat in het midden met links en
      rechts een prestatiebord (makkelijk links, moeilijk rechts). Nieuwe medailles staan in het
      eindscherm; wie al sterren had krijgt ze bij het openen van de kast. Geen munten erbij: de
      medaille is de prijs.
- [x] Opgelost: het oplichten van prijzen die je kunt kopen (en het 'plop'-effect na kopen)
      werkte niet, omdat de animatie niet goed aan Emotion werd doorgegeven

**Deel 6 en verder: nieuwe onderwerpen** (elk onderwerp een eigen deel)

- [ ] Nederland: provinciehoofdsteden en grote steden
- [ ] Nederland: provincies, rivieren en wateren
- [ ] Europa: landen en hoofdsteden
- [ ] De wereld: landen
- Wateren en landschappen over de wereld (lijst van de eigenaar, 70 onderdelen in 4 pakketten;
  staat helemaal in `scripts/wateren/items.mjs`):
  - [x] Pakket 1 (40): oceanen, zeeën, rivieren, meren, woestijnen, gebergtes en bergen.
        Interactieve kaart erbij. Meerkeuze kiest foute antwoorden van dezelfde soort.
  - [x] Pakket 2 (10) en gecombineerd pakket 1 + 2. Zeegrenzen worden per paar zeeën bewaard,
        zodat een pakket alleen de grenzen toont van zijn eigen zeeën.
  - [x] Pakket 3 (10) met "Pakket 2 + 3" en "Pakket 1 + 2 + 3". Lago de Maracaibo (een meer)
        telt niet als Caribische Zee.
  - [x] Pakket 4 (10) met "Pakket 3 + 4" en "Alle pakketten" (70). De Marianentrog komt uit de
        dieptekaart van Natural Earth: de stukken dieper dan 6000 m langs de Marianen waar ook
        een plek dieper dan 7000 m in ligt (zonder de gaatjes van onderzeese bergen).

**Aanpak voor precieze wateren, bergen en gebieden (besluit eigenaar)**

Pakketten met bijvoorbeeld de Rijn, de Nijl of het Gardameer moeten visueel extreem precies zijn.
Zo is het gebouwd (september 2026, akkoord eigenaar):

- Bron: Natural Earth 1:10 miljoen (publiek domein, dezelfde bron als de wereldkaart);
  OpenStreetMap alleen als een onderdeel ingezoomd te grof oogt. OSM heeft oceanen, woestijnen
  en gebergtes nauwelijks als vorm, en de rivieren zijn daar te zwaar voor de site.
- `node scripts/wateren/build.mjs` maakt `src/data/wateren/places.json` (klein) en
  `shapes.json` (vormen, ~340 KB ingepakt, pas geladen bij het spelen). Eén bestand per
  onderwerp in plaats van per pakket, omdat de dagelijkse uitdaging en het oefenrondje over
  pakketten heen gaan.
- Zeeën: de grove zeevlakken van Natural Earth liggen ónder het land, zodat het land de precieze
  kust tekent. Kleine baaien gaan vanzelf naar de buurzee met de langste gedeelde grens;
  twijfelgevallen (Indonesische zeeën, Zuidelijke Oceaan) horen nergens bij.
- Meren, rivieren, woestijnen en gebergtes liggen boven het land. Rivieren: klikken tot een
  paar pixels naast de lijn telt ook. Bergtoppen: driehoekje op de precieze top.
- Na het antwoord kleurt de vorm groen (in één keer goed) of paarsblauw (na een fout).
- Goed zichtbaar waar je kunt klikken (wens eigenaar): elke zee die meedoet heeft een eigen tint
  blauw (buurzeeën altijd verschillend), water dat niet meedoet blijft lichtblauw. Wijs je iets
  aan, dan licht het op (zee: voller met witte rand; rivier: dikker; gebied: voller) en wordt de
  muis een handje, ook boven zeeën.
- Meren die niet in het pakket zitten staan er altijd als gewoon lichtblauw water (niet aan te
  klikken), want de wereldkaart zelf heeft geen meren (besluit eigenaar).
- Inzoomen tot niveau 7: dieper laat alleen zien hoe grof de kust van de wereldkaart is.
- Wordt het geheel te zwaar, dan overstappen op vector-tegels (PMTiles + MapLibre) op de eigen
  site. Geen externe kaartdienst of sleutel.
- Bronvermelding (Natural Earth; later OpenStreetMap, PDOK) op de kaart.

**Later**

- [ ] Geluidjes bij goed en fout (met aan/uit-knop)
