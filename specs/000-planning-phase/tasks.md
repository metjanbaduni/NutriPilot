---

description: "Task list for NutriPilot MVP Foundation"
---

# Tasks: NutriPilot MVP Foundation

**Input**: Design documents from `/specs/000-planning-phase/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

Tests are required to maintain ≥80% coverage per spec.md and plan.md.

## Execution Defaults (applies to all tasks unless overridden)
- Scope: Modify only files listed in the task.
- Standards: Follow spec.md, plan.md, and .specify/memory/constitution.md.
- Testing: Run tests listed on the task; run full suite only at phase checkpoints.
- Completion: Mark the task [x] in this file when done.
- Decisions: If a required decision is not specified, stop and ask.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, ...); omit for setup/foundational/polish tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish React 18 + Vite toolchain with Tailwind per implementation plan

- [x] T001 Update React 18, Vite, Tailwind, Amplify, AWS SDK, and OpenAI dependencies plus dev scripts in `package.json`
- [x] T002 Create Vite build configuration with React plugin and `@` alias in `vite.config.js`
- [x] T003 [P] Define Tailwind theme tokens and content globs aligned with dashboard mocks in `tailwind.config.cjs`
- [x] T004 [P] Configure PostCSS pipeline (tailwindcss, autoprefixer) in `postcss.config.js`
- [x] T005 [P] Add Tailwind base directives and macro color variables in `src/index.css`
- [x] T006 Replace static shell with Vite root markup referencing `/src/index.js` in `public/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: App shell, shared context, data-layer helpers, and test harness that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Initialize AWS Amplify and render `<App />` via `createRoot` + `BrowserRouter` in `src/index.js`
- [x] T008 Build the high-level route skeleton with placeholders for `/login`, `/signup`, `/dashboard`, `/settings`, and modal host in `src/components/App.jsx`
- [X] T009 Implement `SessionContext` with Amplify `Hub` listeners, Auth token refresh, and `useSession` hook in `src/context/SessionContext.jsx`
- [x] T010 [P] Add centralized Amplify API client with signed REST helpers and error normalization in `src/api/client.js`
  - Files: `src/api/client.js`
  - Notes: Use Amplify `API` + `Auth` for signed requests; no direct `fetch`.
  - Tests: `tests/api/client.test.js`
  - Acceptance: Exposes typed `get`/`post` helpers; normalizes errors; injects auth headers.
- [x] T011 [P] Create reusable DynamoDB DocumentClient factory + env helpers referenced by all Lambdas in `amplify/backend/function/lib/dynamoClient.js`
  - Files: `amplify/backend/function/lib/dynamoClient.js`
  - Notes: Use AWS SDK v3 `DynamoDBClient` + `DynamoDBDocumentClient`; read table name from env.
  - Tests: `tests/lambdas/dynamoClient.test.js`
  - Acceptance: Single factory function; predictable config; safe defaults; no network calls in tests.
- [ ] T012 [P] Configure Jest + React Testing Library setup (RTL matchers, Amplify/Auth mocks) in `tests/setupTests.js` and register it inside `jest.config.js`
  - Files: `tests/setupTests.js`, `jest.config.js`
  - Notes: Centralize Amplify/Auth mocks here; keep per-test files lean.
  - Tests: N/A (setup only)
  - Acceptance: RTL matchers active; Amplify mocks loaded; Jest uses setup file.

**Checkpoint**: Foundation ready – user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authentication & Session Shell (Priority: P1) 🎯 MVP

**Goal**: Users can register, confirm, log in, and remain within an authenticated React shell backed by Amplify Auth

**Independent Test**: With Cognito mock, create an email/password account, confirm code, sign in, and observe that protected routes redirect unauthenticated visitors to `/login`

### Tests for User Story 1 ⚠️

- [ ] T013 [P] [US1] Cover session context state transitions and Hub events in `tests/components/auth/SessionContext.test.jsx`
- [ ] T014 [P] [US1] Validate login + registration form flows (client-side validation, error banners) in `tests/components/auth/LoginForm.test.jsx`

### Implementation for User Story 1

- [ ] T015 [US1] Implement Amplify-driven login form with email/password validation and error messaging in `src/components/auth/LoginForm.jsx`
- [ ] T016 [P] [US1] Implement registration + confirmation flow with password policy checks in `src/components/auth/RegisterForm.jsx`
- [ ] T017 [US1] Implement `AuthGate` component to guard children, handle loading states, and expose `signOut` in `src/components/auth/AuthGate.jsx`
- [ ] T018 [US1] Wire `/login` + `/signup` routes, mount `AuthGate` around app routes, and redirect post-auth in `src/components/App.jsx`

**Checkpoint**: Authentication shell protects all private routes and supports sign-out

---

