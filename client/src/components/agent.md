# Component Standards

## Responsibilities
- Presentation logic and UI structure.
- Small, reusable atoms and complex organism components.

## Rules
- **Structure**: 
  - `ui/`: For generic, low-level components (Buttons, Inputs).
  - `common/`: Shared layout components (Navbar, Footer).
  - `[feature]/`: Feature-specific components (e.g., `room/BillSplitter.tsx`).
- **Naming**: Use PascalCase for filenames and component names (e.g., `GlassCard.tsx`).
- **Props**: Always define props using TypeScript interfaces. Prefer `React.FC` or explicit return types.
- **Styling**: Use Tailwind CSS classes. Avoid inline styles unless dynamic.
- **Purity**: Keep components as "dumb" as possible. Move logic to hooks or Redux.
