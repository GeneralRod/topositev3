## 2024-05-19 - React-Leaflet eventHandlers re-attachment performance bottleneck

**Learning:** In `react-leaflet`, passing inline objects to `eventHandlers` (e.g., `eventHandlers={{ click: () => ... }}`) causes Leaflet event listeners to be removed and re-added on every single render. Since `GameMap` and `ShapeLayers` render many markers/shapes, this was creating severe performance bottlenecks during game interactions.
**Action:** Always pre-calculate and memoize `eventHandlers` maps using `useMemo` when rendering lists of map items. Use `useRef` and `useLayoutEffect` to stabilize dynamic callback functions (like `onCityClick` or `pick`) inside the memoized handlers to avoid re-calculating the eventHandlers map when the callbacks change while complying with React concurrency rules.
