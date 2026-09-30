# Topografiewereld

Nederlandstalige topografie-oefensite (React 19 + TypeScript + Vite + react-leaflet).
De eigenaar is geen programmeur: leg keuzes in gewone taal uit, in het Nederlands.

## Regels

- `main` is de live site (Netlify publiceert automatisch). **Nooit direct naar `main` pushen.**
  Werk op een eigen branch per deel (bijv. `deel5-prijzen`, altijd vers vanaf `main`) en lever op
  via een pull request. Netlify maakt per pull request een voorbeeldlink; de eigenaar test die
  en geeft een oké, pas daarna mergen. Merge nooit zonder oké van de eigenaar.
- Werkwijze: het verbeterplan staat in `PLAN.md` (fase 6). Elk deel is één pull request.
- Uitzondering, wens eigenaar (30 september 2026): de accounts (fase 7a) worden stap voor stap
  op één branch gebouwd (`account-inloggen`) en lokaal getest; GitHub is daarbij de back-up.
  Eén pull request (#115) voor alles samen, pas mergen als het helemaal af is en de eigenaar
  oké geeft.
- Het herbouwplan en de voortgang staan in `PLAN.md`. Vink taken af als ze klaar zijn.
- Voor elke commit: `npm run lint`, `npm run format:check`, `npm test` en `npm run build` moeten slagen.
- Voortgang en munten van spelers in localStorage mogen niet verloren gaan.

## Commando's

- `npm run dev`: dev-server op http://localhost:5173/
- `npm run format`: code opmaken met Prettier (CI controleert dit met `npm run format:check`)
- `npm run build`: productiebuild naar `dist/`
- `npm run lint`: ESLint
- `npm test`: unit tests (Vitest)

## Waar zit wat

- `src/game/rules.ts`: spelregels als pure functies (met tests ernaast)
- `src/game/useGame.ts`: koppelt spelregels aan React en opslag
- `src/game/achievements.ts`: prestatieprijzen (medailles die je alleen kunt verdienen)
- `src/storage/`: alle localStorage-opslag (versie 2), met migratie van oude sleutels en versie 1
- `src/content/catalog.ts`: categorieën en pakketten als data
- `src/cabinet/`: de prijzenkast (catalogus, regels, tekeningen, scherm); testen met `?ontwikkelaar` in de url
- `src/ui/`: gedeelde knoppen, kaarten en kleuren
- `src/components/game/`: onderdelen van het spelscherm
- `src/components/map/`: wereldkaart (`world.ts`), vormen voor zeeën/rivieren/gebieden
  (`ShapeLayers.tsx`, `shapes.ts`), eigen ondergrond per onderwerp (`baseMap.ts`, `BaseLayer.tsx`)
- `scripts/wateren/`: maakt de kaartgegevens van "Wateren en landschappen" uit Natural Earth
  (`items.mjs` = de lijst; na aanpassen `node scripts/wateren/build.mjs` draaien)
- `scripts/landen/`: lijst van "Landen van de wereld" (`items.mjs`); `node scripts/landen/build.mjs`
  maakt `src/data/landen/places.json` en `england.json`; de vormen zelf komen van de wereldkaart
- `src/storage/merge.ts`: voortgang van browser en account samenvoegen (regels in `PLAN.md` fase 7)
- `src/account/`: accounts (inloggen via Supabase, scherm `/account`); nog verborgen, knop
  zichtbaar na `?account` in de url
- `supabase/`: de database van de accounts (Supabase-project `topografiewereld`,
  id `xjzapefnqfmwudchwvhl`, Frankfurt, gratis plan; moet gratis blijven: wens eigenaar);
  `supabase/README.md` = instellingen die de eigenaar in het dashboard doet
- `scripts/nederland/`: maakt de kaart van Nederland uit CBS, Kadaster, Rijkswaterstaat en
  Natural Earth (`items.mjs` = de lijst, `water.mjs` = indeling van het water; daarna
  `node scripts/nederland/build.mjs` draaien, ± 2 minuten)

## Stand van zaken (overdracht, 30 september 2026)

- Live: fase 1 t/m 3, nieuwe prijzenkast met werkplaats, fase 6 deel 1 t/m 5 (kaart, lastige
  steden en sterren, meerkeuze, dagelijkse uitdaging, extra prijzen en prestatiebord), en de
  categorie "Wateren en landschappen over de wereld" compleet: alle 70 onderdelen in pakket
  1 t/m 4 (met tinten per zee, oplichten bij aanwijzen, namen op de interactieve kaart).
- Ook live: meren buiten het pakket altijd als gewoon water.
- Ook in het plan: fase 7 (optionele accounts).
- Ook live: "Nederland" (74 plekken in 6 pakketten, eigen precieze kaart; rivieren tot aan zee
  met een eigen tint blauw, de Rijn tot Duisburg; ook in de oefentoets).
- Nog open: 5 updates van Dependabot (#64, #103 t/m #106), nog niet bekeken.
- Ook live: "Landen van de wereld" (75 landen, pakket 1 ook per werelddeel).
- Ook live: de oefentoets (namen opschrijven, in delen per pakket, met cijfer; onderaan de
  pagina van elk onderwerp). Code in `src/game/toets.ts` en `src/components/Toets.tsx`.
- Jules (Google) maakt soms pull requests; die worden beoordeeld en het goede wordt overgenomen
  in één eigen pull request (zie #111).
- Netlify heet nu `topografiewereld` (live: https://topografiewereld.netlify.app); voorbeeldlinks
  zijn `deploy-preview-<nummer>--topografiewereld.netlify.app`.
- Volgende: bijv. Europa (`PLAN.md` fase 6). Voor later: optionele accounts voor kinderen en
  leerkrachten (`PLAN.md` fase 7); oefenen zonder account moet altijd blijven werken.
- Kaartprecisie nooit lager dan nu (Natural Earth 10m, `SEA_SIMPLIFY = 1e-3`): wens eigenaar.
- Pakket-id's moeten uniek zijn over alle categorieën (sterren en spellen worden per id bewaard).
- Testen in de browser: `npm run build && npx vite preview`, prijzenkast met `?ontwikkelaar`.
- GitHub Pages uitzetten (Settings → Pages) moet de eigenaar zelf nog doen.
