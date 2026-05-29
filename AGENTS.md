# AGENTS.md - Souls App (Codex Instructions)

## 1) Scope and Priority
This document defines mandatory architecture, patterns, and coding rules for Souls App.

- Any AI agent must follow these instructions when reading, modifying, or generating code.
- If a request conflicts with this file, this file has priority.
- Keep this file in plain UTF-8 and in English.

## 2) Current Stack (Do Not Change Without Explicit Approval)
- Next.js 15 (App Router)
- React 19
- TypeScript (strict mode)
- Prisma ORM
- MongoDB
- Auth.js / NextAuth v5
- Zod
- TailwindCSS
- Server Actions as the default backend boundary
- Zustand for shared client state when needed

Existing and relevant libraries in production code:
- React Hook Form (active)
- Formik (legacy still used in some modules)
- TipTap editor
- Swiper
- Vercel Blob + `sharp`

## 3) Architecture Overview
Architectural style:
- Feature-based organization
- Clear separation of concerns
- Lightweight Clean Architecture + DDD principles

High-level layers:
```text
UI (app/pages/components)
-> Application (server actions, selected route handlers)
-> Domain (schemas, interfaces, logic, models)
-> Infrastructure (prisma, auth, mail, blob, external services)
```

Default data flow:
```text
UI -> Server Action -> Domain Logic (optional) -> Prisma/Infra -> Minimal DTO -> UI/Store update
```

Core principle:
- Write operations are trusted, reads are minimized.
- Do not add automatic post-mutation refetches unless explicitly requested.

## 4) Folder Responsibilities

### `/src/actions`
- Server Actions only.
- Must include `"use server"` at file level.
- One primary responsibility per file.
- May access Prisma and Auth.
- No UI rendering logic.

### `/src/app`
- Pages, layouts, route composition, metadata, route groups.
- `page.tsx` files must use default export.
- Data preloading through actions at page level is valid.

### `/src/app/api`
- Allowed for integration endpoints that need HTTP handlers.
- Current valid examples: NextAuth handler and token verification/reset flows.
- Do not build a generic CRUD REST layer when Server Actions can solve the use case.

### `/src/components`
- UI and interaction components.
- No direct Prisma usage.
- No business rules that should live in `logic` or `actions`.
- For new components, use named exports (do not introduce new default exports).

### `/src/store`
- Zustand stores (domain stores and cross-cutting UI stores).
- Orchestrates async calls to actions and local optimistic updates.
- No direct Prisma or infrastructure calls.

### `/src/logic`
- Pure domain logic and calculations.
- Deterministic functions, no side effects.
- No Prisma, no React, no Zustand.

### `/src/schemas`
- Zod validation schemas and contracts.
- Reusable input/output boundaries for actions and forms.

### `/src/interfaces`
- Shared TypeScript interfaces across features.
- No implementation logic.

### `/src/models`
- Domain constants, enums, static mappings, UI-independent model data.

### `/src/lib`
- Infrastructure layer (Prisma client, DB adapters, mail/blob helpers, infra utilities).
- No feature business orchestration.

### `/src/config`
- App-level configuration (for example fonts and shared config constants).

### `/src/hooks`
- Reusable client interaction hooks only when needed.
- Keep hooks small and predictable.
- No Prisma or server-only logic.

### `/src/utils`
- Pure helpers and formatters.
- No infrastructure calls.

### `/src/seed`
- Seed and maintenance scripts for database/content initialization.

### `/types`
- Global and module augmentation typings (including NextAuth session/JWT extensions).

### `/prisma`
- Prisma schema and database mapping definitions.

### Auth and middleware files
- `src/auth.ts`: Auth.js runtime instance (`auth`, `signIn`, `signOut`, `handlers`).
- `src/auth.config.ts`: provider/callback configuration and credential auth rules.
- `src/middleware.ts`: route-level access control and maintenance mode behavior.

