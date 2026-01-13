# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript source. Subfolders: `components/`, `pages/`, `hooks/`, `services/`, `types/`, `utils/`, assets in `assets/`.
- `public/`: Static assets served as-is.
- Entrypoints: `index.html`, `src/main.tsx`, `src/App.tsx`.
- `tests/`: Test files (see Testing Guidelines).
- `docs/`: Project documentation.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server with HMR.
- `npm run build`: Type-check (`tsc -b`) and build production bundle via Vite.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Lint with ESLint. Use `npm run lint -- --fix` to auto-fix.

## Coding Style & Naming Conventions
- Language: TypeScript, 2-space indent, prefer named exports.
- React: Function components, props typed via interfaces, avoid default exports.
- Naming: Components `PascalCase` (files in `src/components/MyWidget.tsx`), hooks `useCamelCase` (`src/hooks/useX.ts`), utils `camelCase.ts`, types in `src/types` (e.g., `card.ts`).
- Styling: Tailwind CSS (prefer utility classes over inline styles). Global styles in `src/index.css`.
- Linting: ESLint (typescript-eslint, react hooks). Code must pass `npm run lint`.

## Testing Guidelines
- Framework: Vitest + Testing Library (planned). Place tests under `tests/**/*.test.ts[x]` or colocated as `*.test.tsx`.
- Patterns: Test user-visible behavior, not implementation details; mock network in `services/` (e.g., via MSW).
- Coverage: Aim for >80% lines on new/changed code. Example (once added): `npx vitest run --coverage`.

## Commit & Pull Request Guidelines
- Commits: Imperative mood, concise. Optional scope tags like `[ui]`, `[build]`, `[docs]`.
  - Example: `feat(ui): add printable coloring card preview`.
- PRs: Clear description, linked issues (`#123`), screenshots for UI changes, test plan (steps/commands), and checklist of affected areas.
- Keep PRs focused and small; include migration notes if changing data formats.

## Security & Configuration Tips
- Do not commit secrets. Use `.env.local`; Vite reads `VITE_*` vars (e.g., `VITE_OPENAI_API_KEY`).
- Validate user input; avoid unsanitized HTML; prefer server-side calls in `services/` when integrating external APIs.
