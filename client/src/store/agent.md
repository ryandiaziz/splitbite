# Store (Redux Toolkit) Standards

## Responsibilities
- Global client-side state management.
- Persistent user data.

## Rules
- **Toolkit**: Always use `@reduxjs/toolkit` (slices, extraReducers).
- **Naming**: Slices should be named `[feature]Slice` (e.g., `authSlice.ts`).
- **Slices**: Keep slices focused. Use `createSlice`.
- **Selectors**: Define selectors in the same file as the slice for easy access.
- **Async**: Use `createAsyncThunk` for complex async logic if TanStack Query isn't sufficient.
- **Persistence**: Use a middleware or manual `useEffect` to sync with `localStorage` for specific slices (like `auth`).
