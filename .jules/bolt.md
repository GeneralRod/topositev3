
## 2025-02-09 - react-leaflet inline event handlers overhead
**Learning:** By default, passing inline object literals (like `eventHandlers={{ click: ... }}`) to react-leaflet components causes Leaflet to unbind and rebind DOM event listeners on every single render. When many elements are present (e.g. game map markers, geoJSON shapes), this causes a severe performance bottleneck.
**Action:** Use `useMemo` combined with the "latest ref" pattern (`useRef` + `useLayoutEffect`) to provide completely stable `eventHandlers` references to Leaflet components. Ensure dependencies in `useMemo` are stable or strictly represent the raw data array, not derived arrays created dynamically on every render (which break memoization).
