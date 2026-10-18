## 2025-03-02 - React-Leaflet EventHandlers Performance Bottleneck

**Learning:** In `react-leaflet`, passing inline objects to `eventHandlers` (e.g., `eventHandlers={{ click: () => ... }}`) causes Leaflet event listeners to be removed and re-added on every single React re-render. This creates severe performance bottlenecks, especially when rendering many markers or shapes (like cities or areas on a map).
**Action:** Always use stable or memoized event handlers (e.g., using `useMemo` to create a dictionary of handlers, or `useCallback`) when passing the `eventHandlers` prop to `react-leaflet` components such as `Marker`, `GeoJSON`, or `Popup`.