## 5) Server Actions Rules (Strict)
- Every action file must start with `"use server"`.
- Validate external/user input with Zod before business logic.
- Keep authorization checks explicit (role/session checks).
- Prefer explicit `select` payloads over raw model returns.
- For write actions, return minimal data needed by caller/store.
- Avoid read-after-write verification queries unless there is a concrete business reason.
- Prefer transactions for multi-step mutations.

Naming:
- For new actions, use `*.action.ts`.
- Legacy filenames may remain unchanged unless explicitly refactored.

Error contract:
- Be consistent inside each file.
- Use one clear strategy per action: either throw controlled errors or return typed result objects.

## 6) Route Handler Policy
- Route handlers are allowed only when HTTP endpoints are required by platform/integration constraints.
- Internal app operations should default to Server Actions.
- Route handlers may use Prisma/Auth when needed.
- If Node runtime is required, set it explicitly.

## 7) Authentication and Authorization
Server-side session access:
```ts
import { auth } from "@/auth";
```

Client-side session access:
- `SessionProvider`, `useSession`, `signIn`, `signOut` from `next-auth/react` are valid in client components.

Authorization rules:
- Role checks must be explicit (`admin`, `store`, `news`, `player`, etc.).
- Redirect or reject unauthorized access early.
- Keep JWT/session custom fields aligned with `types/next-auth.d.ts`.
- Middleware must stay edge-safe (no Prisma calls inside middleware).

## 8) State Management Strategy
Preferred order:
- Server data + props
- URL/search params
- Zustand when state is shared across multiple client areas

Current project reality:
- Domain stores and UI stores both exist and are valid.
- Store can orchestrate actions and optimistic updates.
- Client components may call actions directly in existing modules; for new complex flows, prefer store orchestration for consistency.

## 9) Validation Rules
- Never trust raw input at server boundaries.
- Zod parsing must happen before domain/business operations.
- Reuse shared schemas from `src/schemas` and infer TS types from them.
- For forms, prefer schema-driven validation; maintain legacy Formik flows unless a migration is explicitly requested.

## 10) Prisma Usage Rules
Prisma is allowed only in:
- `/src/actions`
- `/src/lib`
- `/src/auth.config.ts`
- `/src/app/api/**`
- `/src/seed`

Prisma is forbidden in:
- `/src/components`
- `/src/store`
- `/src/hooks`
- `/src/logic`
- `/src/utils`

Additional rules:
- Use selective queries (`select`/`include`) intentionally.
- Avoid exposing internal fields when not required by UI/store contracts.

## 11) Components and Naming
UI component rules:
- New components: named exports only.
- Avoid introducing new default exports in components.
- Prefer one component per file for new code.
- Prefer PascalCase filenames for new components.
- Any modal, drawer, dialog, confirmation flow, or full-screen overlay must lock background page scroll while it is open.
- Prefer `useBodyScrollLock` over ad hoc `document.body.style.overflow` handling, especially when overlays can be nested.
- Actions launched from the shared confirmation modal must show the global loading overlay until the confirmed async work finishes.
- Components that trigger `openAlertConfirmation` should not rely on browser-native confirmations and should avoid duplicating loading logic unless a specific message or staged loading state is needed.

Legacy compatibility:
- Existing legacy names/exports can remain unless the task explicitly includes cleanup.
- Do not perform mass renaming without explicit request.

## 12) Styling Rules
- TailwindCSS is the default styling system.
- Existing stylesheet files are valid and currently part of production code (`globals.scss`, feature CSS files).
- Do not add new CSS files unless Tailwind is not practical for the case.
- Inline styles are allowed only for truly dynamic runtime values (for example computed transform/width).

## 13) Domain Logic Rules
- Complex calculations and ranking/pairing logic belong in `src/logic`.
- Keep logic pure and reusable from actions/stores.
- No side effects and no infrastructure dependencies in domain logic.

