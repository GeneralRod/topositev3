# Herbouwplan Topografiewereld

Doel: het project een stabiele basis geven waar weer op verder gebouwd kan worden,
zonder dat de live site ooit stuk gaat tijdens het werk.

## Werkafspraken (sandbox)

- **`main` = de live site.** Netlify (`topografiewereldtest.netlify.app`) bouwt en publiceert
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

- [ ] Kaart met zoomen/slepen (met de muis; stippen in Europa liggen nu op elkaar)
- [ ] Nieuwe categorieën (landen, wateren, gebergtes)
- [ ] Oefenmodus "moeilijkste steden" en voortgangsoverzicht
- [ ] Prijzensysteem afmaken

### Fase 5: nieuw design

- [ ] Consistente stijl (kleuren, typografie), mobile-first
