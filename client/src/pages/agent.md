# Page Standards

## Responsibilities
- Entry points for routes.
- Connecting components to global state (Redux) and data fetching (TanStack Query).
- Layout management.

## Rules
- **Naming**: Use PascalCase (e.g., `Home.tsx`, `RoomDashboard.tsx`).
- **Logic**: Minimize inline logic. Delegate to hooks or components.
- **Loading/Error**: Handle page-level loading and error states using TanStack Query states.
- **SEO**: Include meta tags or title updates if applicable.
