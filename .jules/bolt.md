## 2024-05-23 - Memoize Leaflet Event Handlers

**Learning:** React-Leaflet recreates DOM event listeners completely on every re-render when passed an inline object or an unstable reference for the `eventHandlers` prop. This can lead to heavy DOM thrashing for maps with many elements.
**Action:** Always memoize `eventHandlers` objects passed to `react-leaflet` components (like `Marker` or `GeoJSON`) using `useMemo`. When these handlers depend on external callbacks (like `onCityClick`), use a `useRef` and `useLayoutEffect` combination to access the latest callback reference inside the memoized handler without recreating the object on every render.
