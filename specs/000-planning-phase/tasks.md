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

## Task Card Template (use for new tasks)
- [ ] T0xx [P?] [USx] Task name
  - Files: `<paths>`
  - UI/theme: Use existing tokens/classes; define loading/empty/error/populated states.
  - Tests: `<test paths>`
  - Acceptance: `<clear, verifiable outcomes>`
  - DoD: Tests pass; `npm run lint`; `npm run format:check`.

## User Story Quality Gate (run before moving to next story)
- [ ] All tasks in the story are marked complete in this file.
- [ ] `npm test` passes (or specified subset if agreed).
- [ ] `npm run test:coverage` passes with ≥80% global.
- [ ] `npm run lint` passes.
- [ ] `npm run format:check` passes.
- [ ] Manual test doc for the story exists and is executed.

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
- [x] T012 [P] Configure Jest + React Testing Library setup (RTL matchers, Amplify/Auth mocks) in `tests/setupTests.js` and register it inside `jest.config.js`
  - Files: `tests/setupTests.js`, `jest.config.js`
  - Notes: Centralize Amplify/Auth mocks here; keep per-test files lean.
  - Tests: N/A (setup only)
  - Acceptance: RTL matchers active; Amplify mocks loaded; Jest uses setup file.
- [x] T012A [P] Fix router + act warnings in `tests/app.test.jsx` by using MemoryRouter and stable session mocks
  - Files: `tests/app.test.jsx`, `tests/setupTests.js`
  - Notes: Enable React Router future flags to silence warnings; keep session state deterministic.
  - Tests: `npm test -- tests/app.test.jsx`
  - Acceptance: No router or act warnings in app test run.

**Checkpoint**: Foundation ready – user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authentication & Session Shell (Priority: P1) 🎯 MVP

**Goal**: Users can register, confirm, log in, and remain within an authenticated React shell backed by Amplify Auth

**Independent Test**: With Cognito mock, create an email/password account, confirm code, sign in, and observe that protected routes redirect unauthenticated visitors to `/login`

### Tests for User Story 1 ⚠️

- [x] T013 [P] [US1] Cover session context state transitions and Hub events in `tests/components/auth/SessionContext.test.jsx`
- [x] T014 [P] [US1] Validate login + registration form flows (client-side validation, error banners) in `tests/components/auth/LoginForm.test.jsx`
- [x] T014A [P] [US1] Add RegisterForm tests to restore coverage after US1 implementation (added post-review)
  - Files: `tests/components/auth/RegisterForm.test.jsx`
  - Notes: Added after coverage run revealed gaps; cover validation, confirmation, and error banners.
  - Tests: `tests/components/auth/RegisterForm.test.jsx`
  - Acceptance: Happy path + error paths for signUp/confirmSignUp; validation messages match spec.
- [x] T017A [P] [US1] Add AuthGate tests to cover auth guard behavior (added post-review)
  - Files: `tests/components/auth/AuthGate.test.jsx`
  - Notes: Added after coverage run revealed gaps; cover loading, redirect, and signOut.
  - Tests: `tests/components/auth/AuthGate.test.jsx`
  - Acceptance: Loading state, unauthenticated redirect, authenticated render, signOut call.
- [x] T018A [P] [US1] Expand App routing tests for protected and auth routes (added post-review)
  - Files: `tests/app.test.jsx`
  - Notes: Added after coverage run revealed gaps; cover /login, /signup, /dashboard redirects.
  - Tests: `tests/app.test.jsx`
  - Acceptance: Auth routes render forms, protected routes redirect unauthenticated users.

### Implementation for User Story 1

- [x] T015 [US1] Implement Amplify-driven login form with email/password validation and error messaging in `src/components/auth/LoginForm.jsx`
- [x] T016 [P] [US1] Implement registration + confirmation flow with password policy checks in `src/components/auth/RegisterForm.jsx`
- [x] T017 [US1] Implement `AuthGate` component to guard children, handle loading states, and expose `signOut` in `src/components/auth/AuthGate.jsx`
- [x] T018 [US1] Wire `/login` + `/signup` routes, mount `AuthGate` around app routes, and redirect post-auth in `src/components/App.jsx`

**Checkpoint**: Authentication shell protects all private routes and supports sign-out

---

## Phase 4: User Story 2 - Profile Onboarding & Targets (Priority: P2)

