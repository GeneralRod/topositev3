# TopografieWereld

[![Build Status](https://github.com/<your-username>/<your-repo>/actions/workflows/test.yml/badge.svg)](https://github.com/<your-username>/<your-repo>/actions/workflows/test.yml)
[![Format Status](https://github.com/<your-username>/<your-repo>/actions/workflows/format.yml/badge.svg)](https://github.com/<your-username>/<your-repo>/actions/workflows/format.yml)
[![Dependencies](https://img.shields.io/librariesio/github/<your-username>/<your-repo>)](https://libraries.io/github/<your-username>/<your-repo>)
[![Uptime Robot](https://img.shields.io/badge/uptime-monitoring-lightgrey?logo=uptimerobot)](https://uptimerobot.com/)

An interactive platform for practicing world capitals and geography.

## 🚀 Getting Started

1. Clone the repo
2. `npm install`
3. `npm run dev`

## 🧪 Testing

Currently there is no automated test suite.

- Run `npm run lint` to check for linting errors.
- Run `npx prettier --check .` to verify code formatting.

## 🤝 How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).

## 🌐 Live Site

[https://topografiewereld.nl](https://topografiewereld.nl)

## 🛡️ License

MIT

---

> **Note:** To enable the UptimeRobot badge, create a free account at [UptimeRobot](https://uptimerobot.com/), add your site, and replace the badge URL with your monitor's link.

# Topografie Wereld: hoofd- en wereldsteden

Een interactieve website om te oefenen met hoofdsteden en grote wereldsteden. De website is gebouwd met React, TypeScript en Vite.

## Features

- Oefenpakketten met verschillende steden
- Interactieve kaarten om steden te bekijken
- Score systeem
- Directe feedback bij goede en foute antwoorden

## Installatie

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Build voor productie
npm run build

# Deploy naar GitHub Pages
npm run deploy
```

## Technologieën

- React
- TypeScript
- Vite
- Leaflet voor de kaart
- Emotion voor styling

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
