## 2024-05-18 - Avoid unstable object references in props

**Learning:** When parent components filter arrays dynamically on every render (e.g. `cities.filter(...)`) and pass them down as props, it forces child components (like `ShapeLayers`) to recalculate dependencies or use workarounds (like mapping to a joined string `places.map(p => p.name).join('|')`) to maintain stable references for `useMemo`/`useEffect` hooks.
**Action:** Memoize array filters/transformations in parent components using `useMemo` so that they do not get re-created on every render unless their dependencies actually change. Also declare static Leaflet icons outside of functional components to prevent object churn.
