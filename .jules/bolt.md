## 2024-10-27 - React.memo on WorldLayer

**Learning:** `WorldLayer` loads static TopoJSON data via an effect and draws paths as static `GeoJSON` objects. `GameMap` which uses `WorldLayer` re-renders each time a user clicks on a city to answer a question (since `status` is updated). Because `WorldLayer` is static and does not depend on game state or take any props, it should be wrapped in `React.memo` so that it doesn't needlessly try to re-render the heavy static map data on each city click.
**Action:** Wrap `WorldLayer` component in `React.memo` to optimize game re-renders when map markers change status.
