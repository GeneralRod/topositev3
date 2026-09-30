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

- [x] Nederland (lijst gemaakt en goedgekeurd, na feedback 74 onderdelen in 6 pakketten, staat
      helemaal in `scripts/nederland/items.mjs`): 1 provincies (12), 2 hoofdstad en
      provinciehoofdsteden (13), 3 grote steden (15), 4 zeeën, meren en zeearmen (12), 5 rivieren
      tot aan zee (9: Rijn, Waal, Nederrijn, Lek, IJssel, Maas, Merwede, Nieuwe Maas, Nieuwe
      Waterweg; elke rivier een eigen tint blauw), 6 Waddeneilanden, gebieden, Afsluitdijk en
      Vaalserberg (13, met Biesbosch en Loonse en Drunense Duinen). Gecombineerd: 1+2, 2+3,
      1+2+3, 4+5, 4+5+6 en alles; interactieve kaart per pakket; oefentoets. Zie "Kaart van
      Nederland" hieronder.
- [ ] Europa: landen en hoofdsteden
- [x] Landen van de wereld (lijst van de eigenaar, 75 landen in 3 pakketten; staat in
      `scripts/landen/items.mjs`): pakket 1 (50, ook los te oefenen per werelddeel: Europa,
      Afrika, Noord-Amerika, Azië, Zuid-Amerika, Oceanië), pakket 2 (10), pakket 3 (15),
      gecombineerd 1+2, 2+3, 1+2+3, en een interactieve kaart per pakket. De landen komen uit de
      wereldkaart zelf (world-atlas), dus ze passen er precies op en er laadt niets extra's;
      Engeland komt uit de 'map units' van Natural Earth (`node scripts/landen/build.mjs`).
      Buurlanden krijgen een andere tint. Een heel klein pakket (Oceanië: 2 landen) krijgt bij
      meerkeuze foute antwoorden uit de rest van de landen. Bij meerkeuze schuift de kaart
      naar wat er knippert als dat buiten beeld ligt.
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

**Kaart van Nederland (september 2026)**

Nederland heeft een eigen kaart in plaats van de wereldkaart, veel preciezer (tot op enkele
meters), gebouwd met `node scripts/nederland/build.mjs` (± 2 minuten; de ruwe bronnen komen
één keer in `scripts/nederland/.cache`, niet in git). Resultaat: `src/data/nederland/places.json`
en `map.json` (TopoJSON, ~260 KB ingepakt, pas geladen bij het spelen).

- Bronnen (vrij te gebruiken, vermeld op de kaart): CBS-gemeenten 2025 (provincies, eilanden,
  Zeeuws-Vlaanderen, Noordoostpolder), Kadaster (grondgebied, TOP10NL-streken en Vaalserberg),
  Rijkswaterstaat NWB (vaarwegen voor rivieren en kanalen, wegen voor de Afsluitdijk),
  Natural Earth (buurlanden en de rest van Europa).
- Land: de CBS-gemeenten, samengevoegd per provincie. CBS tekent langs gemeentegrenzen door het
  water dunne nep-stroken (bijv. dwars over de Westerschelde); die haalt het script weg, net als
  strekdammen en pieren. Dammen, sluizen en bruggen tússen twee wateren blijven staan
  (Houtribdijk, Haringvlietbrug, Oosterscheldekering).
- Water: alles wat geen land is, opgedeeld met 'zaadpunten' en knippen (bijv. tussen de
  Waddeneilanden, de Straat van Dover); alles in `scripts/nederland/water.mjs`. Water dat niet in
  de lijst staat (Veerse Meer, Volkerak, Eems, Duitse Waddenzee, Kanaal) blijft lichtblauw.
- Buurlanden iets grijzer; kust blauw, landsgrens donkerbruin, provinciegrenzen dun.
- Beginbeeld: heel Nederland, knop "Heel Nederland"; inzoomen tot niveau 11.
- Rivieren tot aan zee (wens eigenaar): de Rijn via Nederrijn, Lek, Nieuwe Maas en Nieuwe
  Waterweg (met het Scheur en de Maasmond); de Waal via de Merwede en de Maas via de Amer naar
  het Hollands Diep. Aansluitende rivieren hebben altijd een andere tint blauw.
- Op de interactieve kaart staat de naam van een stad er meteen bij als je de muis erop zet
  (net als bij zeeën en gebieden), voor alle onderwerpen.

**Oefentoets (september 2026, wens eigenaar)**

- [x] Net als de echte topotoets: er knippert een plek, het kind schrijft de naam op. Toets
      pakket 1, 1 + 2 of 1 + 2 + 3 (enz.), in delen: eerst alle vragen van pakket 1, dan pakket
      2, dan pakket 3. Lengte kiezen: kort (25% van elk pakket, minstens 3), normaal (50%,
      minstens 5) of alles. Elke keer andere plekken.
- [x] Nakijken coulant (topotoets, geen spellingtoets): goed zodra duidelijk is welke plek het
      kind bedoelt, ook als die heel anders geschreven is; fout als het meer op een andere plek
      lijkt (Irak/Iran, Niger/Nigeria). Andere namen en lijkende landen in
      `src/content/aliases.ts`, regels in `src/game/toets.ts`.
