## 2024-10-16 - [react-leaflet] Inline objects in eventHandlers cause component re-renders

**Learning:** Passing an inline object to the `eventHandlers` prop in `react-leaflet` components (like `<Marker />` and `<GeoJSON />`) causes the Leaflet event listeners to be removed and re-added on _every single render_. This leads to significant performance bottlenecks, particularly when dealing with many shapes or markers in maps like `GameMap` and `ShapeLayers`.
**Action:** Always memoize the object passed to the `eventHandlers` prop when using `react-leaflet`, either via `useMemo` or by defining the object statically outside the component when it doesn't rely on component state or props.
