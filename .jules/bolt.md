## 2025-02-12 - Memoizing react-leaflet Event Handlers

**Learning:** In `react-leaflet`, passing inline objects to `eventHandlers` (e.g., `eventHandlers={{ click: () => ... }}`) causes Leaflet event listeners to be removed and re-added on every single React re-render. This creates severe performance bottlenecks, especially in components with many layers or markers like maps.
**Action:** Always memoize event handler objects passed to `react-leaflet` components (like `<Marker>`, `<GeoJSON>`, `<Popup>`) using `useMemo`. When these handlers depend on changing props (like callbacks `onPick`), store the callback in a `useRef` and update it via `useLayoutEffect` to keep the event handler object's reference completely stable without relying on stale closures.
