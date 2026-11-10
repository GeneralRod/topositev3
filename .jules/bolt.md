## 2026-11-10 - [Memoize react-leaflet inline eventHandlers]
**Learning:** Passing inline objects to `eventHandlers` in `react-leaflet` components (like `<Marker>` or `<GeoJSON>`) causes Leaflet event listeners to be removed and re-added on every re-render, creating severe performance bottlenecks, especially in loops.
**Action:** Always use stable or memoized event handler maps (using `useMemo`) and stabilize callback functions (e.g. using `useRef` and `useLayoutEffect`) when passing them to `react-leaflet` components to avoid unnecessary listener re-attachments.