## 14) Commenting and Readability
- Prioritize explicit, maintainable code over clever abstractions.
- Add concise Spanish comments when logic is non-obvious.
- Comments must explain intent and tradeoffs, not trivial lines.

## 15) Current Product Context
Active modules include:
- Tournaments (public and admin)
- Decks
- Cards / Boveda
- Products
- News
- Profile / avatars / media
- Stores and geolocation
- Auth and maintenance mode

Routing context:
- Admin modules are under `/admin/**`.
- Tournament admin reference path is `/admin/torneos`.

## 16) Vercel Cost and Performance Rules
Vercel cost and storage awareness is mandatory for all changes that touch routes, layouts, shared UI, middleware, image/media handling, caching, or data loading.

Bundle and imports:
- Prefer direct imports from the concrete component/module path.
- Do not import from the global `@/components` barrel in pages, layouts, shared route components, or other top-level UI.
- Do not import from broad UI barrels such as `@/components/ui` when a direct path is available.
- Do not add heavy modules to barrel files (`src/components/index.ts`, `src/components/ui/index.ts`, or similar) unless explicitly approved.
- Heavy modules include admin screens, editors, markdown tooling, maps, media managers, deck builders, tournament managers, upload tools, and any component that imports large client-only libraries.
- If a barrel import is kept for legacy compatibility, it must not be introduced into new high-traffic or top-level route code.

Build output and JavaScript transfer:
- After touching public routes, layouts, shared components, auth pages, or admin shells, run `npm run build` when feasible.
- Review the Next.js route table and compare `First Load JS` for affected routes.
- Treat unexpected route jumps toward the 600-700 kB range as a blocker unless there is a clear product reason.
- Public content routes should stay as small as practical; investigate any public route that loads unrelated admin/editor/map/deck-builder code.

Middleware:
- Keep `src/middleware.ts` matchers narrow and intentional.
- Do not use broad matchers that run middleware on all public pages unless the feature explicitly requires it and the cost tradeoff is documented.
- Middleware must remain edge-safe and cheap: no Prisma, no heavy imports, no broad data fetching.
- If global maintenance mode requires broad middleware coverage, document the expected Edge Middleware invocation impact and prefer the lightest possible implementation.

Server work, caching, and dynamic rendering:
- Avoid resolving `auth()` or session-dependent data on public pages unless the rendered output truly depends on it.
- For optional personalized data such as likes, ownership, or user-specific flags, prefer opt-in parameters or client-side session resolution after hydration.
- Do not add `force-dynamic` unless required by correctness.
- Prefer explicit `revalidate` or cacheable public reads where data freshness allows it.
- Watch for excessive ISR writes, function invocations, and function duration when changing data loading.

Images, uploads, and Vercel Blob:
- Vercel Blob is valid, but uploads must avoid duplicate/orphaned files where practical.
- Image upload flows should resize/compress intentionally before storage when quality requirements allow it.
- Deleting or replacing user/admin media should clean up unused Blob objects when the ownership model makes that safe.
- Do not assume Blob Storage is the cost problem without checking usage; compare Blob Storage, Blob Transfer, Fast Origin Transfer, Image Optimization/cache, Data Cache, ISR writes, and Function usage.

Reporting:
- If a change may affect Vercel cost, mention the expected impact in the final response.
- If a performance optimization changes behavior, such as global maintenance-mode coverage, call out the tradeoff explicitly.

## 17) Forbidden Patterns
- Prisma usage in client components, stores, hooks, or logic.
- Unvalidated external input at server boundaries.
- Introducing automatic post-mutation refetches without explicit requirement.
- Building a parallel generic REST CRUD layer.
- God files with mixed responsibilities.
- Introducing new default exports for UI components.
- New high-traffic route imports from the global `@/components` barrel.
- Broad middleware matchers without an explicit cost/correctness reason.

