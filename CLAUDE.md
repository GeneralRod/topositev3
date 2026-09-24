# Topografiewereld

Nederlandstalige topografie-oefensite (React 19 + TypeScript + Vite + react-leaflet).
De eigenaar is geen programmeur: leg keuzes in gewone taal uit, in het Nederlands.

## Regels

- `main` is de live site (Netlify publiceert automatisch). **Nooit direct naar `main` pushen.**
  Werk op `herbouw` of een branch daarvan en lever op via een pull request.
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
- `src/storage/`: alle localStorage-opslag (versie 2), met migratie van oude sleutels en versie 1
- `src/content/catalog.ts`: categorieën en pakketten als data
- `src/cabinet/`: de prijzenkast (catalogus, regels, tekeningen, scherm); testen met `?ontwikkelaar` in de url
- `src/ui/`: gedeelde knoppen, kaarten en kleuren
- `src/components/game/`: onderdelen van het spelscherm
