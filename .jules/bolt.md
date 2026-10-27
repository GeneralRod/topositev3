## 2024-05-18 - Stable Event Handlers with React Leaflet

**Learning:** In `react-leaflet`, passing inline objects to `eventHandlers` (e.g., `eventHandlers={{ click: () => ... }}`) causes Leaflet event listeners to be removed and re-added on every component re-render, creating severe performance bottlenecks, especially on maps with many interactable markers/shapes.
**Action:** When assigning `eventHandlers` to `react-leaflet` components, use `useMemo` to create stable dictionaries of handlers and `useLayoutEffect` combined with `useRef` to securely update and execute any volatile callbacks (e.g., `onCityClick`) without causing stale closures or triggering unnecessary re-renders.
