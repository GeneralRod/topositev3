# Topografiewereld

Nederlandstalige topografie-oefensite (React 19 + TypeScript + Vite + react-leaflet).
De eigenaar is geen programmeur: leg keuzes in gewone taal uit, in het Nederlands.

## Regels

- `main` is de live site (Netlify publiceert automatisch). **Nooit direct naar `main` pushen.**
  Werk op een eigen branch per deel (bijv. `deel5-prijzen`, altijd vers vanaf `main`) en lever op
  via een pull request. Netlify maakt per pull request een voorbeeldlink; de eigenaar test die
  en geeft een oké, pas daarna mergen. Merge nooit zonder oké van de eigenaar.
- Werkwijze: het verbeterplan staat in `PLAN.md` (fase 6). Elk deel is één pull request.
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
  (`ShapeLayers.tsx`, `shapes.ts`)
- `scripts/wateren/`: maakt de kaartgegevens van "Wateren en landschappen" uit Natural Earth
  (`items.mjs` = de lijst; na aanpassen `node scripts/wateren/build.mjs` draaien)

## Stand van zaken (overdracht, 25 september 2026)

- Live: fase 1 t/m 3, nieuwe prijzenkast met werkplaats, fase 6 deel 1 t/m 5 (kaart, lastige
  steden en sterren, meerkeuze, dagelijkse uitdaging, extra prijzen en prestatiebord), en de
  categorie "Wateren en landschappen over de wereld" pakket 1 en 2 (met tinten per zee,
  oplichten bij aanwijzen en namen op de interactieve kaart).
- Open: pull request met pakket 3 van die categorie, wacht op oké eigenaar.
- Volgende: pakket 4 (in `items.mjs` staat het al; zet het in `ENABLED` in `build.mjs`,
  controleer elk onderdeel op de kaart, en bedenk een lijn voor de Marianentrog), daarna
  Nederland. Zie `PLAN.md` fase 6.
- Kaartprecisie nooit lager dan nu (Natural Earth 10m, `SEA_SIMPLIFY = 1e-3`): wens eigenaar.
- Pakket-id's moeten uniek zijn over alle categorieën (sterren en spellen worden per id bewaard).
- Testen in de browser: `npm run build && npx vite preview`, prijzenkast met `?ontwikkelaar`.
- GitHub Pages uitzetten (Settings → Pages) moet de eigenaar zelf nog doen.
