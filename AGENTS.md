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

## 16) Forbidden Patterns
- Prisma usage in client components, stores, hooks, or logic.
- Unvalidated external input at server boundaries.
- Introducing automatic post-mutation refetches without explicit requirement.
- Building a parallel generic REST CRUD layer.
- God files with mixed responsibilities.
- Introducing new default exports for UI components.

## 17) AI Agent Behavior Rules
When generating or modifying code:
- Respect the current architecture and feature boundaries.
- Avoid unrelated refactors.
- Touch only requested/scope-relevant files.
- Use TypeScript.
- Prefer explicit contracts and predictable behavior.
- Ask before making high-impact architectural changes.
- Keep production-level quality and maintainability.

## 18) Delivery Checklist (Before Finishing a Change)
1. Input validation present at server boundary?
2. Auth and role checks explicit where needed?
3. Mutation flow avoids unnecessary read-after-write refetch?
4. Return payload minimal and intentional?
5. No Prisma leakage into forbidden layers?
6. Store/UI updates consistent with optimistic strategy?
7. Non-obvious logic documented with concise Spanish comments?
8. Lint/type checks run when feasible?

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
- Only use subagents when the user explicitly asks for parallel review or when a complex task clearly benefits from independent analysis.
- If subagents are needed, state why before creating them.

## Current Focus: Vercel Storage

- The project is deployed on Vercel and storage/cost usage is growing quickly.
- Before changing code, identify which Vercel quota is growing: Blob Storage, Blob Transfer, Image Optimization/cache, Data Cache, Build Cache, or deployment/static asset size.
- Initial local signal: `public/cards` is about 42 MB with hundreds of card images; dynamic uploads use Vercel Blob through `src/lib/blob.ts` and image upload actions.
- Likely investigation areas: orphaned blobs, oversized dynamic images, repeated uploads, missing cleanup, high WebP quality, generated image variants, and whether some assets should move to cheaper external object storage/CDN.
- Use lightweight searches and metadata first; do not read the whole repo for this audit.

