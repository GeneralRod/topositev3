## 2026-11-07 - Stable Event Handlers for React-Leaflet

**Learning:** Passing inline objects to `eventHandlers` in `react-leaflet` components causes Leaflet to unregister and reregister event handlers on every re-render, creating a significant performance bottleneck.
**Action:** Always use stable or memoized event handlers (e.g. by caching handlers by ID with a custom hook or ref) when rendering many features on a Leaflet map.
