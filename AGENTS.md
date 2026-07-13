# NutriPilot

Nutrition tracking app: macro tracking (protein/carbs/fats/calories) for muscle building.
Stack: React 18 + Vite + Tailwind, AWS Amplify (Cognito, API Gateway, Lambda Node 18, DynamoDB single-table).

## Commands
- Dev server: `npm run dev` (Vite, http://localhost:5173, auto-opens a browser tab)
- Full quality gate: `npm run verify` (lint + prettier check + tests with coverage) — use this, not the pieces
- Individual: `npm run lint` / `npm run test:coverage` / `npm run build`
- Plain `npm test` does NOT check coverage — never use it to claim the coverage gate passed

## Key paths
- Screens: `src/components/auth/` (login/register), `src/components/profile/ProfileForm.jsx` (settings)
- Routing/shell: `src/components/App.jsx`; session: `src/context/SessionContext.jsx`
- API client: `src/api/client.js` (signed Amplify requests); wrappers in `src/api/*.js`
- Lambdas: `amplify/backend/function/` (shared code in `function/lib/`)
- Tests mirror src under `tests/`; fixtures in `tests/fixtures/` (dashboard + meals mocks already exist)
- Spec: `spec.md` (root). Quality rules: `.specify/memory/constitution.md`. Plan: `specs/000-planning-phase/plan.md`
- Backlog SOURCE OF TRUTH: `specs/000-planning-phase/tasks.md` — work only on assigned tasks;
  unchecked tasks are not implemented yet; mark `[x]` (and only then) when a task's DoD is met

## Design system — SOURCE OF TRUTH
- Tokens + component contracts: `docs/design/DESIGN.md` and `docs/design/tokens/*.css`
  (reference docs — the shipped styles are the `.auth-*` / `.profile-*` classes in `src/index.css`)
- The app is DARK MODE ONLY (spec.md "Out of Scope": light mode is Phase 2)
- Ignore the light-theme palette in `tailwind.config.cjs` — it is unused legacy config
- No ad-hoc colors or spacing: use the tokens/classes above. No icons or emoji in UI text.
- If a screen, state, or component is not defined in DESIGN.md or spec.md: STOP and flag it. Never invent UI.

## Quality rules (from .specify/memory/constitution.md)
- Functions ≤ 50 lines, cyclomatic complexity ≤ 10, nesting ≤ 3 (all ESLint-enforced)
- Coverage ≥ 80% (branches ≥ 75%), AAA pattern, independent tests
- Naming: camelCase vars, verbNoun functions, is/has/should/can booleans, ALL_CAPS constants, JSDoc on public functions
- Validate input at UI boundary AND in Lambdas; users see generic error messages (never raw error.message); no secrets in code
- Commits: `type: description` (feat/fix/docs/test/refactor/chore)

## Known state (update this section when it changes)
- Deployed API has ONE route: /api → nutripilotFunction (boilerplate echo). getProfile/updateProfile
  are NOT registered and /profile is NOT a real route yet — T046 fixes this. A backend task is NOT
  done until the real endpoint answers.
- `calculateMacros` is duplicated in `src/utils/` and `amplify/backend/function/lib/` — change both or neither.
- No CI yet — T048 adds `.github/workflows/ci.yml` running `npm run verify && npm run build` on
  every push/PR (update this line when it lands).
- The previous Codex/Copilot workflow (prompt scripts, spec-kit templates, per-story architecture
  docs) is archived under `docs/archive/` — do not follow anything in there.

## Workflow rules (any agent)
- For non-trivial work: propose a plan and WAIT for explicit approval before editing files
- Never commit to main. Work on a feature branch (repo convention: NNN-short-name)
- Run `npm run verify` and `npm run build` before claiming any task is done
- Update the tasks.md checkbox only when every DoD line is genuinely met — and report gaps instead of checking the box
- Never push or open a PR without explicit approval
- If requirements are ambiguous, ask — do not guess