- [x] Pas aan het eind: cijfer = goed / totaal × 10 (één decimaal), per deel en in totaal, met
      per vraag wat je schreef (en hoe je het schrijft). Beste cijfer per toets en lengte bewaard;
      5 munten per goed antwoord; fouten gaan naar "mijn lastige ...".

**Later**

- [ ] Geluidjes bij goed en fout (met aan/uit-knop)

### Fase 7: accounts (optioneel)

Wens eigenaar (september 2026): een account zodat je voortgang bewaard blijft en op elke
computer terug is. **Inloggen blijft optioneel**: gewoon oefenen zonder account moet altijd
direct kunnen, zonder gedoe.

**Besluiten eigenaar (30 september 2026)**

- Eerst alleen een account voor kinderen en ouders. Klassen en leerkrachten komen later (7b).
- Inloggen met e-mail + wachtwoord. Een kind kan het zelf; is het jonger dan 16, dan vult een
  ouder of verzorger het e-mailadres in (toestemming ouders, AVG).
- Dienst: Supabase, met de gegevens in Europa. De eigenaar heeft al een Supabase-account.

**Uitgangspunten**

- Zonder account verandert er niets: voortgang blijft in de browser (localStorage), zoals nu.
- Met account wordt dezelfde voortgang óók online bewaard en is hij op elke computer terug.
  De site blijft eerst in de browser opslaan en stuurt wijzigingen daarna door; zonder internet
  speel je gewoon door en wordt het later bijgewerkt.
- Alle opslag loopt al via `src/storage`; het account komt daar bij, de spellen zelf hoeven
  nauwelijks te veranderen. Online staat per account één rij met dezelfde gegevens als in de
  browser.
- Er gaat niets verloren: wie inlogt op een computer waar al gespeeld is, neemt die voortgang
  mee in het account (samenvoegen, zie hieronder).

**Samenvoegregels** (`src/storage/merge.ts`)

Samenvoegen gebeurt met drie versies: wat er online staat, wat er in deze browser staat, en
wat er bij het laatste bijwerken hetzelfde was (de "basis"; leeg als je op deze computer nog
nooit met dit account ingelogd was). Zo telt alleen wat er sindsdien nieuw is bij.

- Munten: online + wat er in deze browser sinds de basis bij kwam of af ging (nooit onder 0).
  Heb je zonder account gespeeld en log je voor het eerst in, dan tellen beide dus op.
- Prijzen, stickers, kast-upgrades en prestatieprijzen: alles van beide kanten.
- Sterren en toetscijfers: het beste van de twee.
- Lastige plekken: fouten van beide kanten opgeteld; de reeks van de kant waar het laatst
  gespeeld is.
- Dagelijkse uitdaging: de recentste dag; is dat dezelfde dag, de langste reeks.
- Lopende spellen, kaststijl en speelmanier: is maar één kant veranderd, dan die kant. Is een
  spel aan beide kanten veranderd, dan het spel waarin het verst gekomen is; bij kaststijl en
  speelmanier dan de keuze van deze computer.
- Bekend nadeel: koop je zonder internet op twee computers dezelfde prijs, dan betaal je
  twee keer. Dat komt bijna nooit voor en is het ingewikkelder maken niet waard.

**Privacy (AVG) gaat vóór de techniek**

- Zo min mogelijk bewaren: alleen het e-mailadres (om in te loggen) en spelgegevens; geen
  naam, achternaam of geboortedatum.
- Kinderen onder de 16: toestemming van ouders nodig, daarom vult een ouder het e-mailadres
  in. Dit staat bij het aanmaken van het account.
- Gegevens in Europa, een duidelijke privacyverklaring (verantwoordelijke: de eigenaar van de
  site) en een knop om je account en alle gegevens te verwijderen.

**Stappen 7a: account voor kinderen en ouders** (elk een eigen pull request)

- [x] Plan en besluiten vastleggen (dit stuk)
- [x] Fundering, nog niets zichtbaar: samenvoegregels als pure functies met tests, en in
      `src/storage` een manier om wijzigingen te volgen en gegevens in één keer te vervangen
- [x] Supabase inrichten: project in de EU, tabel met voortgang per account, beveiligd zodat je
      alleen je eigen voortgang kunt lezen en schrijven. Project `topografiewereld`
      (`xjzapefnqfmwudchwvhl`, Frankfurt, gratis plan); tabel in
      `supabase/migrations/20260930190000_progress.sql`, beveiliging getest met twee
      proefaccounts.
- [ ] Inloggen: knop bovenaan; account maken, inloggen, wachtwoord vergeten, uitloggen
- [ ] Synchroniseren: voortgang online bewaren en ophalen, samenvoegen bij inloggen; uitloggen
      op een gedeelde computer laat de voortgang van dat account niet achter
- [ ] Privacyverklaring en account + gegevens verwijderen

**Later 7b: klassen en leerkrachten**

- Inloggen voor kinderen zonder e-mailadres: de leerkracht maakt een klas en krijgt een
  klascode; een kind logt in met klascode + voornaam of bijnaam + plaatjes- of cijfercode
  (eventueel inlogkaartjes met QR-code).
- Leerkracht: overzicht per klas (welke pakketten, hoeveel sterren, lastige plekken van de klas,
  reeksen) en eventueel pakketten als huiswerk klaarzetten.
- Gebruik via scholen: de school is verantwoordelijk, met een verwerkersovereenkomst.
