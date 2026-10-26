## 2023-10-26 - React-Leaflet Event Handlers Performance

**Learning:** Passing inline objects to `eventHandlers` in `react-leaflet` components (like `<Marker eventHandlers={{ click: () => ... }} />`) causes Leaflet to remove and re-add event listeners on every re-render. In a map with many shapes or markers, this leads to severe performance degradation due to continuous DOM and Leaflet operations.

**Action:** Always pass a stable reference to `eventHandlers` using `useMemo` or a constant object. If the callback relies on updated state or props, use a `useLayoutEffect` to keep a ref to the latest callback function without invalidating the memoized handler object.
