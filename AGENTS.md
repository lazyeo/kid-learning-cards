# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript source.
  - `components/`, `pages/`, `hooks/`, `services/`, `types/`, `utils/`, `assets/`.
- `public/`: Static files served as-is.
- Entrypoints: `index.html`, `src/main.tsx`, `src/App.tsx`.
- `tests/`: Unit/integration tests.
- `docs/`: Additional documentation.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server with HMR.
- `npm run build`: Type-check (`tsc -b`) and create production bundle via Vite.
- `npm run preview`: Serve the production build locally.
- `npm run lint`: Lint with ESLint. Auto-fix: `npm run lint -- --fix`.
- Testing (Vitest, planned):
  - Run all tests: `npx vitest` or `npx vitest run`.
  - Coverage example: `npx vitest run --coverage`.

## Coding Style & Naming Conventions
- Language: TypeScript, 2-space indent. Prefer named exports; avoid default exports.
- React: Function components; props typed via interfaces.
- Naming: Components `PascalCase` (e.g., `src/components/MyWidget.tsx`),
  hooks `useCamelCase` (e.g., `src/hooks/useFeature.ts`),
  utils `camelCase.ts` (e.g., `src/utils/formatDate.ts`),
  types in `src/types` (e.g., `card.ts`).
- Styling: Tailwind CSS; prefer utility classes. Global styles in `src/index.css`.
- Linting: ESLint (`typescript-eslint`, React Hooks). Code must pass `npm run lint`.

## Testing Guidelines
- Framework: Vitest + Testing Library (planned).
- Location: `tests/**/*.test.ts[x]` or colocated `*.test.tsx` near the component.
- Behavior-first: Test user-visible behavior; mock network calls in `services/` (e.g., via MSW).
- Coverage: Target ≥80% lines on new/changed code. Example: `npx vitest run --coverage`.

## Commit & Pull Request Guidelines
- Commits: Imperative mood, concise; optional scope tags like `[ui]`, `[build]`, `[docs]`.
  - Example: `feat(ui): add printable coloring card preview`.
- PRs: Provide description, link issues (e.g., `#123`), screenshots for UI changes,
  test plan (commands/steps), and checklist of affected areas. Keep PRs focused and small.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local`; Vite reads `VITE_*` vars (e.g., `VITE_OPENAI_API_KEY`).
- Validate user input; avoid unsanitized HTML. Prefer server-side calls in `services/` when integrating external APIs.

## Design Context

### Users
The primary users are young children creating printable learning materials, often with a parent nearby. Some children cannot type or read yet, so core flows must be completable through large visual controls, speech, and immediate feedback rather than written instructions. Parents still need compact text labels and familiar manual controls.

### Brand Personality
Playful, encouraging, and approachable. The product should feel like a friendly toy companion that helps a child make something, while remaining calm enough for focused learning and comfortable parent supervision.

### Aesthetic Direction
Use the existing light, soft, toy-like visual language: warm colors, friendly rounded forms, simple recognizable icons, and generous touch targets. Favor clear state changes over decorative motion. Avoid dense text, overstimulation, dark technical styling, generic AI gradients, and interfaces that require literacy to proceed.

### Design Principles
1. Make the child path readable through shape, color, sound, and sequence—not text alone.
2. Keep one obvious primary action per state, with touch targets of at least 44×44px.
3. Confirm costly or irreversible actions through a simple visual and spoken choice.
4. Preserve manual text controls for parents without letting them dominate the child-first flow.
5. Use encouraging feedback and purposeful motion, while respecting reduced-motion preferences and avoiding sensory overload.
