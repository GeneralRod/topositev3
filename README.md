# Topografie Wereld

Een Nederlandstalige oefensite voor topografie: hoofdsteden en wereldsteden aanwijzen op de kaart,
munten verdienen en prijzen verzamelen in de prijzenkast.

Live: [topografiewereldtest.netlify.app](https://topografiewereldtest.netlify.app)

## Aan de slag

Nodig: Node.js 20.19 of nieuwer (22 aanbevolen).

```bash
npm install      # afhankelijkheden installeren
npm run dev      # ontwikkelserver op http://localhost:5173/
npm run build    # typecheck + productiebuild naar dist/
npm run lint     # ESLint
npm run format   # code netjes opmaken met Prettier
```

## Publiceren

De site wordt gehost op **Netlify**. Alles wat op `main` komt, wordt automatisch gebouwd en
gepubliceerd (zie `netlify.toml`). Werk daarom nooit direct op `main`: maak een branch, open een
pull request en bekijk eerst de deploy-preview die Netlify bij de pull request plaatst.

Elke pull request wordt door GitHub Actions gecontroleerd (lint, opmaak, typecheck en build).

## Techniek

React 19, TypeScript, Vite, react-leaflet (kaarten), three.js (wereldbol op de startpagina) en
Emotion (styling).

## Plan

Het herbouwplan en de voortgang staan in [PLAN.md](PLAN.md).

## Licentie

MIT