## Phase 4: User Story 2 - Profile Onboarding & Targets (Priority: P2)

**Goal**: Authenticated users can submit body metrics, trigger macro calculations, and persist profile/targets data per data-model.md

**Independent Test**: Sign in, fill onboarding form, verify DynamoDB receives PROFILE + TARGETS items, reload page, and see form repopulated with calculated macros

### Tests for User Story 2 ⚠️

- [ ] T019 [P] [US2] Add API wrapper tests covering `API.get('profile')` + `API.post('profile')` success/error branches in `tests/api/profile.test.js`
- [ ] T020 [P] [US2] Add onboarding form tests for field validation, calculation triggers, and save success banners in `tests/components/profile/ProfileForm.test.jsx`

### Implementation for User Story 2

- [ ] T021 [US2] Implement profile API helper exposing `fetchProfile` + `saveProfile` using the shared client in `src/api/profile.js`
- [ ] T022 [P] [US2] Implement macro calculation + validation helper per constitution formulas in `src/utils/calculateMacros.js`
  - Files: `src/utils/calculateMacros.js`
  - Notes: Use constitution formulas + validation ranges; export pure functions only.
  - Tests: `tests/utils/calculateMacros.test.js`
  - Acceptance: Deterministic outputs; throws on invalid inputs; no side effects.
- [ ] T023 [US2] Implement `getProfile` Lambda (Auth check, Dynamo query, DTO) in `amplify/backend/function/getProfile/src/index.js`
- [ ] T024 [US2] Implement `updateProfile` Lambda (schema validation, macro recalculation, Dynamo writes) in `amplify/backend/function/updateProfile/src/index.js`
- [ ] T025 [US2] Build reusable `ProfileForm` component for onboarding/settings with Tailwind layout in `src/components/profile/ProfileForm.jsx`
- [ ] T026 [US2] Create `useProfile` hook/context to hydrate onboarding + settings screens and expose refetch in `src/hooks/useProfile.js`

**Checkpoint**: Users persist accurate macro targets and can revisit/edit details

---

## Phase 5: User Story 3 - Dashboard Insights (Priority: P3)

**Goal**: Users view daily goals, progress, meals, and AI guidance in a responsive dashboard

**Independent Test**: After seeding meals, load `/dashboard`, verify skeleton -> populated state, progress bars reflect Dynamo totals, and errors show retry CTA

### Tests for User Story 3 ⚠️

- [ ] T027 [P] [US3] Add Lambda unit test asserting `getDashboard` aggregates profile/targets/meals correctly in `tests/lambdas/getDashboard.test.js`
- [ ] T028 [P] [US3] Add dashboard component test covering empty, loading, data, and error banners in `tests/components/dashboard/Dashboard.test.jsx`

### Implementation for User Story 3

- [ ] T029 [US3] Implement dashboard API helper to fetch `/api/dashboard` and normalize progress percentages in `src/api/dashboard.js`
- [ ] T030 [US3] Implement `getDashboard` Lambda to query Dynamo entities and compute summaries per spec in `amplify/backend/function/getDashboard/src/index.js`
- [ ] T031 [US3] Build `Dashboard` component with summary cards, progress bars, meal list headers, and settings CTA in `src/components/dashboard/Dashboard.jsx`
- [ ] T032 [P] [US3] Add `DashboardSkeleton` + retry banner components for loading/error states in `src/components/dashboard/DashboardSkeleton.jsx`
- [ ] T033 [US3] Implement `useDashboard` hook to fetch dashboard data, auto-refresh after mutations, and expose delete callbacks in `src/hooks/useDashboard.js`

**Checkpoint**: Dashboard renders accurate real-time macro progress with resilient UX states

---

## Phase 6: User Story 4 - Meal Logging & AI Analysis (Priority: P4)

**Goal**: Users can log meals with optional AI macro analysis, view history, and delete entries with summaries updating instantly

**Independent Test**: From dashboard, open meal modal, analyze via AI, save meal, observe totals update, delete meal, and confirm summary recalculates

### Tests for User Story 4 ⚠️

- [ ] T034 [P] [US4] Add Lambda tests for `analyzeMeal` covering OpenAI success, timeout fallback, and cache hits in `tests/lambdas/analyzeMeal.test.js`
- [ ] T035 [P] [US4] Add MealModal interaction test for AI success/error + manual macros in `tests/components/meals/MealModal.test.jsx`

### Implementation for User Story 4

