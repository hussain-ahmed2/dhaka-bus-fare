# Next.js App Router Guidelines

You are working in a Next.js App Router project (`dhaka-bus-fare`).

## Component Architecture
- Use React Server Components (RSC) by default.
- Only add `'use client'` directive when you need client-side interactivity, state (useState, useEffect), or browser APIs.
- Keep client components as small as possible and push them down the tree.

## Data Fetching
- Fetch data on the server in Server Components.
- Use `fetch` API directly, Next.js extends it with caching and revalidation options.
- Avoid `useEffect` for data fetching unless fetching from client components after a user interaction.

## Routing
- Use nested layouts (`layout.tsx`) to share UI across routes.
- Use route groups `(folder)` to organize routes without affecting the URL path.
- Keep `page.tsx` strictly for the main route content.
- Use Next.js built-in Server Actions (`'use server'`) for handling form submissions and data mutations.

## State Management
- Use URL query parameters for shareable state (e.g., search queries, pagination, selected items).
- Use React state for purely UI-driven temporary state (toggles, accordions).

## UI & Styling
- We use Tailwind CSS for styling.
- We use `shadcn/ui` components located in `components/ui`.
- Icons are from `lucide-react`.

## File Naming
- Use `kebab-case` for all component file names and directory names, e.g., `fare-calculator.tsx`.

## Agent Skills
- Always consult and follow the skills available in the `.agents/skills` directory.
- When performing a task that matches an available skill, read its `SKILL.md` file first and adhere strictly to its instructions.

## TypeScript Rules
- NEVER use the `any` type in this codebase under any circumstances. Use strict typing, Generics, `unknown`, or utility types like `Parameters<T>` instead.

## Verification & QA
- ALWAYS run `npm run lint` and type checking (e.g. `npx tsc --noEmit` or `npm run build`) after writing code or before concluding tasks. Do not skip this step.
