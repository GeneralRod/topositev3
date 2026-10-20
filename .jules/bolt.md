## 2025-02-12 - React-Leaflet Event Handlers Re-render Bottleneck

**Learning:** Passing inline objects to `eventHandlers` in `react-leaflet` components (like `<Marker>` or `<GeoJSON>`) causes Leaflet event listeners to be removed and re-added on _every_ React re-render. In apps with frequent re-renders or many map markers, this causes severe performance bottlenecks.
**Action:** Always memoize the `eventHandlers` object using `useMemo`. If the handler needs access to frequently changing props (like an `onClick` callback), store the callback in a `useRef` to maintain a stable handler reference while still executing the latest callback logic, ensuring the `useMemo` dependency array doesn't trigger unnecessary re-evaluations.
