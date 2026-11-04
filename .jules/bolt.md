## 2023-11-20 - Memoizing React-Leaflet Event Handlers
**Learning:** Passing inline objects to `react-leaflet` components like `Marker` and `GeoJSON` (e.g., `eventHandlers={{ click: ... }}`) causes the underlying Leaflet library to continually attach and detach event listeners on every re-render, leading to significant performance degradation during rapid updates.
**Action:** Extract list items (like `Marker` or `GeoJSON` inside a `.map()`) into separate components wrapped in `React.memo`, and use `React.useMemo` within those components to supply a stable `eventHandlers` object.