**Goal**: Authenticated users can submit body metrics, trigger macro calculations, and persist profile/targets data per data-model.md

**Independent Test**: Sign in, fill onboarding form, verify DynamoDB receives PROFILE + TARGETS items, reload page, and see form repopulated with calculated macros

### Tests for User Story 2 ⚠️

- [x] T019 [P] [US2] Add API wrapper tests covering `API.get('profile')` + `API.post('profile')` success/error branches in `tests/api/profile.test.js`
- [x] T021A [P] [US2] Add profile API helper tests to cover fetch/save success + error normalization (added post-review)
  - Files: `tests/api/profile.test.js`
  - Notes: Added to close coverage gap; ensure error wrapping paths are exercised.
  - Tests: `tests/api/profile.test.js`
  - Acceptance: Covers fetchProfile + saveProfile success, ApiClientError passthrough, and fallback error.
- [x] T020 [P] [US2] Add onboarding form tests for field validation, calculation triggers, and save success banners in `tests/components/profile/ProfileForm.test.jsx`

### Implementation for User Story 2

- [x] T021 [US2] Implement profile API helper exposing `fetchProfile` + `saveProfile` using the shared client in `src/api/profile.js`
- [x] T022 [P] [US2] Implement macro calculation + validation helper per constitution formulas in `src/utils/calculateMacros.js`
  - Files: `src/utils/calculateMacros.js`
  - Notes: Use constitution formulas + validation ranges; export pure functions only.
  - Tests: `tests/utils/calculateMacros.test.js`
  - Acceptance: Deterministic outputs; throws on invalid inputs; no side effects.
- [x] T023 [US2] Implement `getProfile` Lambda (Auth check, Dynamo query, DTO) in `amplify/backend/function/getProfile/src/index.js`
- [x] T023A [P] [US2] Add getProfile Lambda unit tests (added post-review)
  - Files: `tests/lambdas/getProfile.test.js`
  - Notes: Added for backend confidence; mock DynamoDB and verify DTO + auth errors.
  - Tests: `tests/lambdas/getProfile.test.js`
  - Acceptance: 401 on missing auth, returns profile + targets on success, handles empty result.
- [x] T024 [US2] Implement `updateProfile` Lambda (schema validation, macro recalculation, Dynamo writes) in `amplify/backend/function/updateProfile/src/index.js`
- [x] T024A [P] [US2] Add updateProfile Lambda unit tests (added post-review)
  - Files: `tests/lambdas/updateProfile.test.js`
  - Notes: Added for backend confidence; mock DynamoDB + calculateMacros paths.
  - Tests: `tests/lambdas/updateProfile.test.js`
  - Acceptance: 400 on invalid input, writes PROFILE + TARGETS on success, returns DTO.
- [x] T025 [US2] Build reusable `ProfileForm` component for onboarding/settings with Tailwind layout in `src/components/profile/ProfileForm.jsx`
- [x] T026 [US2] Create `useProfile` hook/context to hydrate onboarding + settings screens and expose refetch in `src/hooks/useProfile.js`
- [x] T026A [P] [US2] Add `useProfile` hook unit tests (added post-review)
  - Files: `tests/hooks/useProfile.test.js`
  - Notes: Added to lock in loading, error, and refetch behavior.
  - Tests: `tests/hooks/useProfile.test.js`
  - Acceptance: Verifies initial loading state, success hydration, error handling, and refetch trigger.

- [ ] T046 [US2] Register profile Lambdas + API Gateway routes and deploy
  - Files: `amplify/backend/backend-config.json`, `amplify/backend/api/nutripilotapi/cli-inputs.json`,
    `amplify/backend/function/getProfile/*`, `amplify/backend/function/updateProfile/*`
  - Notes: Register getProfile/updateProfile with Amplify; add GET/POST /profile with Cognito
    authorizer; decide nutripilotFunction's fate (implement as router or remove); amplify push.
  - Tests: existing `tests/lambdas/*.test.js` still pass; manual smoke per docs/manual_testing/profile-onboarding.md
  - Acceptance: GET and POST /profile return live 200s with the DTO shape from a signed-in session;
    settings screen round-trips against real AWS; US2 Independent Test executed and passing.
  - DoD: `npm run verify`; smoke test evidence noted in the manual test doc.

**Checkpoint**: Users persist accurate macro targets and can revisit/edit details

