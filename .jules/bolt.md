## 2024-10-28 - React-Leaflet Event Handlers Re-Attachment

**Learning:** Passing inline objects to `eventHandlers` prop in `react-leaflet` components (like `<Marker eventHandlers={{ click: () => ... }} />`) causes Leaflet event listeners to be removed and re-added on every re-render. This creates significant performance bottlenecks when many elements (like cities/markers) are rendered and map state updates frequently.
**Action:** Always use strictly memoized objects or stable references for `eventHandlers` in `react-leaflet`. Use a `useMemo` map indexed by identifier (like city name) for collections, and ensure callbacks like `onClick` maintain the latest reference without causing re-renders by utilizing `useRef` and `useLayoutEffect`.
