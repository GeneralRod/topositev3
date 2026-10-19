## 2024-05-18 - Inline Event Handlers in Leaflet

**Learning:** Passing inline objects to `eventHandlers` in `react-leaflet` (e.g., `eventHandlers={{ click: () => ... }}`) causes Leaflet event listeners to be removed and re-added on every re-render, creating severe performance bottlenecks.
**Action:** Always use stable or memoized event handlers for `react-leaflet` components, or create wrapper components that memoize the `eventHandlers` prop.