## 18) AI Agent Behavior Rules
When generating or modifying code:
- Respect the current architecture and feature boundaries.
- Avoid unrelated refactors.
- Touch only requested/scope-relevant files.
- Use TypeScript.
- Prefer explicit contracts and predictable behavior.
- Ask before making high-impact architectural changes.
- Keep production-level quality and maintainability.

## 19) Delivery Checklist (Before Finishing a Change)
1. Input validation present at server boundary?
2. Auth and role checks explicit where needed?
3. Mutation flow avoids unnecessary read-after-write refetch?
4. Return payload minimal and intentional?
5. No Prisma leakage into forbidden layers?
6. Store/UI updates consistent with optimistic strategy?
7. Non-obvious logic documented with concise Spanish comments?
8. Lint/type checks run when feasible?
9. No new broad `@/components` or `@/components/ui` imports in route-level or shared high-traffic code?
10. Middleware matcher remains narrow and intentional?
11. `npm run build` route sizes reviewed when routes/layouts/shared UI were changed?
12. Public pages avoid unnecessary session/auth work and dynamic rendering?
13. Image/blob changes include cleanup, compression, or storage-impact reasoning where relevant?

Final principle:
- Consistency, scalability, and maintainability are mandatory.
- Prefer long-term clarity over short-term shortcuts.

---

# Project Token Budget Rules

Use the global Codex skills:

- `token-budget` for PDFs, images, Office files, logs, transcripts, and other large files.
- `code-token-budget` for implementation, debugging, review, refactoring, test, and code explanation tasks.

## Coding Defaults

- Search before reading large files.
- Use `rg`/file lists/diffs to locate relevant code first.
- Read only targeted files or line ranges when possible.
- Avoid generated, vendored, build, cache, coverage, and dependency folders unless directly relevant.
- Broaden to repository-wide analysis only when the task requires it, and state why.
- For long tasks, keep a compact `.codex-token-worklog.md` to avoid rereading the same context.

## Large File Defaults

- Do not read a large binary/document directly when a preflight artifact can answer the task.
- Prefer `C:\Users\sebsi\Documents\Codex\token-budget\preflight.ps1` before sending full content to the model.
- Use `summary.md` and `index.md` first; open `content.md`/`content.txt` only for relevant sections.
- Read the original PDF/image/Office file only when reduced artifacts are insufficient.

## Shared Paths

- Inbox: `C:\Users\sebsi\Documents\Codex\file-inbox`
- Cache: `C:\Users\sebsi\Documents\Codex\file-cache`
- Tools: `C:\Users\sebsi\Documents\Codex\token-budget`

## Subagent Policy

- Do not create subagents by default.
- Use direct local inspection first.
- Use subagents when the user explicitly asks for parallel review or when a complex task clearly benefits from independent analysis.
- Prefer subagents for broad audits, security/performance reviews, cross-feature regression searches, Vercel cost investigations, large refactors, or cases where independent findings reduce risk.
- Do not use subagents for small, localized edits where direct inspection is faster and clearer.
- If subagents are needed, state why before creating them and summarize their findings before acting on them.
- The primary agent remains responsible for validating conclusions, applying changes, and running the final checks.

## Current Focus: Vercel Cost Control

- The project is deployed on Vercel and cost/usage must be treated as an architectural constraint.
- Recent investigation showed the main observed driver was `Fast Origin Transfer`, not Blob Storage.
- Blob usage was low at the time of investigation, but Blob upload/cleanup rules still apply.
- Large route bundles caused by broad component barrels can materially increase transfer cost.
- Middleware scope can materially increase Edge Middleware invocations.
- Before assuming the cause of a Vercel bill increase, identify which quota is growing: Fast Origin Transfer, Blob Storage, Blob Transfer, Image Optimization/cache, Data Cache, ISR writes, Function Invocations, Function Duration, Build Cache, or deployment/static asset size.
- Use lightweight searches, build output, Vercel usage data, and metadata first; do not read the whole repo for this audit.

