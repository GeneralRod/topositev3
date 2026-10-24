## 2024-05-18 - React-Leaflet Event Handlers Re-Render Performance

**Learning:** Passing inline objects to `eventHandlers` prop in `react-leaflet` components (like `eventHandlers={{ click: () => ... }}`) causes severe performance degradation. This happens because Leaflet's internal event listeners are unbound and rebound on every single render cycle when a new object reference is passed. This is especially problematic in map applications with many interactive markers or shapes.

**Action:** Always memoize the event handlers passed to `react-leaflet` components, typically using `useMemo`. When you need access to the latest state or props in these handlers, use a stable ref pattern (updating `.current` in `useLayoutEffect`) rather than adding the state/props to the `useMemo` dependency array, to maintain stable object references and prevent Leaflet from resetting the listeners.
