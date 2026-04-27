# Type Standards

## Responsibilities
- Centralizing all TypeScript interfaces and types.
- Ensuring type safety across the app.

## Rules
- **Naming**: 
  - Interfaces: `I[Name]` (optional, e.g., `IRoom`) or just `[Name]`.
  - Types: `T[Name]` (optional).
  - API Responses: `[Name]Response`.
- **Files**: Group by domain (e.g., `room.types.ts`, `api.types.ts`).
- **Enums**: Use `enum` or literal types for fixed sets of values.
- **Strictness**: Avoid `any` at all costs. Use `unknown` if necessary.
