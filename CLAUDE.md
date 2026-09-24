# Topografiewereld

Nederlandstalige topografie-oefensite (React 19 + TypeScript + Vite + react-leaflet).
De eigenaar is geen programmeur: leg keuzes in gewone taal uit, in het Nederlands.

## Regels

- `main` is de live site (Netlify publiceert automatisch). **Nooit direct naar `main` pushen.**
  Werk op `herbouw` of een branch daarvan en lever op via een pull request.
- Het herbouwplan en de voortgang staan in `PLAN.md`. Vink taken af als ze klaar zijn.
- Voor elke commit: `npm run lint`, `npm run build` (en `npm test` zodra die bestaat) moeten slagen.
- Voortgang en munten van spelers in localStorage mogen niet verloren gaan.

## Commando's

- `npm run dev`: dev-server (lokaal op `/topositev3/`, zolang `base` in `vite.config.ts` zo staat)
- `npm run build`: productiebuild naar `dist/`
- `npm run lint`: ESLint