---

## Phase 5: User Story 3 - Dashboard Insights (Priority: P3)

**Goal**: Users view daily goals, progress, meals, and AI guidance in a responsive dashboard

**Independent Test**: After seeding meals, load `/dashboard`, verify skeleton -> populated state, progress bars reflect Dynamo totals, and errors show retry CTA

### Execution Plan for User Story 3 (Self-Contained Tasks)

- [ ] T027 [P] [US3] Implement `getDashboard` Lambda + unit tests
  - Files: `amplify/backend/function/getDashboard/src/index.js`
  - Notes: Query Dynamo entities and compute summaries per spec.
  - Tests: `tests/lambdas/getDashboard.test.js`
  - Acceptance: Aggregates profile/targets/meals correctly; handles empty sets; returns dashboard DTO.
  - DoD: Tests pass; `npm run lint`; `npm run format:check`.
- [ ] T028 [P] [US3] Implement dashboard API helper + tests
  - Files: `src/api/dashboard.js`
  - Notes: Fetch `/api/dashboard`, normalize progress percentages, reuse shared client.
  - Tests: `tests/api/dashboard.test.js`
  - Acceptance: Success normalization, ApiClientError passthrough, fallback error message.
  - DoD: Tests pass; `npm run lint`; `npm run format:check`.
- [ ] T029 [P] [US3] Implement `useDashboard` hook + tests
  - Files: `src/hooks/useDashboard.js`
  - Notes: Fetch dashboard data, expose loading/error/data, refetch; auto-refresh after mutations.
  - Tests: `tests/hooks/useDashboard.test.js`
  - Acceptance: Loading, success, error, and refetch paths covered.
  - DoD: Tests pass; `npm run lint`; `npm run format:check`.
- [ ] T030 [P] [US3] Build `DashboardSkeleton` + retry banner components + tests
  - Files: `src/components/dashboard/DashboardSkeleton.jsx`
  - Notes: Provide loading/empty/error UI states per spec; match theme.
  - Tests: `tests/components/dashboard/DashboardSkeleton.test.jsx`
  - Acceptance: Skeleton, empty, and error retry states render accessibly.
  - DoD: Tests pass; `npm run lint`; `npm run format:check`.
- [ ] T031 [P] [US3] Build `Dashboard` component + tests
  - Files: `src/components/dashboard/Dashboard.jsx`
  - Notes: Summary cards, progress bars, meal list headers, settings CTA; uses `useDashboard`.
  - Tests: `tests/components/dashboard/Dashboard.test.jsx`
  - Acceptance: Loading/empty/error/data states; progress values match payload; CTA present.
  - DoD: Tests pass; `npm run lint`; `npm run format:check`.

**Note**: US3 tasks are now self-contained. Prior test-only items (T027/T028) and split items (T032/T033) are folded into the tasks above to avoid follow-up test-only prompts.

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
- [x] T044 Add `verify` npm script chaining `lint`, `test`, and `format:check` plus document it in `package.json`
- [ ] T045 Update `README.md` quickstart + deployment sections to mirror `specs/000-planning-phase/quickstart.md`

- [ ] T047 Fix user-facing error messages in auth + profile forms
  - Files: `src/components/auth/LoginForm.jsx`, `src/components/auth/RegisterForm.jsx`,
    `src/components/profile/ProfileForm.jsx`
  - Notes: Map known Cognito error codes (UserNotConfirmedException, UsernameExistsException,
    NotAuthorizedException) to specific friendly messages; generic fallback otherwise; never render
    raw error.message (constitution "Error Messages").
  - Tests: extend LoginForm/RegisterForm/ProfileForm tests with one case per mapped code + fallback
  - Acceptance: network failure no longer shows "Email already registered"; unconfirmed user is told
    to confirm; no raw Amplify/backend message reaches the UI.
  - DoD: `npm run verify`.

- [ ] T048 [P] Enforcement gaps: lint rules + CI
  - Files: `eslint.config.js`, `.eslintrc.js` (delete), `.github/workflows/ci.yml` (new)
  - Notes: add max-lines-per-function:50 and max-depth:3 per constitution; CI runs
    `npm run verify && npm run build` on push/PR.
  - Tests: N/A (config)
  - Acceptance: lint fails on a 51-line function; CI visible and green on the PR.
  - DoD: `npm run verify`.

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
