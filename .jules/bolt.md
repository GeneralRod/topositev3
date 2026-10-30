## 2024-05-24 - React-Leaflet EventHandlers Thrashing

**Learning:** Passing inline objects to `eventHandlers` in `react-leaflet` (e.g., `eventHandlers={{ click: () => ... }}`) causes severe performance bottlenecks because Leaflet listeners are removed and re-added on every re-render.
**Action:** Always use stable or memoized objects for the `eventHandlers` prop in `react-leaflet` components (like `Marker`, `GeoJSON`, `Popup`). Use `useMemo` combined with `useRef` + `useLayoutEffect` to keep stable references to callback functions while capturing their latest state/props.
