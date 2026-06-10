# Repository Guidelines

## Project Structure & Module Organization

This repository is a pnpm workspace containing two applications:

- `apps/backend/`: Express API written in TypeScript. The current entry point is `src/index.ts`.
- `apps/frontend/`: Vue 3 and Vite client. Application code lives in `src/`, reusable components in `src/components/`, static imports in `src/assets/`, and directly served files in `public/`.

Keep application-specific dependencies and scripts in each app's `package.json`. Add shared packages under a new workspace directory only when code is genuinely used by both apps.

## Build, Test, and Development Commands

Run commands from the repository root:

- `pnpm install`: install all workspace dependencies.
- `pnpm --filter @url-shortener/backend dev`: run the API with file watching on port `3000` by default. Override with `PORT=4000`.
- `pnpm --filter @url-shortener/frontend dev`: start the Vite development server.
- `pnpm --filter @url-shortener/frontend build`: type-check and create the production frontend bundle.
- `pnpm --filter @url-shortener/frontend preview`: serve the built frontend locally.
- `pnpm typecheck`: run TypeScript checks in both applications.
- `pnpm lint`: check TypeScript and Vue files with ESLint.
- `pnpm lint:fix`: automatically fix supported ESLint issues.
- `pnpm format:check`: check formatting without changing files.
- `pnpm format`: format the entire workspace with Prettier.

No test command is configured yet. The backend build emits JavaScript to `apps/backend/dist/`; run it with `pnpm --filter @url-shortener/backend start`.

## Coding Style & Naming Conventions

Use TypeScript throughout and keep compiler checks passing. Prettier enforces two-space indentation, single quotes, trailing commas, and no semicolons. ESLint checks TypeScript and Vue code; run `pnpm lint` before submitting changes. Use `PascalCase.vue` for Vue components, `camelCase` for variables and functions, and descriptive route or module names. Prefer Vue `<script setup lang="ts">` components and small, focused Express handlers.

## Testing Guidelines

No test framework or coverage threshold is configured yet. When adding tests, place them near the code as `*.spec.ts` or in an app-level `tests/` directory, and add a runnable `test` script to that app. At minimum, verify frontend changes with the frontend build and exercise changed API endpoints locally.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects, optionally scoped with Conventional Commit syntax, for example `feat(frontend): add short URL form`. Keep commits focused.

Pull requests should explain the behavior change, list verification commands, and link relevant issues. Include screenshots for visible frontend changes and document new environment variables or API contract changes.
