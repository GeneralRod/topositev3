## 2024-05-24 - React-Leaflet Event Handlers Performance Bottleneck

**Learning:** Passing inline objects to `eventHandlers` (e.g., `eventHandlers={{ click: () => ... }}`) in `react-leaflet` components causes Leaflet to remove and re-add event listeners on every re-render. This creates a severe performance bottleneck, especially when rendering many markers or shapes simultaneously.
**Action:** Always use stable or memoized event handlers when using `react-leaflet`. Pre-compute handler objects using `useMemo` to ensure the object reference remains the same across renders, preventing unnecessary DOM operations.
