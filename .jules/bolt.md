## 2024-10-06 - Memoization of Array Filtrations on Render

**Learning:** Array `.filter()` inside React components runs on every render, recreating the array reference even if the data didn't change. When passing these recreated arrays to heavy child components like Leaflet's `MapContainer` or mapping over them to render multiple elements (like Leaflet Markers), it can cause unnecessary recalculations or re-renders of child components. The performance penalty is quite visible when dealing with large datasets like cities and map shapes on a canvas.

**Action:** Wrap `.filter()`, `.map()` or `.find()` operations that return new objects/arrays inside `useMemo`, depending on their dependency inputs (e.g. `[cities]`). This preserves the array reference as long as the inputs are stable and avoids unnecessary operations and potential re-renders in heavily nested or Canvas-based React trees.
