## 2024-05-24 - React-Leaflet Event Handlers Overhead

**Learning:** In `react-leaflet`, passing inline `eventHandlers={{ click: () => ... }}` causes the underlying Leaflet event listeners to be removed and re-added on every re-render. In a map with hundreds of markers, this creates a severe performance bottleneck during gameplay interactions.
**Action:** Extract map markers into a `React.memo` wrapped component (`CityMarker`) or use stable event handlers to prevent unnecessary Leaflet event bindings. Also stabilize callbacks in parent components to avoid breaking memoization.
