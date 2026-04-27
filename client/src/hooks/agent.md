# Hook Standards

## Responsibilities
- Reusable business logic and side effects.
- Abstracting complex state or API logic.

## Rules
- **Naming**: Always prefix with `use` (e.g., `useWebSocket`, `useRoomSync`).
- **Composition**: Prefer small, focused hooks that do one thing well.
- **Cleanup**: Always return a cleanup function in `useEffect` if needed (e.g., WebSocket close, event listener removal).
- **Dependencies**: Be strict with dependency arrays. Avoid using `any`.