- [ ] T036 [US4] Implement meals API helper (`listMeals`, `createMeal`, `analyzeMeal`, `deleteMeal`) with optimistic cache updates in `src/api/meals.js`
- [ ] T037 [US4] Implement `analyzeMeal` Lambda calling OpenAI GPT-4o-mini, caching by description hash, with Secrets Manager lookup in `amplify/backend/function/analyzeMeal/src/index.js`
  - Files: `amplify/backend/function/analyzeMeal/src/index.js`
  - Notes: Secrets Manager lookup for OpenAI key; cache by sha256(description); 10s timeout; retry once on invalid JSON.
  - Tests: `tests/lambdas/analyzeMeal.test.js`
  - Acceptance: Returns macros + ingredients; uses cache on hit; normalizes OpenAI errors.
- [ ] T038 [US4] Implement `saveMeal` Lambda persisting meal, updating summary, and computing calories in `amplify/backend/function/saveMeal/src/index.js`
  - Files: `amplify/backend/function/saveMeal/src/index.js`
  - Notes: Validate input; compute calories server-side; update DailySummary atomically if possible.
  - Tests: `tests/lambdas/saveMeal.test.js`
  - Acceptance: Writes MEAL + SUMMARY; returns updated totals; rejects invalid inputs.
- [ ] T039 [US4] Implement `getMeals` Lambda with date-range + limit filters returning ordered meals in `amplify/backend/function/getMeals/src/index.js`
  - Files: `amplify/backend/function/getMeals/src/index.js`
  - Notes: Query by PK + SK range; enforce limit max 100; sort by timestamp desc.
  - Tests: `tests/lambdas/getMeals.test.js`
  - Acceptance: Returns ordered meals; respects date range and limit; handles empty set.
- [ ] T040 [US4] Implement `deleteMeal` Lambda that removes meal, recomputes summary, and returns updated totals in `amplify/backend/function/deleteMeal/src/index.js`
  - Files: `amplify/backend/function/deleteMeal/src/index.js`
  - Notes: Verify ownership; delete meal; recompute summary from remaining meals.
  - Tests: `tests/lambdas/deleteMeal.test.js`
  - Acceptance: Deletes meal; updates summary; idempotent error on missing meal.
- [ ] T041 [US4] Build `MealModal` component with AI analyze button, manual macro inputs, and validation in `src/components/meals/MealModal.jsx`
- [ ] T042 [US4] Integrate meal modal triggers, reload hooks, and delete confirmations into dashboard list in `src/components/dashboard/Dashboard.jsx`

**Checkpoint**: Meal lifecycle fully functional with AI assist and accurate summaries

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, automation, and hardening tasks that span all stories

- [ ] T043 [P] Capture new backend, AI, and caching decisions in `docs/decisions/000-planning-phase.md`
- [ ] T044 Add `verify` npm script chaining `lint`, `test`, and `format:check` plus document it in `package.json`
- [ ] T045 Update `README.md` quickstart + deployment sections to mirror `specs/000-planning-phase/quickstart.md`

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **User Stories (Phases 3–6)** → **Polish**
- User Story dependencies: US1 (Auth) enables US2 (Profile), US2 enables US3 (Dashboard) and US4 (Meal logging). US3 + US4 share API hooks but remain independently testable once US2 data exists.
- Backend Lambdas depend on the shared Dynamo client (T011) and macro helper (T022).
- React hooks/components consume contexts created in T009 + T026 + T033.

## Parallel Execution Opportunities

- Setup configs (T003–T005) can proceed in parallel once dependencies are installed.
- Foundational helpers (T010–T012) are independent of each other.
- Within US1, LoginForm (T015) and RegisterForm (T016) can be built simultaneously after tests.
- US2 Lambdas (T023, T024) can run in parallel after macro helper (T022).
- US3 UI (T031, T032) and hook (T033) can be done concurrently after API wrapper (T029).
- US4 Lambdas (T037–T040) can be staffed in parallel because they touch different handlers/files.

## Parallel Example: User Story 4

```bash
# Lambda engineers in parallel
T037 -> amplify/backend/function/analyzeMeal/src/index.js
T038 -> amplify/backend/function/saveMeal/src/index.js
T039 -> amplify/backend/function/getMeals/src/index.js
T040 -> amplify/backend/function/deleteMeal/src/index.js

# Frontend engineer
T035 tests + T041 MealModal.jsx + T042 dashboard wiring
```

## Implementation Strategy

### MVP First (User Story 1)
1. Complete Setup + Foundational (Phases 1–2)
2. Deliver US1 authentication shell and verify sign-in/out locally
3. Demo authentication-only build before layering data features

### Incremental Delivery
1. After US1, ship US2 onboarding/targets to enable meaningful data
2. Layer US3 dashboard for read-only visibility
3. Add US4 meal logging + AI for full workflow
4. Finish with polish tasks (docs, scripts) before release

### Deployment Notes
- After each backend change, run `amplify push` (or targeted function pushes) per quickstart
- Use `npm run verify` (T044) before committing or deploying
- Update `docs/decisions` whenever architecture choices deviate from plan
