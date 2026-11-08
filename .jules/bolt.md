
## 2024-05-15 - React Leaflet Event Handlers
**Learning:** Passing inline objects to `eventHandlers` prop in `react-leaflet` components causes Leaflet to unbind and rebind the event listener to the DOM on every single React re-render. This causes severe performance issues when rendering hundreds of map shapes or markers.
**Action:** Always memoize the `eventHandlers` object passed to `react-leaflet` components using `useMemo` or a custom hook with a `useRef` cache if the handlers rely on item specific data. Remember to remove `any` when defining type, to pass ESLint tests. Always add comments in the codebase explaining the optimization. Never push utility scripts that are used to run your operations to the repository.
