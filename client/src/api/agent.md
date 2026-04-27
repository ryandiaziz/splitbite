# API Layer Standards

## Responsibilities
- Managing Axios instances and configurations.
- Defining service functions for API interactions.
- Handling interceptors for authentication, logging, and error handling.

## Rules
- **Naming**: Use camelCase for service functions (e.g., `fetchRoomData`, `createRoom`).
- **Organization**: Group related APIs into service files (e.g., `roomService.ts`, `userService.ts`).
- **Error Handling**: Do not catch errors locally unless necessary; let the caller (usually TanStack Query) handle them.
- **Typing**: Every API request and response must have a corresponding TypeScript interface in `src/types`.
- **Axios Instance**: Always use the pre-configured axios instance from `client.ts`.
