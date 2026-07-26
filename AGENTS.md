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
- Harness reference (skills, hooks, subagents, how to use them): docs/HARNESS.md.
  Update it in the same commit whenever the harness changes.

## Design system — SOURCE OF TRUTH
- Tokens + component contracts: `docs/design/DESIGN.md` and `docs/design/tokens/*.css`
  (reference docs — the shipped styles are the `.auth-*` / `.profile-*` classes in `src/index.css`)
- The app is DARK MODE ONLY (spec.md "Out of Scope": light mode is Phase 2)
- Ignore the light-theme palette in `tailwind.config.cjs` — it is unused legacy config
- Never hardcode a hex/rgba value or ad-hoc spacing: every color comes from
  docs/design/tokens/colors.css (or the matching --auth-*/--macro-* vars in src/index.css),
  and spacing/radii come from the scale in docs/design/tokens/spacing.css — no arbitrary
  pixel values. No icons or emoji in UI text.
- Macro colors are a FIXED mapping — never remix: calories #3b82f6 (blue), protein #22c55e (green),
  carbs #f59e0b (amber), fat #ef4444 (red).
- --color-text-faint (#64748b) is for input placeholder text ONLY (fails WCAG AA as body text);
  captions/timestamps/labels use --color-text-muted (#94a3b8).
- Every screen that fetches data implements all four states — loading, error, empty, populated —
  using the LoadingState/EmptyState/ErrorState contracts in DESIGN.md. A zero-item list renders
  the designed EmptyState, never a blank area.
- Reuse before creating: check src/components/ and the .auth-*/.profile-* classes in src/index.css
  first; extend an existing pattern rather than inventing a new component or class.
- If a screen, state, or component is not defined in DESIGN.md or spec.md: STOP and flag it. Never invent UI.

## Quality rules (from .specify/memory/constitution.md)
- Functions ≤ 50 lines, cyclomatic complexity ≤ 10, nesting ≤ 3 (all ESLint-enforced)
- Coverage ≥ 80% (branches ≥ 75%), AAA pattern, independent tests
- Naming: camelCase vars, verbNoun functions, is/has/should/can booleans, ALL_CAPS constants, JSDoc on public functions
- Validate input at UI boundary AND in Lambdas; users see generic error messages (never raw error.message); no secrets in code
- Commits: `type: description` (feat/fix/docs/test/refactor/chore)

## Known state (update this section when it changes)
- Record new pitfalls here as: symptom → root cause → fix. Only pitfalls actually hit — never
  speculative. When a task fixes a recorded pitfall, remove or update its entry in that same
  task — a stale pitfall is worse than none.
- Deployed API has ONE route: /api → nutripilotFunction (boilerplate echo). getProfile/updateProfile
  are NOT registered and /profile is NOT a real route yet — T046 fixes this. A backend task is NOT
  done until the real endpoint answers.
- `calculateMacros` is duplicated in `src/utils/` and
  `amplify/backend/function/nutripilotnutripilotLambdaLib/lib/nutripilot-lambda-lib-src/`
  (packaged as a Lambda layer, shared by all Lambda functions via the `nutripilot-lambda-lib`
  module) — change both or neither.
- CI (`.github/workflows/ci.yml`, added by T048) runs `npm run verify && npm run build` on every
  push and PR to main.
- eslint.config.js's base block previously had no `files` key, silently excluding
  ALL .jsx files from linting (fixed in T048). Lesson: when adding or changing a
  lint rule, verify the base config's files glob actually matches every extension
  in the source tree before trusting a clean lint run.
- Test files (tests/**/*.test.js) are exempt from max-lines-per-function per
  constitution — encoded as an ESLint override in eslint.config.js (T048). If a
  test file's describe() block trips other rules later, check for a matching
  constitution exception before tightening the rule.
- `src/aws-exports.js` (Cognito/API config) is gitignored; `ci.yml` writes a stub
  before `npm run build` so the app compiles without real AWS. The real file must
  exist locally (from `amplify pull`/`amplify push`) for `npm run dev` and other
  Amplify CLI commands to work.
- `src/amplifyconfiguration.json` exists locally (gitignored) but no code imports
  it — dead file left over from Amplify CLI. Safe to delete; small future cleanup
  task, not fixed now.
- The previous Codex/Copilot workflow (prompt scripts, spec-kit templates, per-story architecture
  docs) is archived under `docs/archive/` — do not follow anything in there.
- Shared Lambda code lives in the `nutripilotnutripilotLambdaLib` Lambda layer (name has a
  doubled "nutripilot" prefix — that's what Amplify actually generated, not a typo). Source of
  truth is `.../lib/nutripilot-lambda-lib-src/` — plain files, a completely normal (non-
  `node_modules`) git-tracked and lint-covered path, no ignore-pattern tricks needed. It's
  packed via `npm pack` into a `.tgz` and consumed by the layer's `lib/nodejs/package.json` as
  a `file:` tarball dependency — deliberately NOT a `file:` directory reference, because npm
  symlinks directory `file:` deps (confirmed empirically) and Amplify's Lambda zip step's
  handling of symlinks is unverified; installing from a `.tgz` always extracts a real copy.
  `lib/nodejs/node_modules/nutripilot-lambda-lib/` (the npm-extracted copy) is a build artifact,
  correctly gitignored like any other installed dependency — never edit it directly, only
  `nutripilot-lambda-lib-src/`.
- Any authored source placed under a node_modules/-shaped path (Lambda layers, vendored deps)
  collides with three different tools' default node_modules handling at once: ESLint's default
  ignore, git's default ignore, and npm's automatic pruning of undeclared packages. Check all
  three before writing code there — don't discover them one at a time.
- `file:` npm dependencies to a raw directory are symlinked, not copied (confirmed empirically),
  which breaks once the consumer zips that directory for deployment. Pack with `npm pack` into a
  `.tgz` and depend on the tarball instead — installing from an archive always extracts a real
  copy, and it's a declared dependency so `npm install` won't prune it as extraneous. Full case
  in `docs/decisions/0001-lambda-routing-auth-shared-code.md`.
- `amplify function build` / `amplify build` only exercise packaging for resources that already
  exist in AWS. For a brand-new, not-yet-pushed resource (e.g. a first-time Lambda layer) they
  succeed trivially without testing anything — there's no local way to verify layer packaging
  before a real `amplify push` on first-time creation. Budget for push-then-inspect, not
  local-verify-then-push.
  Any function consuming this layer needs its own directly-`require`d packages (e.g.
  `@aws-sdk/lib-dynamodb`) declared in its own `src/package.json` too — the layer only covers
  requires reachable via the layer's own `node_modules` walk, not the function's.
  Jest resolves the layer's `nutripilot-lambda-lib/*` requires via a `moduleNameMapper` entry
  in `jest.config.js` pointing at the source dir directly (there's no `/opt/nodejs` locally).

## Workflow rules (any agent)
- For non-trivial work: propose a plan and WAIT for explicit approval before editing files
- Never commit to main. Work on a feature branch (repo convention: NNN-short-name)
- Run `npm run verify` and `npm run build` before claiming any task is done
- Update the tasks.md checkbox only when every DoD line is genuinely met — and report gaps instead of checking the box
- PO content flow (screens → specs → tasks): see docs/agentic-workflow-v3.md. Docs
  change via /design-spec-sync, task cards via /groom — never hand-edit tasks.md to
  match a screen while spec.md/DESIGN.md are stale.
- Learning loop: after each story (or any task that went badly), run /retro to
  convert mistakes into gates. See docs/agentic-workflow-v3.md.
- Never push or open a PR without explicit approval
- If requirements are ambiguous, ask — do not guess
