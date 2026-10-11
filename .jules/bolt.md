## 2024-06-25 - React.memo silent failure on deep callback dependencies

**Learning:** `React.memo` on heavy components like `GameMap` can fail silently and surprisingly if callback props (like `onCityClick`) are re-created too often. This happens when the callback depends on a frequently changing state (like tracking wrong attempts) inside a custom hook (`useGame`).
**Action:** Use a `useRef` to track the latest state internally in the hook. Read `stateRef.current` inside the callback to remove the state dependency, making the callback reference stable across state changes and preserving memoization of child components.
