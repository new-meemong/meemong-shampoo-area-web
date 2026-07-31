# AGENTS.md

<!-- meemong-common v1 start -->
## Meemong shared working agreements

- Keep changes scoped to the requested problem and preserve unrelated user-authored work.
- Apply technically valid, low-risk review feedback in the current change when it improves the touched area.
- After refactoring, verify that names still match the domain intent and actual reuse scope.
- Follow the repository's existing architecture and reuse established shared building blocks and utilities before adding new abstractions.
- Never commit credentials, tokens, production data, or user personal information.
- Run the relevant checks for the changed area and report any check that could not be run.
<!-- meemong-common v1 end -->

## Project overview

This is the Meemong shampoo-area community webview built with Next.js 15, React 19, TypeScript, TanStack Query, Zustand, and Firebase.

## Package manager and commands

Use npm and keep `package-lock.json` authoritative.

```bash
npm ci
npm run dev
npm run build
npm run lint
npm run format
npm run test -- --run
npm run test:coverage
```

Run focused tests with `npx vitest run <test-file>`.

## Architecture

The project follows Feature-Sliced Design:

```text
app > widgets > features > entities > shared
```

- A layer may import only from layers below it.
- Do not directly couple slices in the same layer.
- Use each slice's `index.ts` public API when present and use the `@/` alias for source imports.
- Keep routing in `src/app/`, composed screens in `src/widgets/`, interactions in `src/features/`, shampoo-room domain code in `src/entities/`, and domain-independent code in `src/shared/`.

## API and webview integration

- Use the shared API clients in `src/shared/api/client.ts`; use the unauthenticated client only for endpoints that do not require auth.
- Preserve the `SHAMPOO_ROOM_WEB` platform contract and shared response/pagination types.
- Keep native navigation behind `src/shared/lib/app-bridge.ts` and preserve Android and iOS bridge behavior.
- Test browser fallback behavior when changing native bridge code.

## UI and data

- Reuse shared shadcn-based primitives from `src/shared/ui` before adding domain-specific variants.
- Place shampoo-room-specific UI and behavior in its entity, feature, or widget slice rather than in shared.
- Use TanStack Query for server state and Zustand for client/UI state.
- Keep analytics event names and properties centralized under `src/shared/lib/analytics`.

## Verification

- Add or update tests for changed domain logic, analytics helpers, API behavior, and shared utilities.
- Run focused Vitest tests while iterating, then `npm run test -- --run`.
- Run `npm run lint`; also run `npm run build` for routing, configuration, bridge, or production-facing changes.
