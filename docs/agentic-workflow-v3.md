# NutriPilot Agentic Development Workflow v3

**Version:** 3.2
**Date:** 2026-07-11 (updated 2026-07-13: added the specification flow as Part 2 and dual-harness Codex operation as Part 8 — the Parts now appear in the order you execute them)
**Replaces:** `docs/agentic-workflow-v2.md` (deleted)
**Corrected against:** `docs/audit-2026-07-11.md` (the repo audit; where v2 and the audit conflict, the audit wins)
**Audience:** Product Owner with junior dev skills, using Claude Code + Claude Design

**How to read this document:** every setup step has three parts — **Instruction** (exactly what to do, with ready-to-paste content), **Reason** (why it matters), and **Verify** (how you confirm it worked). Technical terms are defined the first time they appear. All config blocks are complete; nothing says "adjust as needed" without telling you exactly what to adjust.

---

## Part 0 — What v2 got right, and what the audit changed

### Kept from v2 (the diagnosis and principles were correct)

v2's diagnosis of the old Codex ↔ Copilot workflow stands: you were the message bus between two AIs, you micromanaged tasks instead of writing verifiable specs, you built UI blind, quality gates were manual rituals, and context management didn't exist. The fixes also stand, and each traces to a principle in *Beyond Vibe Coding* (https://beyond.addy.ie/):

| Principle (Beyond Vibe Coding) | What it means here |
|---|---|
| **Plan first** — "Nine of ten times, AI will suggest a complicated approach that you should ask it to simplify" | Every task starts in Plan Mode; you approve before files change |
| **Context is everything** / context engineering — "think of context as RAM for AI" | CLAUDE.md + design system + spec are assembled by the system, not typed per prompt |
| **Deterministic verification** — "Require agents to compile, test, and lint before completion" | Hooks and the `verify` script are scripts, not AI judgment |
| **Visual context** — "One image can enable single-shot solutions" | Claude Design screens in; Playwright screenshots out |
| **Bounded tasks** — "Assign well-defined, single-responsibility tasks" | One task card per session, fresh context each time |
| **Checkpointing** — "use Git branches as natural checkpoints" | Feature branches + `/rewind` make wrong directions cheap |
| **Human oversight** — "Maintain final review authority for all merged code" | You approve plans, commits, and merges |
| **Start with mock data** | Dashboard frontend ships against the existing mock fixture before any backend work |
| **The 70% problem** | AI gets you 70% fast; the last 30% (integration, security, edge cases) is where the gates below earn their keep |

### Changed by the audit (the two systemic findings)

The audit (`docs/audit-2026-07-11.md`) found the code quality is good — all gates pass — but exposed two system-level failures that v2's harness alone would not have caught:

1. **"Done" ≠ deployed.** The profile Lambdas (T023/T024) are checked off in tasks.md and the source is real and tested — but no task ever existed for registering them with AWS or creating the API route. The deployed API is still boilerplate, and the frontend calls a `/profile` route that doesn't exist. The agent did exactly what it was asked; the *task generation* was the gap.
2. **All green gates were mock-only.** Every acceptance criterion in tasks.md is satisfiable with mocked tests, so a user story can reach "complete" without one real HTTP request ever succeeding.

v3's response, threaded through every part below: **real-endpoint verification enters the Definition of Done, and tasks.md becomes a maintained contract** (checkboxes updated mechanically by `/ship`, backend tasks always carry wiring + smoke verification).

v2 also got ~13 repo facts wrong (paths, commands, spec claims — full table in audit section 5). Every config in this document uses the verified real values, and the hook syntax has been checked against the current official Claude Code documentation (v2's `$CLAUDE_FILE_PATHS` form is outdated; hooks now receive JSON on stdin — explained in Part 3.3).

---

## Part 1 — Phase 0: Cleanup task zero

Do this **before** any harness setup or new feature code. (Generating design screens in Claude Design — Part 2.1 — is the one thing you can safely do in parallel; it never touches the code.) Steps 0.1–0.2 are hand edits (10–20 minutes total). Steps 0.3–0.5 are Claude Code sessions run in this exact order: **T048 first** (so the new lint rules and CI guard the next two fixes), then **T046** (the critical backend blocker), then **T047**.

> **Note on steps 0.3–0.5:** the harness (Part 3) doesn't exist yet, so for these three sessions you run the gates yourself: after Claude finishes, run `npm run verify && npm run build` in your terminal, read the diff (`git diff`), and commit manually with a `type: description` message on a feature branch. This is the last time you'll do it by hand.

### Step 0.1 — Sync tasks.md with reality *(by hand)*

**Instruction:** Open `specs/000-planning-phase/tasks.md` and make these edits:

1. Check off two tasks that are already done (verified by the audit — the code exists and passes):
   - `T026A` (useProfile hook tests) — change `[ ]` to `[x]`
   - `T044` (verify npm script) — change `[ ]` to `[x]`
2. Paste the three new task cards below at the end of the **Phase 4 (US2)** section for T046, and into the **Final Phase: Polish** section for T047 and T048:

```markdown
- [ ] T046 [US2] Register profile Lambdas + API Gateway routes and deploy
  - Files: `amplify/backend/backend-config.json`, `amplify/backend/api/nutripilotapi/cli-inputs.json`,
    `amplify/backend/function/getProfile/*`, `amplify/backend/function/updateProfile/*`
  - Notes: Register getProfile/updateProfile with Amplify; add GET/POST /profile with Cognito
    authorizer; decide nutripilotFunction's fate (implement as router or remove); amplify push.
  - Tests: existing `tests/lambdas/*.test.js` still pass; manual smoke per docs/manual_testing/profile-onboarding.md
  - Acceptance: GET and POST /profile return live 200s with the DTO shape from a signed-in session;
    settings screen round-trips against real AWS; US2 Independent Test executed and passing.
  - DoD: `npm run verify`; smoke test evidence noted in the manual test doc.

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
```

3. Apply the format fixes from audit section 4.3:
   - In "Dependencies & Execution Order" and "Parallel Execution Opportunities", remove the references to `T032`/`T033` (they were folded into T027–T031 per the US3 note).
   - In T007, change `src/index.js` to `src/index.jsx` (the actual file name).
   - In the Task Card Template's DoD line, replace ``Tests pass; `npm run lint`; `npm run format:check`.`` with ``` `npm run verify` passes. ``` (T044 exists now — one command is the whole gate).
   - Add one line to the "User Story Quality Gate" checklist: `- [ ] Independent Test executed against the dev environment and passed.`

**Reason:** tasks.md is the source of truth for what the agent works on. The audit found it stale in both directions — two finished tasks unchecked, and (worse) no task category for infrastructure at all, which is the root cause of the unwired backend. These edits make the file truthful and give it the missing task type.

**Verify:** `git diff specs/000-planning-phase/tasks.md` shows exactly these changes and nothing else. `grep -c "T046\|T047\|T048" specs/000-planning-phase/tasks.md` returns at least 3.

### Step 0.2 — Archive the Codex-era leftovers *(by hand)*

**Instruction:** These are the REAL leftover files, confirmed by a full scan of every tracked .md file on 2026-07-13 (v2 told you to archive `00-MASTER-GUIDE.md`, which does not exist; `docs/agentic-workflow-v2.md` is already deleted). In your terminal, from the repo root:

```bash
mkdir -p docs/archive
git mv .codex docs/archive/codex
git mv scripts/prompts docs/archive/codex-prompt-scripts
git mv docs/ai-assisted-development-workflow.md docs/archive/
git mv .github/copilot-instructions.md docs/archive/
git mv .github/prompts docs/archive/github-prompts
git mv docs/ai-prompts docs/archive/ai-prompts
git mv docs/architecture docs/archive/architecture
git mv .specify/templates docs/archive/specify-templates
git mv .specify/specs docs/archive/specify-specs
```

What each of the five newly-listed items is and why it goes: `.github/prompts/` (3 files) and `.specify/templates/` (5 files) are spec-kit *regeneration* machinery — Part 2.0 explicitly drops that; `docs/ai-prompts/` (5 files) is the old prompt-courier system, superseded by the reusable prompts in Part 7 and the skills in Part 3; `docs/architecture/us2-...md` describes the US2 backend as a working end-to-end flow, which the audit disproved — stale architecture notes are *misinformation* to an agent; `.specify/specs/` is a 4-line placeholder for generated artifacts that will never be generated. **Do NOT touch** `.specify/memory/constitution.md` (quality standards — still the source of truth) or `docs/manual_testing/` (live test evidence, used by every Demo Gate).

Then two file edits:

1. In `package.json`, delete these two lines from `"scripts"` (their script files just moved):

```json
    "prompt:task": "node scripts/prompts/generate_task_prompt.js",
    "prompt:review": "node scripts/prompts/generate_review_prompt.js",
```

2. Replace the entire content of `AGENTS.md` with the pointer below — **or**, if you are adopting the dual-tool setup (Part 8), skip this and use Part 8.1's full shared AGENTS.md instead:

```markdown
# Repository Guidelines

This project is developed with Claude Code. All standing instructions live in `CLAUDE.md`
(repo root). Quality standards: `.specify/memory/constitution.md`. Backlog: `specs/000-planning-phase/tasks.md`.
The previous Codex/Copilot workflow is archived under `docs/archive/`.
```

Commit the lot: `git add -A && git commit -m "chore: archive Codex-era workflow files and sync tasks.md"`

**Reason:** old agent instructions that stay in the repo leak into context — an agent that stumbles on `.codex/config.yml` or the Copilot instructions can follow dead rules (that config even points at file paths that don't exist). Archiving, not deleting, keeps the history readable.

**Verify:** `npm run verify` still passes (proves removing the scripts broke nothing). `ls .codex 2>/dev/null` prints an error (it's gone). `git status` is clean after the commit.

### Step 0.3 — T048: lint rules + CI *(Claude Code session #1)*

**Instruction:** Start a fresh Claude Code session in the repo. Press **Shift+Tab** to enter Plan Mode (a read-only mode where Claude proposes a plan and cannot edit files until you approve). Paste:

> Implement task T048 from specs/000-planning-phase/tasks.md. Add `'max-lines-per-function': ['error', { max: 50, skipComments: true, skipBlankLines: true }]` and `'max-depth': ['error', 3]` to the rules in eslint.config.js. Delete the dead legacy .eslintrc.js (ESLint 9 uses the flat config only). Create .github/workflows/ci.yml exactly as specified in docs/agentic-workflow-v3.md Part 3.7. Run npm run verify to confirm the existing code passes the new rules. If any existing function violates the new rules, stop and show me the list instead of refactoring.

Approve the plan when it looks right (it should be ~3 small changes). After implementation, run the gate yourself and commit on a branch:

```bash
git checkout -b 021-cleanup-task-zero
npm run verify && npm run build
git add -A && git commit -m "chore: enforce constitution lint rules and add CI (T048)"
git push -u origin 021-cleanup-task-zero
```

**Reason:** T048 goes first so that the stricter lint rules and CI are already guarding the code when T046 and T047 land. The constitution has claimed since day one that the 50-line and nesting rules are "tool-enforced" — after this step it's finally true. (`skipComments`/`skipBlankLines` match the constitution's "excluding comments and whitespace" measurement rule.)

**Verify:** Ask Claude to write a scratch file with a 60-line function — `npm run lint` must fail on it (then delete the scratch file). After pushing, open your repo on GitHub → **Actions** tab → the CI run appears and is green.

### Step 0.4 — T046: wire the backend *(Claude Code session #2 — the critical one)*

Some vocabulary first: **API Gateway** is the AWS service that gives your Lambdas public URLs; a **route** is one URL path it exposes (like `/profile`); a **Cognito authorizer** is the API Gateway setting that rejects any request that doesn't carry a valid login token from your Cognito user pool — it's what makes a route "signed-in users only"; a **smoke test** is the simplest possible real-world check ("does the deployed endpoint answer at all with the right shape").

**Instruction:** Fresh session (`/clear` or restart). Plan Mode. Paste:

> Implement task T046 from specs/000-planning-phase/tasks.md. Context: the audit (docs/audit-2026-07-11.md, finding C1) confirmed getProfile and updateProfile exist only as source under amplify/backend/function/ — they are not in backend-config.json, not in amplify-meta.json, and API Gateway has no /profile route. The frontend calls GET/POST /profile via src/api/client.js. Plan how to register both functions with Amplify and route /profile (GET and POST) through the Cognito authorizer, and what to do with nutripilotFunction (the boilerplate echo — recommend removal unless you find a reason to keep it). Prefer the official Amplify CLI flows (amplify add function / amplify update api) over hand-editing generated config files, and tell me exactly which interactive CLI commands I need to run myself and what to answer at each prompt. Do not run amplify push yourself — I will run it.

The Amplify CLI asks interactive questions that Claude cannot answer in a terminal it doesn't control, so expect this session to be a **pair exercise**: Claude tells you the command and the answers; you run it by typing `! <command>` in the Claude Code prompt (the `!` prefix runs it in your session so Claude sees the output) or in a separate terminal. When the config is ready, **you** run `amplify push` and paste the result.

After the push succeeds, verify the real endpoint (this is the DoD line that was always missing):

1. `npm run dev`, sign in at http://localhost:5173, open `/settings`, fill the profile form, save.
2. You should see "Profile saved successfully." and the calculated targets — **coming from real AWS this time**. Reload the page: the form repopulates (that's the US2 Independent Test from tasks.md, finally executed).
3. Record the result in `docs/manual_testing/profile-onboarding.md` (date + "executed against dev environment, passing").

Then: `npm run verify && npm run build`, commit (`feat: register profile Lambdas and API routes (T046)`), push, and check off T046 in tasks.md **in the same commit**.

**Reason:** this is the audit's Critical finding C1 — the single blocker for everything backend-shaped that follows. Just as important, it establishes the *wiring pattern* that T027 (`getDashboard`) and all US4 Lambdas will copy, so it's worth doing carefully once.

**Verify:** the three-step smoke test above, plus: `python3 -c "import json; d=json.load(open('amplify/backend/backend-config.json')); print(list(d['function'].keys()))"` lists `getProfile` and `updateProfile`. The settings screen works with the browser's network tab showing real 200 responses from `amazonaws.com`.

### Step 0.5 — T047: error messages *(Claude Code session #3)*

**Instruction:** Fresh session. Plan Mode. Paste:

> Implement task T047 from specs/000-planning-phase/tasks.md. The audit (docs/audit-2026-07-11.md, finding S1) documents the three defects: RegisterForm falls back to "Email already registered" for ANY unnamed error and leaks raw error.message; LoginForm maps every failure including UserNotConfirmedException to "Invalid email or password"; ProfileForm renders raw error?.message. Map the known Cognito error names to specific friendly messages, use a generic fallback for everything else, and never render a raw error.message from Amplify or the backend. Extend the existing tests with one case per mapped code plus the fallback. Keep the extracted validation helpers pattern the forms already use.

Then `npm run verify && npm run build`, commit (`fix: map auth error codes to friendly messages (T047)`), push, check off T047 in tasks.md in the same commit, and open a pull request for the whole `021-cleanup-task-zero` branch (see Part 4 for the PR routine — or just run `gh pr create --fill` for this one).

**Reason:** these are constitution violations ("generic error messages to users") in the exact files every future screen will imitate. Fixing them before the Dashboard means the Dashboard copies good patterns.

**Verify:** `npm run test:coverage` shows the new test cases passing. Manual check: stop your wifi, try to register — you should see a generic "something went wrong" style message, **not** "Email already registered".

---

## Part 2 — The specification flow: spec → screens → tasks → demo

**Why this part exists:** the original spec-driven setup collapsed into micromanagement because everything lived at one altitude — the task level — and task cards ("Implement `getProfile` Lambda in `amplify/backend/function/...`") are written in a language you can't verify. So you ended up watching individual diffs, which is the one job the harness should take off you. Meanwhile the layer you *can* verify — "does the screen look and behave like the spec?" — had no artifact and no checkbox.

The fix is to run the project at **three altitudes**, each with one artifact and one owner:

| Altitude | Artifact | Owner | You interact with it by… |
|---|---|---|---|
| **WHAT** (requirements) | `spec.md`, with numbered requirement IDs | You | reading and editing plain sentences |
| **LOOKS LIKE** (visual contract) | `docs/design/screens/*.png` (from Claude Design) | You | looking at pictures |
| **HOW** (work breakdown) | `specs/000-planning-phase/tasks.md` | The agent proposes; you approve | reading only story headers and Demo Gates |

Two terms used throughout: **traceability** means every requirement can be followed to the task that implements it and back — so "did we forget something?" is a lookup, not an investigation. A **Demo Gate** is the final task of every user story: *you* using the deployed feature and comparing it to the design screen. A story is done when its Demo Gate is checked, not when its file-tasks are.

**This Part sits where you execute it — the document now reads in doing-order.** Phase 0 (Part 1) comes first because it's the hard blocker; then this Part, then the harness. Steps 2.1–2.4 need nothing from the harness: the screens are browser work in Claude Design (start them in parallel with Phase 0 if you like — they never touch the code), and the spec-numbering and Kickoff sessions only edit documents, so you gate them by hand exactly like the Phase 0 sessions (`git diff`, read, commit). Step 2.5 — actually implementing the story — is the only step that waits for Part 3, because that's where `/ship`, the lint hook, and `/verify-ui` come from. Two hard rules: **a story's screen must exist before its Story Kickoff (2.3)**, and **no story code before its Kickoff is approved (2.4)**. Steps 2.1–2.4 happen once before US3 starts; from then on, 2.3→2.5 repeat per story.

### 2.0 One source of truth per question

This document is the *only* process document — everything that competes with it is archived in step 0.2. But "one page of truth" doesn't mean one file holds everything; it means **no question has two answers**:

| Question | The one place that answers it |
|---|---|
| How do we work? What do I do next? | **this document** |
| What are we building? | `spec.md` |
| What should it look like? | `docs/design/screens/` + `docs/design/DESIGN.md` |
| What's done, in progress, and next? | `specs/000-planning-phase/tasks.md` |
| What is good code here? | `.specify/memory/constitution.md` |
| What does the agent always know? | `CLAUDE.md` / `AGENTS.md` |

**What we deliberately drop from the original spec-kit structure** (the directory layout with `.github/prompts/`, regenerated `plan.md`, a `tasks/` directory, and ADRs in `docs/decisions/` for every choice): all of the *regeneration* machinery. Regenerating documents from documents is exactly where sync-drift comes from — every generated copy is another file that can go stale. In v3, `spec.md` and `tasks.md` are edited directly, in small diffs, in the same commits as the work they describe. `docs/decisions/` survives for one purpose only: genuine architecture deviations from plan.md (expect a handful per year, not per story). If a process step in this Part ever feels like filling in a form nobody reads — flag it and we cut it. Lean beats complete.

### 2.1 Step 1 — Generate the screens in Claude Design *(your job, no repo dependency)*

**Instruction:** For each of the three UI surfaces in spec.md — **Dashboard**, **Log Meal modal**, **Settings** — run one Claude Design conversation:

1. Paste the screen's full section from spec.md (layout sketch, States, Interactions) plus the contents of `docs/design/DESIGN.md`, and say: *"Generate this screen exactly per the spec and design system. Dark mode only. Mobile-first, 390px wide. If the spec is ambiguous or contradicts itself, list the ambiguities instead of inventing."*
2. For the Dashboard, generate **two states**: populated (the spec's layout sketch) and empty ("No meals logged today" + Log First Meal button). States are where screens diverge from specs; one state hides the other's gaps.
3. Save the results as PNG into `docs/design/screens/` — `dashboard.png`, `dashboard-empty.png`, `log-meal-modal.png`, `settings.png`.
4. Keep `docs/design/screens/NOTES.md` open while you work. Every time a screen forces a question the spec doesn't answer — or answers two ways — write one line: what you noticed, and which spec section it touches. **Do not fix anything yet.** The Kickoff (2.3) consumes this list.
5. Commit the folder when done: `git add docs/design/screens && git commit -m "docs: design screens as visual contract per spec"` (do this on `main` after the Phase 0 PR merges, to avoid branch juggling).

Generate Settings too, even though that screen already exists in the app — comparing the generated screen to the running app is a free audit of what shipped.

**Reason:** the screens are the spec rendered in the only format you can review at a glance, which makes generating them a **requirements review you're qualified to do**. Proof it works: walking the Dashboard mockup against the API contract already exposed a real gap — the spec's Dashboard shows a "Nutritionist Analysis" panel, but the `GET /api/dashboard` response contains no field that could feed it, and no task builds it. You'll hit that exact item in 2.3.

**Verify:** `ls docs/design/screens/` shows the four PNGs plus NOTES.md, and NOTES.md has at least a few lines (if it's empty, you reviewed too fast — the Nutritionist Analysis contradiction alone should be on it).

### 2.2 Step 2 — Number the requirements in spec.md *(one Claude Code session, once)*

**Instruction:** Fresh session, Plan Mode, paste:

> Read spec.md. Add requirement IDs, changing no wording: (1) for each screen section — Dashboard, Log Meal modal, Settings — prefix each item under Layout, States, and Interactions with an ID: DASH-01, DASH-02… / MEAL-01… / SET-01…; (2) give each of the seven API endpoint sections an ID: API-01 through API-07. Then produce a coverage table (in your reply, not in a file): every ID → the tasks.md task(s) that implement it, or "NO TASK". Do not modify tasks.md.

Review the diff (it should be pure insertions), commit: `docs: add requirement IDs to spec.md`. Keep the coverage table from the reply — paste it into `docs/design/screens/NOTES.md` under a "Coverage" heading; the Kickoff will re-derive it, but you'll want to see the two match.

**Reason:** IDs turn "is everything covered?" from an afternoon of cross-reading into a mechanical lookup any agent can do — and they give the change process (2.6) a stable handle: "change DASH-04" is unambiguous forever, "change the progress bars thing" is not.

**Verify:** `grep -c "DASH-" spec.md` returns 8 or more; `git diff --stat` touches only spec.md; every row of the coverage table has either a task ID or "NO TASK" (the NO TASK rows are the point — expect several for the Dashboard).

### 2.3 Step 3 — Story Kickoff *(worked example: US3, the Dashboard)*

This is the step that replaces micromanagement. Before any story starts, one session cross-checks the three altitudes and reports what's missing — **in your language, at story level** — and you make the calls. Ten minutes of your judgment, once per story, instead of watching every diff.

**Instruction:** Fresh session, Plan Mode, paste:

> Story Kickoff for User Story 3 (Dashboard). Read: the Dashboard and GET /api/dashboard sections of spec.md (with requirement IDs); the design screens docs/design/screens/dashboard.png and dashboard-empty.png; docs/design/screens/NOTES.md; the US3 block in specs/000-planning-phase/tasks.md; and the task-writing rules in docs/agentic-workflow-v3.md Part 4.2. Do NOT write any code or edit any file yet. Report, in this order:
> 1. Requirements (by ID) with no covering task.
> 2. Tasks or task clauses with no requirement behind them (scope creep).
> 3. Contradictions — inside spec.md, or between spec.md and the design screens.
> 4. Missing mandatory categories. Every story must contain all six: UI states / frontend logic / backend handler / infrastructure+wiring+deploy / tests / Demo Gate.
> 5. Decisions only I can make — each as a plain-language question with 2–3 options and your recommendation.
> Then propose the corrected US3 task block: full Task Card format (Part 4.2), backend cards shaped like T046, Demo Gate last, new tasks numbered from T049. Wait for my approval before touching tasks.md.

**Reason:** every gap caught here costs one line in a task card; the same gap caught after implementation costs a rework session, and caught after "story complete" it costs an audit. US2 is the proof — its missing wiring task was invisible for months precisely because no step ever compared the three altitudes.

**Verify — grade the report against this answer key.** A good US3 kickoff must surface at least these (all confirmed by inspection on 2026-07-13); if it misses two or more, say *"Re-check the States and Interactions lists against the tasks"*:

- **Nutritionist Analysis panel** (Dashboard layout): no field for it in the API-05 response schema, no task builds it — a spec-internal contradiction *and* a coverage gap.
- **No wiring/deploy task**: T027 (as currently written in tasks.md) creates only the Lambda source — US2's C1 failure about to repeat. The fix is the T046-shaped T027 card from Part 4.2.
- **Meal-card accordion expand** and **pull-to-refresh** (Interactions): in no task.
- **No seeding mechanism**: US3's own Independent Test says "after seeding meals," but nothing can create a meal until US4 — the story as written cannot execute its own test.
- **No Demo Gate**: the Independent Test exists as prose, with no checkbox that forces its execution.
- **Delete-meal from the dashboard** belongs to US4 (T042) — fine, but the US3 Demo Gate must not require it.

**The decisions it should put to you** (recommendations included so you can calibrate its advice): Nutritionist Analysis → defer to Phase 2 (add to spec.md's Out of Scope list; it needs AI work that belongs with US4's OpenAI plumbing) or spec a rule-based version now — deferring is the lean call. Pull-to-refresh → a visible refresh affordance for MVP (pull gestures are native-app territory); one-line spec edit. Seeding → one small dev-only script task (T049) so the Independent Test can run before US4 exists.

### 2.4 Step 4 — Approve the corrected story block

**Instruction:** Read the proposed block — at story altitude, not line-by-line. Your checklist, and the only five things you check:

1. All **six mandatory categories** present (UI states / frontend logic / backend handler / infra+wiring+deploy / tests / Demo Gate)?
2. **Demo Gate last**, and does its Acceptance name the Independent Test *and* the screen comparison?
3. Every backend card **T046-shaped** (registration + route + push + live smoke in Acceptance)?
4. Did every **decision you made in 2.3** land in a card or a spec edit — and nothing you rejected sneak in?
5. Is anything there you can't trace to a requirement ID? (If yes, ask why; usually it's scope creep.)

Then approve. The agent applies the block to tasks.md, applies any spec.md edits your decisions require (e.g. moving Nutritionist Analysis to Out of Scope), and commits both in one commit: `docs: US3 kickoff — corrected story block + spec decisions`. The Demo Gate card it writes should look like this (this is the shape to expect, with your real task numbers):

```markdown
- [ ] T050 [US3] Demo Gate: Independent Test + design match
  - Files: `docs/manual_testing/dashboard.md` (new)
  - Notes: run only after every other US3 task is checked; requires the dashboard endpoint
    deployed (T027). Seed meals via the T049 script first.
  - Tests: manual, plus /verify-ui screenshots of /dashboard (populated AND empty states).
  - Acceptance: US3 Independent Test executed against the dev environment and passing;
    /verify-ui screenshots match docs/design/screens/dashboard.png and dashboard-empty.png
    in layout, states, and tokens; evidence (date + screenshots) recorded in the manual test doc.
  - DoD: `npm run verify`; the Product Owner signs off in the manual test doc.
```

**Reason:** this is the altitude contract in action — the agent owns the HOW, you own the WHAT and the LOOKS LIKE, and this checkpoint is where the two meet. The five-point checklist is deliberately short: if approving a story block takes more than ten minutes, the block (or the report) is too noisy — say so.

**Verify:** `git show --stat` for the kickoff commit touches at most spec.md + tasks.md; the US3 block in tasks.md now ends with the Demo Gate; every 2.3 decision is visible in the diff.

### 2.5 Step 5 — Execute the story, then run the Demo Gate

**Instruction:** Prerequisite check first: the harness (Part 3) must be fully set up before the block's first task starts — this is the only step of the specification flow that depends on it. Each task in the approved block then runs through the Part 4 ritual — one task, one session, one branch, `/ship`, PR, merge. Nothing new to learn; the kickoff changed *what's* in the cards, not how they run. Keep the story order: frontend-on-mock first, backend wiring second, integration swap third (Part 6).

When every card except the Demo Gate is checked, run the gate — this is **your** session, ~20 minutes:

1. Seed data (the T049 script), `npm run dev`, sign in.
2. Execute the story's Independent Test from tasks.md, literally, step by step.
3. Have Claude run `/verify-ui` for each state; put the screenshot next to the design PNG. You're checking layout, states, and tokens — not pixel-identical rendering; the design screen is a contract, not a bitmap.
4. Divergence that's a bug → one fix task through the ritual, then re-run the gate. Divergence that's *better* than the design → update the PNG (regenerate or replace), one line in NOTES.md why.
5. Record date + verdict + screenshots in the manual test doc, check the Demo Gate box, commit.

Then the story-level outer review (Part 5), one fix task if it finds anything, and on to the next story's kickoff.

**Reason:** the Demo Gate is the single mechanism that would have caught *both* audit findings — an unwired backend cannot pass "Independent Test executed against the dev environment," and a screen you never looked at cannot pass a screenshot comparison. Everything else in this Part exists to make this 20-minute check possible.

**Verify:** the manual test doc has a dated, passing entry with screenshots; every checkbox in the US3 block is `[x]`; the User Story Quality Gate checklist at the top of tasks.md passes for the story.

### 2.6 Managing requirement changes — the lean loop

The rule that keeps this from becoming bureaucracy: **a change touches at most three places** — spec.md (always), the design screen (only if it changes what you see), the story block in tasks.md (only if it changes work). Never a fourth. No decision record, no plan regeneration, no status document. Git is the changelog; the commit message is the decision record.

Three sizes of change:

- **Cosmetic** (copy, spacing, a color that's already a token): no spec edit needed if the spec doesn't mention it. It's just a task — through the normal ritual.
- **Behavior change to something specced** (e.g. "progress bars should show grams remaining, not percent"): run the intake prompt below. One session, one commit for the docs, then the work is ordinary tasks.
- **New capability** (e.g. "weekly summary screen"): that's a new story — it enters as a spec.md section + a screen (2.1) + a kickoff (2.3). Don't intake it; kickoff it.

**The Change Intake prompt** (fresh session, Plan Mode):

> Requirement change: <describe it in your own words, naming the requirement ID if it exists>. (1) Propose the spec.md edit — changed or new requirement line, keeping the ID scheme. (2) Tell me whether the design screen needs regenerating, yes or no, and why. (3) Show the tasks.md impact: which cards change, which are added, and — say it explicitly — whether any already-completed task is invalidated by this change. (4) Wait for my approval, then apply the spec.md and tasks.md edits in one commit: "spec: <short description>". Do not write code in this session.

Point (3) is the one that protects you: "this invalidates T031, the Dashboard component you already shipped" is exactly the sentence that must be said *before* you commit to a change, not discovered after. If the screen needs regenerating, that's your 2.1 homework before the change's tasks start.

**Reason:** the old flow's failure mode was drift between many generated files; the fix is not more discipline updating them — it's having fewer files, edited directly, in the same commit. Three touchpoints is the minimum that keeps the three altitudes true, and anything beyond it has to justify itself.

**Verify:** after any intake, `git show --stat` for the spec commit touches at most spec.md + tasks.md; six months from now, `git log --oneline -- spec.md` reads as a clean history of every requirement decision — for free.

### 2.7 The daily workflow

Print this next to the Part 4 ritual. It's the whole job:

```
┌──────────────────────────────────────────────────────────────────┐
│ START OF DAY                                                      │
│   git pull → open tasks.md → find the active story block          │
│   next unchecked task → Part 4 ritual (one task, one session)     │
│                                                                   │
│ DURING THE DAY                                                    │
│   • Idea or requirement change? DON'T touch code and don't        │
│     derail the running task — one line in NOTES.md now,           │
│     Change Intake (2.6) when the current task ships.              │
│   • Rate-limited? Switch harness (Part 8.6) — but finish the      │
│     in-flight task in the tool that started it.                   │
│   • Agent asks a WHAT question? Answer from spec.md; if spec.md   │
│     doesn't know, that's a change → intake, not a chat answer.    │
│                                                                   │
│ END OF STORY (all cards checked except Demo Gate)                 │
│   Demo Gate session (2.5) → outer review (Part 5) → one fix       │
│   task if needed → next story's Kickoff (2.3; screen must exist)  │
└──────────────────────────────────────────────────────────────────┘
```

The third DURING bullet is the anti-micromanagement rule in miniature: requirements decided in chat evaporate; requirements decided in spec.md are permanent. If you find yourself explaining WHAT in a task session, stop — that explanation belongs in spec.md, and the intake prompt puts it there in two minutes.

### 2.8 Repeat for the next story

US4 (Meal Logging + AI) runs the identical loop — this is the part you now do without the worked example:

- [ ] Screens exist: `log-meal-modal.png` (from 2.1) — plus regenerate `dashboard.png` if US3's Demo Gate changed it
- [ ] Story Kickoff for US4 (same prompt, swap the story, spec sections, and screens; new tasks continue the T05x numbering)
- [ ] Expect the kickoff to flag: no wiring/deploy task for **four** Lambdas (T037–T040 — same C1 pattern again), the OpenAI key's Secrets Manager setup having no task, and no US4 Demo Gate
- [ ] Approve the block (2.4 checklist) → execute (2.5) → Demo Gate → outer review

When US4's Demo Gate is checked, the MVP loop from spec.md is complete end to end — and you'll have run this Part three times (US3, US4, and the change intakes between), which is the point where it's yours.

---

## Part 3 — Harness setup, corrected for this repo

One step per sitting. After Part 3 is done, you never run gates by hand again.

Vocabulary for this part: **frontmatter** is a small block of `key: value` settings between two `---` lines at the top of a Markdown file — tools read it as configuration; **YAML** is the format those key/value lines are written in; a **matcher** is a pattern that says which events a rule applies to (e.g. "when the Edit or Write tool runs"); **stdin** ("standard input") is the pipe through which one program feeds data into another; a **subagent** is a separate Claude instance with its own context window and its own restricted tool list; a **skill** is a reusable instruction file you invoke as a slash-command (like `/ship`); a **hook** is a script Claude Code runs automatically at lifecycle events — no AI judgment involved.

### Step 3.1 — Create CLAUDE.md

> **Dual-tool note:** if you plan to run both Claude Code and Codex (Part 8), use Part 8.1's split layout instead — same content, but the shared facts live in `AGENTS.md` and `CLAUDE.md` imports them. Either way, do this step now; converting later is a 5-minute cut-and-paste.

**Instruction:** Create `CLAUDE.md` at the repo root with exactly this content (it is the audit's corrected draft — every path and command verified):

```markdown
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
- T046 wired getProfile/updateProfile to API Gateway with the Cognito authorizer — copy that
  pattern for every new Lambda. A backend task is NOT done until the real endpoint answers.
- `calculateMacros` is duplicated in `src/utils/` and `amplify/backend/function/lib/` — change both or neither.
- CI (.github/workflows/ci.yml) runs `npm run verify && npm run build` on every push/PR.

## Workflow rules
- Always start non-trivial work in Plan Mode; wait for my approval
- After implementing UI, verify visually with /verify-ui before declaring done
- Ship via the /ship skill only: it runs the gate, review, tasks.md update, then commits to the
  current feature branch and opens/updates a PR — never push directly to main
- If requirements are ambiguous, ask — do not guess
```

> If you write this file **before** finishing T046, temporarily replace the first "Known state" bullet with: *"Deployed API has ONE route: /api → nutripilotFunction (boilerplate echo). getProfile/updateProfile are NOT registered and /profile is NOT a real route yet — T046 fixes this."* Swap it for the line above when T046 ships. CLAUDE.md must describe reality, never aspiration.

**Reason:** CLAUDE.md is loaded at every session start and survives context compaction — it's the one instruction layer the agent can't forget. This is *context engineering*: everything you used to retype per prompt lives here once. It's lean on purpose: every line costs context in every session.

**Verify:** Start a fresh Claude Code session and ask: *"What command proves the coverage gate passed, and where is the backlog source of truth?"* It should answer `npm run verify` (or `test:coverage`) and `specs/000-planning-phase/tasks.md` without reading other files.

### Step 3.2 — Permissions in .claude/settings.json

**Instruction:** Create `.claude/settings.json` (create the `.claude/` folder if needed) with this content — the `hooks` section is explained in Step 2.3 but included here so you paste the file once:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run verify)",
      "Bash(npm run lint)",
      "Bash(npm run lint:fix)",
      "Bash(npm run test:coverage)",
      "Bash(npm run format:check)",
      "Bash(npm run build)",
      "Bash(npm run dev)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(gh pr *)",
      "Bash(gh run *)"
    ],
    "deny": [
      "Bash(git push --force *)",
      "Bash(git push -f *)",
      "Bash(git push * --force)",
      "Bash(rm -rf *)",
      "Read(.env)",
      "Read(.env.*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/lint-changed.sh"
          }
        ]
      }
    ]
  }
}
```

Commit this file — it's shared project config.

How the rules work: `Bash(npm run verify)` allows that exact command; a trailing `*` with a space (`git add *`) allows anything starting with that prefix. **Deny always beats allow**, at every level. `Read(.env)` matches a `.env` file at any depth in the project (the rules follow gitignore-style matching). Two deliberate omissions: plain `git push` is *not* pre-approved — the push prompt is your final approval moment in `/ship` — and `git status`/`diff`/`log` need no rules because Claude Code treats read-only git commands as safe automatically.

**Reason:** the old workflow was slow partly because you were the approval bottleneck for everything, so you defaulted to trusting blindly. This is *control proportional to risk* (the Three Pillars of Trust): repetitive safe commands are pre-approved; pushes, force-pushes, secrets, and deletions still gate on you or are blocked outright.

**Verify:** Ask Claude to run `npm run verify` — no approval prompt. Ask it to read `.env` — blocked. Ask it to run `git push --force` — blocked.

### Step 3.3 — The PostToolUse lint hook

**Instruction:** The `hooks` block is already in your settings.json from Step 2.2. Now create the script it points at. First check you have `jq` (a small command-line JSON reader the script uses): run `which jq` — if it prints nothing, install it with `brew install jq`.

Create `.claude/hooks/lint-changed.sh`:

```bash
#!/bin/bash
# PostToolUse hook: lints whichever file Claude just edited or wrote.
# Claude Code sends details of the tool call as JSON on stdin;
# .tool_input.file_path is the edited file's path.

FILE_PATH=$(jq -r '.tool_input.file_path // empty' < /dev/stdin)

case "$FILE_PATH" in
  *.js|*.jsx)
    if ! npx eslint --no-warn-ignored "$FILE_PATH" >&2; then
      echo "ESLint found problems in $FILE_PATH - fix them before moving on." >&2
      exit 2
    fi
    ;;
esac

exit 0
```

Make it executable: `chmod +x .claude/hooks/lint-changed.sh`. Commit both files.

How it works: `PostToolUse` fires after a tool runs; the matcher `Edit|Write` limits it to file edits. The script reads the JSON from stdin, and if the edited file is JavaScript, runs ESLint on just that file. Exit code 2 sends the script's error output straight into Claude's context — Claude sees the lint failure immediately and fixes it before moving on. (For PostToolUse this is feedback, not a block — the edit already happened; that's exactly what we want.)

> **This replaces v2's hook snippet.** v2 used `"$CLAUDE_FILE_PATHS"`, an environment-variable form that is not in the current documentation. The stdin-JSON form above is the documented current interface, verified 2026-07-11.

**Rule of thumb (memorize):**
- **Hook** = a rule enforced by a script, every time, no exceptions (lint on every edit). Cannot be forgotten or skipped.
- **Skill** = a multi-step playbook you invoke on demand (`/ship`, `/verify-ui`).
- **Subagent** = an isolated worker with its own context and restricted tools (the reviewer).

**Reason:** this is the single biggest upgrade over the old flow. Bad code used to sit until you remembered to run checks and pasted errors back by hand. Now the feedback loop is deterministic and instant — *deterministic gates over AI judgment*.

**Verify:** Ask Claude: *"Create scratch.js containing `var x = 1` plus an unused variable, then delete the file."* You should see hook output appear after the write, and Claude should acknowledge/fix the lint errors before deleting.

### Step 3.4 — The code-reviewer subagent

**Instruction:** Create `.claude/agents/code-reviewer.md`:

```markdown
---
name: code-reviewer
description: Strict senior code reviewer for NutriPilot. Use proactively after implementing or modifying any feature, and always as step 4 of /ship. Reviews correctness, security, constitution compliance, design-system compliance, and tasks.md discipline.
tools: Read, Grep, Glob, Bash
---

You are a strict senior code reviewer for the NutriPilot project.
Default stance: REQUEST CHANGES unless the code clearly earns approval.
You have read-only intent: never edit files; report findings only.

Find the changed files with `git diff main...HEAD --name-only` and `git diff main...HEAD`,
then review against ALL of the following:

1. Correctness — does it implement the assigned task card in
   specs/000-planning-phase/tasks.md and the relevant spec.md section? Edge cases
   handled (empty input, network failure, unauthenticated user)?
2. Security — input validated at UI boundary AND in Lambdas; no secrets; no injection
   vectors; auth checks on protected routes; users never see raw error.message
   (.specify/memory/constitution.md "Error Messages" and "Input Validation").
3. Constitution (.specify/memory/constitution.md) — functions ≤ 50 lines, complexity ≤ 10,
   nesting ≤ 3, naming conventions (camelCase, verbNoun, is/has/should/can, ALL_CAPS),
   JSDoc on public functions, AAA test pattern, coverage ≥ 80%.
4. Design system — UI code matches docs/design/DESIGN.md and docs/design/tokens/*.css:
   dark mode only, no ad-hoc colors/spacing/radii, no icons or emoji, existing
   .auth-*/.profile-* class patterns reused where applicable.
5. tasks.md discipline — the task's checkbox state and DoD were honored: the box is
   checked only if every DoD line is truly met, and unrelated tasks were not touched.
6. Backend reality check — if this change includes or modifies a Lambda or API route:
   verify the task includes real-endpoint verification (Amplify registration, route with
   Cognito authorizer, smoke evidence), NOT mock tests only. Mocked-green with no live
   verification is grounds for REQUEST CHANGES on its own.

Output format:
- Verdict: APPROVE or REQUEST CHANGES
- Critical issues (must fix) — each: file, line, problem, concrete fix
- Warnings (should fix) — same format
- One-line note per review area (1–6) confirming what you checked
```

Commit the file.

The frontmatter's `tools: Read, Grep, Glob, Bash` restricts the subagent to inspection tools — it can read files, search, and run git commands, but has no Edit or Write, so it *can't* quietly fix things; it must report. That keeps the generator/reviewer tension honest.

**Reason:** this restores the two-perspective validation you liked about v1 — with the handoff automatic instead of you couriering diffs. Criteria 5 and 6 are new in v3 and exist because of the audit: they are the checks that would have caught "US2 complete but /profile doesn't exist" months earlier.

**Verify:** After any small change, say: *"Have the code-reviewer agent review these changes."* You get a structured verdict with the six area notes. (If Claude can't find the subagent, restart the session — a brand-new `.claude/agents/` directory is only detected at session start.)

### Step 3.5 — The /ship skill

**Instruction:** Create `.claude/skills/ship/SKILL.md`:

```markdown
---
name: ship
description: Run the full quality gate, code review, and tasks.md update, then commit to the current feature branch and open/update a pull request. Use when a task is complete and verified.
disable-model-invocation: true
---

Ship the current work. Follow ALL steps in order. STOP and report if any step fails.

1. Run `git branch --show-current`. If it prints `main`, STOP: tell the user to create a
   feature branch first. Never commit to main.
2. Run `npm run verify` — must pass (lint + format check + tests with coverage ≥ 80%).
3. Run `npm run build` — must succeed.
4. Code review. In Claude Code: delegate to the code-reviewer subagent. In Codex
   (where this skill has no subagents): run the built-in `/review` on the working tree
   and treat its findings as the verdict. If the verdict is REQUEST CHANGES: fix the
   critical issues, re-run steps 2–3, re-review. Maximum 2 fix cycles, then stop and
   escalate to the user with the remaining findings.
5. Update specs/000-planning-phase/tasks.md: mark the completed task(s) `[x]` — only the
   task(s) this work implements, and only if every DoD line is genuinely met. If a DoD
   line is NOT met (e.g. a backend task with no real-endpoint smoke evidence), do not
   check the box; report the gap instead.
6. Show the user: summary of changed files + the tasks.md checkbox change + a proposed
   commit message (format: `type: description`, then a short bullet list).
7. WAIT for explicit user approval. Do not proceed without it.
8. On approval: `git add` the relevant files, commit, and push the current feature
   branch (`git push -u origin <branch>`). Then open a pull request with
   `gh pr create --fill` — or, if a PR already exists for this branch, just push
   (the PR updates automatically).
9. Report the PR URL and remind the user to check CI (`gh run watch` or the GitHub
   Actions tab).
```

Commit the file. You invoke it by typing `/ship`. The `disable-model-invocation: true` line means only *you* can trigger it — Claude will never decide to ship on its own.

**Reason:** the whole end-of-task ritual becomes one command, with you as the sole approval gate for what enters the repo (step 7) and for the merge itself (the PR — a **pull request** is GitHub's "proposed change" page where CI runs and you press Merge). Three corrections vs v2: one `verify` command instead of three (audit #2/#3), feature branch + PR instead of pushing main (audit #9 — pushing main directly contradicted both the constitution and your actual practice), and the tasks.md checkbox update is now step 5 of shipping instead of a thing you remember (audit finding: T026A/T044 sat unchecked because remembering doesn't scale).

**Verify:** Make a trivial change on a branch (fix a typo), run `/ship`, and watch: gate → build → review verdict → tasks.md check → summary → it pauses for your approval → commit → push → PR URL.

### Step 3.6 — Playwright MCP + the /verify-ui skill

**Instruction:** In your terminal, in the project directory:

```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

(**MCP** — Model Context Protocol — is the plug standard that lets Claude Code drive external tools; Playwright is a browser-automation tool. Together they let Claude open a real browser, click, type, screenshot, and read console errors.)

Then create `.claude/skills/verify-ui/SKILL.md`:

```markdown
---
name: verify-ui
description: Visually verify a screen or flow in a real browser. Use after implementing or changing any UI, before /ship.
disable-model-invocation: true
---

Verify the UI works as designed.

Dev server: http://localhost:5173 — start `npm run dev` as a background task if it is not
already running. Note: the dev server auto-opens a browser tab on the user's machine
(`open: true` in vite.config.js); ignore that tab and use Playwright's own browser.

1. Open the target screen via Playwright and take a screenshot.
2. Compare against docs/design/DESIGN.md and docs/design/tokens/*.css: dark mode only
   (#0b0f14 background family), Sora typeface, mint→emerald accent gradient, the fixed
   macro colors, 16px/24px radii, glassmorphic card treatment, no icons or emoji.
3. Exercise the flow: fill forms with valid AND invalid input; walk the happy path and
   every error path the task card / spec.md defines; check loading, empty, error, and
   populated states.
4. Read the browser console after every interaction — any error fails the check.
5. Report: screenshot(s), what passed, every deviation from the design system, and any
   console errors. Fix deviations and re-verify. Maximum 3 cycles, then escalate to the
   user with screenshots.
```

Commit the skill file.

**Reason:** this kills the #1 time sink of the old workflow — building UI blind, then describing bugs in words. Claude Design gives the visual target *in*; Playwright screenshots close the loop *out* ("one image can enable single-shot solutions" — and now the agent takes its own images).

**Verify:** With the dev server running, type: */verify-ui on the login screen.* You get a screenshot and a pass/deviation report referencing DESIGN.md.

### Step 3.7 — CI workflow

**Instruction:** This file is created during Phase 0 (step 0.3, T048) — this section is the exact content and the explanation. `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run verify
      - run: npm run build
```

(**CI** — continuous integration — is GitHub running your quality gate on their machines on every push, so "it passed on my laptop" is never the last word. `npm ci` is the install command for automated environments — it installs exactly what package-lock.json says.)

**Reason:** the constitution has said "CI will fail if tests don't pass / coverage < 80% / ESLint errors" since October — the audit found no CI existed (finding S4). This makes the constitution honest, and it's the outer wall behind the hook (inner, per-edit) and `/ship` (per-task) gates.

**Verify:** Push any branch → GitHub → Actions tab → the "CI" run appears; open it and see verify + build both green. `gh run watch` in your terminal does the same without the browser.

---

## Part 4 — The per-task ritual and how to write tasks

### 4.1 The ritual

Every task follows this loop. Print it.

```
┌────────────────────────────────────────────────────────────────┐
│ 0. FRESH START    new session or /clear                        │
│ 1. BRANCH         git checkout -b NNN-short-name               │
│                   (repo convention: 030-dashboard, etc.)       │
│ 2. PLAN           Shift+Tab into Plan Mode:                    │
│                   "Implement task TNNN from tasks.md ..."      │
│ 3. YOU APPROVE    read the plan; push back; simplify; approve  │
│ 4. IMPLEMENT      Claude codes; the hook lints every edit      │
│ 5. /verify-ui     (UI tasks) agent sees + fixes its own UI     │
│ 6. /ship          gate → review → tasks.md → your approval →   │
│                   commit → push branch → PR                    │
│ 7. CI + MERGE     gh run watch; when green, YOU merge the PR   │
│ 8. /clear         next task starts clean                       │
└────────────────────────────────────────────────────────────────┘
```

Why each part: fresh start (0, 8) prevents context rot — CLAUDE.md carries everything persistent. The branch (1) is your checkpoint: a wrong direction costs a `git checkout main`, not a debugging week (and `Esc Esc` / `/rewind` rolls back mid-task; note that rewind tracks Claude's file edits, not changes made via bash commands). Plan Mode (2–3) is the book's #1 practice — plans are cheap, wrong implementations aren't, and nine times out of ten the first plan should be simplified. Verify before ship (5 before 6): never review code for a UI you haven't seen working. You merge (7): human oversight is the final gate, always.

### 4.2 Writing tasks — the rules that prevent the next C1

The audit's root-cause finding: the unwired backend wasn't an agent failure, it was a *task-generation* failure — no task ever said "register and deploy," and every acceptance criterion was satisfiable with mocks. These rules fix the generator (you):

1. **Every task uses the full Task Card format** — Files / Notes / Tests / Acceptance / DoD. The one-line format from Phases 1–3 is retired. A card must be executable by an agent with no other prompt: if you'd have to explain something in chat, it belongs in Notes.
2. **Every backend task carries wiring + real-endpoint smoke verification in Acceptance/DoD.** A Lambda task is not done when the handler file exists and mocked tests pass. It is done when: the function is registered in `backend-config.json`, the route exists behind the Cognito authorizer, `amplify push` succeeded, and a live request returned the expected shape. Put that sentence in the card, every time.
3. **Story gates require the executed Independent Test.** Each user story phase in tasks.md defines an Independent Test — the story is not complete until it has actually been run against the dev environment (it's now a checkbox in the User Story Quality Gate, from step 0.1).
4. **DoD is `npm run verify`** — one command, not a remembered list.
5. **Checkboxes are updated by `/ship` (step 5), never from memory.**
6. **Task cards live inside story blocks, and story blocks are produced by a Story Kickoff** (Part 2.3) — you don't hand-write task lists anymore; the agent proposes the breakdown against spec + design screen, and you approve it at story altitude with the Part 2.4 checklist. Every story block ends with a Demo Gate.

**Worked example — T046 is the template.** Look at its card (Part 1, step 0.1): Files names the *config* files, not just source; Notes says what "wired" means (authorizer, push) and forces the nutripilotFunction decision; Acceptance demands live 200s and the executed Independent Test; DoD demands recorded smoke evidence. When you write T027 (`getDashboard`), copy this shape:

```markdown
- [ ] T027 [P] [US3] Implement getDashboard Lambda, register it, route it, and deploy
  - Files: `amplify/backend/function/getDashboard/src/index.js`,
    `amplify/backend/backend-config.json`, `amplify/backend/api/nutripilotapi/cli-inputs.json`
  - Notes: Query Dynamo entities and compute summaries per spec.md's /api/dashboard contract;
    reuse function/lib/dynamoClient.js; register the function and add GET /dashboard behind the
    Cognito authorizer following the T046 pattern; amplify push (user runs it).
  - Tests: `tests/lambdas/getDashboard.test.js` (mocked unit tests) AND a live smoke request.
  - Acceptance: aggregates profile/targets/meals correctly; handles empty sets; GET /dashboard
    returns a live 200 with the DTO shape from a signed-in session.
  - DoD: `npm run verify`; smoke evidence noted in docs/manual_testing/.
```

---

## Part 5 — Review layers, including Codex

**Inner loop (automatic, every task):** the code-reviewer subagent, invoked as step 4 of `/ship`. It runs in its own context with read-only tools, reviews against the six criteria (including the two audit-driven ones), and the main agent fixes what it reports. You never courier anything.

**Outer loop (optional, once per user story, PR level only):** a second opinion from a different model family catches blind spots a same-model reviewer shares.

> **If you have the Codex CLI installed** (Part 8), skip the copy-paste flow below entirely: from the feature branch run `codex review --base main` — Codex reviews the branch diff directly, no courier work. Part 8.6 covers this and the reversed case (Codex wrote the code, Claude reviews).

Without the CLI, generate the diff and hand it to Codex in the browser:

```bash
gh pr diff <PR-NUMBER> > /tmp/story-diff.patch
```

Then paste this prompt into Codex, attaching or pasting the diff plus the two referenced files:

> You are reviewing a pull request for NutriPilot, a React 18 + Vite + AWS Amplify (Cognito, API Gateway, Lambda, DynamoDB) nutrition tracker. Attached: (1) the full PR diff, (2) the project quality standards (constitution: function length ≤50 lines, complexity ≤10, nesting ≤3, coverage ≥80%, generic user-facing error messages, input validation at UI and Lambda boundaries, no secrets), (3) the relevant section of spec.md.
>
> Review ONLY the diff. Report, in severity order (Critical / Should fix / Nit): logic errors, security issues (injection, auth bypass, secret leakage, raw error message exposure), spec deviations, and constitution violations. For each finding: file, approximate line, problem, concrete fix. Do not restyle code, do not propose architecture changes, do not review files outside the diff. End with a one-paragraph overall verdict.

The two files to attach: `.specify/memory/constitution.md` and `spec.md` (or the story's section of it).

**The hard rule:** Codex's findings come back to Claude Code as **one follow-up task** ("Address the Codex review findings on PR #N: <paste findings>") — a single bounded pass through the normal ritual. Codex must **never** re-enter the per-task inner loop. The moment you find yourself copying Claude's output to Codex and Codex's output back to Claude per change, you have rebuilt v1's courier problem — the exact failure this workflow exists to eliminate. One story, one outer review, one fix task, done.

---

## Part 6 — Order of work: the master path

This is the whole journey, in one list — Parts 1→2→3 in reading order, then the per-story loop:

1. **Phase 0 cleanup** (Part 1) — the hard blocker; nothing else matters until the backend is wired and the gates exist.
2. **Generate the design screens** (Part 2.1) — browser work in Claude Design, zero repo dependency; start it in parallel while Phase 0 sessions run. Must exist before step 4.
3. **Number the spec requirements** (Part 2.2) — one document-only session, once ever; gate it by hand like the Phase 0 sessions.
4. **US3 Story Kickoff** (Part 2.3–2.4) — the gap report, your decisions, the corrected US3 block with wiring task and Demo Gate. Also document-only. No US3 code before this is approved.
5. **Harness** (Part 3), then the dry-run task from the Part 7 checklist — set up now, because the next step is the first real implementation.
6. **Dashboard frontend, mock data first** — the first real task through the full ritual. Prompt it against the *existing* mock: `tests/fixtures/dashboard.js` already contains a response shaped exactly like spec.md's `/api/dashboard` contract (the audit confirmed this — don't create a new mock). Bounded, unblocked by any backend work, and it exercises the design system end to end. Use the screen-task prompt in Part 7.
7. **Dashboard backend (T027)** — copy T046's wiring pattern (the card in Part 4.2). Then swap the frontend from fixture to the real `src/api/dashboard.js` call — a small, separate task.
8. **US3 Demo Gate** (Part 2.5), outer review, merge — the story is now actually done, by the new definition of done.
9. **Onward, story by story** — US4 via its own Kickoff (Part 2.8), then the Polish phase (T043, T045). Requirement changes along the way go through the Change Intake (Part 2.6), never through chat.

### What NOT to adopt yet (kept from v2, still true)

- **Autonomous overnight runs / Ralph loops.** They require a mature test suite and strong eval instincts. Your gates are new; prove them first.
- **Parallel multi-agent orchestration (worktrees, agent teams).** Coordination overhead exceeds benefit for a solo PO on a small app. One agent, sequential tasks.
- **More tools.** No Gemini CLI, no Aider, no second harness. Tool-switching was part of what slowed you down. (Codex's PR-level second opinion in Part 5 is the one deliberate exception, and it's fenced.)

### Graduation criteria — earn autonomy, one notch at a time

After **three screens ship cleanly** through this workflow (Dashboard + its backend + Log Meal is a natural set), consider, in order:

1. **Background dev server** — let Claude keep `npm run dev` running as a background task so `/verify-ui` never waits.
2. **TDD for the US4 Lambdas** — pure logic, no UI: have Claude write failing tests from the spec first, then implement to green. This is the book's recommendation precisely because it makes "done" machine-verifiable, and `analyzeMeal`/`saveMeal`/`getMeals`/`deleteMeal` are the ideal first candidates.
3. **Headless CI review** — Claude reviewing PRs inside GitHub Actions as a free second layer.
4. **Longer leashes** — a screen plus its API integration in one session, once you trust the gates.

Autonomy is earned by the harness, not granted by the tool. Each gate you've *watched catch a real mistake* is a reason to supervise less.

---

## Part 7 — Migration checklist and reusable prompts

### Checklist (in order; Phase 0 first)

- [ ] 0.1 Sync tasks.md: check T026A/T044, paste T046–T048, format fixes — 15 min, by hand
- [ ] 0.2 Archive all dead-workflow files (.codex, scripts/prompts, .github/prompts, docs/ai-prompts, docs/architecture, .specify/templates + specs, old workflow doc), prune `prompt:*` scripts, rewrite AGENTS.md — 15 min, by hand
- [ ] 0.3 T048: lint rules + delete `.eslintrc.js` + CI — Claude session, manual gate
- [ ] 0.4 T046: backend wiring + live smoke test — Claude session (pair exercise for Amplify CLI)
- [ ] 0.5 T047: error messages — Claude session; open the cleanup PR; merge when CI is green
- [ ] 2.1 Design screens generated in Claude Design + NOTES.md — parallel work, start anytime after 0.2
- [ ] 2.2 Requirement IDs added to spec.md + coverage table — one session, manual gate
- [ ] 2.3–2.4 US3 Story Kickoff: gap report graded against the answer key, decisions made, corrected block approved and committed
- [ ] 3.1 Create `CLAUDE.md` — 15 min
- [ ] 3.2 Create `.claude/settings.json` (permissions + hooks block) — 10 min
- [ ] 3.3 Install `jq` if needed; create + chmod `.claude/hooks/lint-changed.sh` — 10 min
- [ ] 3.4 Create `.claude/agents/code-reviewer.md` — 10 min
- [ ] 3.5 Create `.claude/skills/ship/SKILL.md` — 10 min
- [ ] 3.6 Add Playwright MCP; create `.claude/skills/verify-ui/SKILL.md` — 20 min
- [ ] 3.7 Confirm `.github/workflows/ci.yml` exists (from 0.3) and is green
- [ ] Dry run: one trivial change through the full ritual (branch → plan → implement → /verify-ui → /ship → CI → merge) — 30 min
- [ ] First real task: Dashboard frontend against `tests/fixtures/dashboard.js` (first card of the approved US3 block)
- [ ] 2.5 US3 Demo Gate executed and signed off — the workflow has now run end to end once

### Reusable prompts

**Start a screen task (Plan Mode):**
> Implement task T0NN from specs/000-planning-phase/tasks.md: the <SCREEN> screen. Follow docs/design/DESIGN.md and docs/design/tokens/*.css, matching the structural patterns of the existing auth and settings screens (but NOT their error-message handling — see CLAUDE.md quality rules). Use mock data from tests/fixtures/dashboard.js, shaped like spec.md's API response. Give me the simplest viable plan and list anything the design system or spec leaves undefined.

**Start a backend task (Plan Mode):**
> Implement task T0NN from specs/000-planning-phase/tasks.md. Follow the T046 wiring pattern: handler source + mocked unit tests + Amplify registration + route behind the Cognito authorizer. Tell me exactly which interactive Amplify CLI commands I run myself and what to answer; do not run amplify push yourself. The task is not done until the live endpoint answers with the expected shape and the smoke evidence is recorded.

**When the plan is over-engineered:**
> This is more complex than needed. What is the minimal version that satisfies the task card's Acceptance lines? Remove everything speculative.

**When the agent invents instead of flagging:**
> Stop. The design system doesn't define this. Per CLAUDE.md, flag ambiguities instead of inventing. List what's undefined and give me 2–3 options with trade-offs.

**Mid-task course correction:**
> Rewind to before the last change (Esc Esc). Different approach: <describe>. Update the plan before touching files.

**Codex outer review (once per story, PR level):** see Part 5 — generate the diff with `gh pr diff <N>`, use the fenced prompt there, and bring findings back as one follow-up task.

**End of task:**
> /verify-ui on <screen>, then /ship.

---

## Part 8 — Dual-harness operation: running the same workflow on Codex

**Why this part exists:** Claude Code has usage limits; when you hit them mid-week you don't want the workflow to stop. And you already know Codex produces good code here — the audit confirmed the Codex-era code passes the constitution almost everywhere; the failures were *process* gaps (missing wiring tasks, mock-only gates), not code quality. So the strategy is: make the **process** tool-agnostic, and give Codex a thin twin of the tool-specific layer.

All Codex config below was verified against the official Codex documentation on 2026-07-11 (Codex now has lifecycle hooks with the same stdin-JSON design as Claude Code, and implements the same Agent Skills open standard — both are recent additions, which is why v2 never mentioned them).

### 8.0 The portability principle

Most of this workflow is already tool-neutral. Know which layer you're touching:

| Layer | Lives in | Works with |
|---|---|---|
| Task cards (Files/Notes/Tests/Acceptance/DoD) | `specs/000-planning-phase/tasks.md` | any agent |
| Quality gate | `npm run verify && npm run build` | any agent |
| CI | `.github/workflows/ci.yml` | any agent (it's the neutral referee) |
| Branch + PR ritual, you merge | git + GitHub | any agent |
| Design system + spec + constitution | `docs/design/`, `spec.md`, `.specify/memory/constitution.md` | any agent |
| Standing instructions | `AGENTS.md` (shared) + `CLAUDE.md` (Claude extras) | both — see 7.1 |
| Lint-on-edit hook | `.claude/` (Claude) + `.codex/` (Codex) | per-tool twin — see 7.3 |
| Skills (/ship, /verify-ui) | `.claude/skills/`, shared via symlink | both — see 7.4 |
| Reviewer | code-reviewer subagent (Claude) / built-in `/review` (Codex) | per-tool — see 7.5 |

The deterministic gates being tool-agnostic is the whole point: whichever model types the code, the same scripts, CI, and DoD decide whether it ships.

### 8.1 One instruction file for both tools

**Instruction:** Restructure the standing instructions into two files (this supersedes the AGENTS.md pointer from step 0.2 and the monolithic CLAUDE.md from step 2.1).

`AGENTS.md` (repo root) — the shared file both tools read. It is your Part 3.1 CLAUDE.md with the Claude-specific workflow section replaced by tool-neutral rules:

```markdown
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
- T046 wired getProfile/updateProfile to API Gateway with the Cognito authorizer — copy that
  pattern for every new Lambda. A backend task is NOT done until the real endpoint answers.
- `calculateMacros` is duplicated in `src/utils/` and `amplify/backend/function/lib/` — change both or neither.
- CI (.github/workflows/ci.yml) runs `npm run verify && npm run build` on every push/PR.

## Workflow rules (any agent)
- For non-trivial work: propose a plan and WAIT for explicit approval before editing files
- Never commit to main. Work on a feature branch (repo convention: NNN-short-name)
- Run `npm run verify` and `npm run build` before claiming any task is done
- Update the tasks.md checkbox only when every DoD line is genuinely met — and report gaps instead of checking the box
- Never push or open a PR without explicit approval
- If requirements are ambiguous, ask — do not guess
```

`CLAUDE.md` (repo root) — now three lines of import plus the Claude-only extras (`@AGENTS.md` is Claude Code's import syntax: the referenced file's content is loaded as if pasted here):

```markdown
See @AGENTS.md for all project facts, commands, paths, design-system and quality rules,
and the tool-neutral workflow rules. Everything there applies.

## Claude Code-specific workflow
- Always start non-trivial work in Plan Mode; wait for my approval
- After implementing UI, verify visually with /verify-ui before declaring done
- Ship via the /ship skill only — it enforces the gate, review, tasks.md update,
  and the feature-branch + PR flow
```

Commit both.

**Reason:** Codex reads `AGENTS.md` from the repo root natively (it's the open agents.md standard — Codex's `/init` even generates one); Claude Code reads `CLAUDE.md` and imports the shared file. One source of truth, zero drift between tools — the same *context engineering* principle, now tool-agnostic.

**Verify:** Ask **both** tools, in fresh sessions: *"Where is the backlog source of truth and what command proves the coverage gate?"* Both must answer `specs/000-planning-phase/tasks.md` and `npm run verify` without reading other files.

### 8.2 Codex project config

**Instruction:** Create `.codex/config.toml` in the repo (this is a fresh directory — the old spec-kit `.codex/` was archived in step 0.2):

```toml
# NutriPilot project config for the Codex CLI.
# Model is deliberately not pinned - your Codex default applies (change with /model).

approval_policy = "on-request"
sandbox_mode = "workspace-write"

[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

Commit it.

What the two settings mean: `sandbox_mode = "workspace-write"` lets Codex edit files inside the repo but nowhere else (its equivalent of Claude Code's working-directory boundary); `approval_policy = "on-request"` makes it ask before risky commands (its closest equivalent to your permission prompts — Codex has no per-command allow/deny lists like Part 3.2, so the sandbox + approval mode carry that weight). The `[mcp_servers.playwright]` block gives Codex the same browser-verification tool Claude uses for `/verify-ui`.

**Reason:** without a project config Codex runs with your personal `~/.codex/config.toml` defaults, which may be looser or tighter than this project wants. Committing the project file keeps both tools operating under equivalent guardrails.

**Verify:** Run `codex` in the repo, then `/status` — it should show `workspace-write` and `on-request`. Ask it to list available MCP tools — Playwright's should appear.

### 8.3 Port the lint hook

Codex now supports lifecycle hooks with the same design as Claude Code's: events like `PostToolUse`, config with matchers, and event data delivered as JSON on stdin. One real difference: Codex's file-editing tool is `apply_patch`, whose payload is a patch (possibly spanning several files), not a single `file_path` — so the Codex hook lints *all* modified JS files rather than the one just touched.

**Instruction:** Create `.codex/hooks.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "apply_patch",
        "hooks": [
          {
            "type": "command",
            "command": "bash .codex/hooks/lint-modified.sh",
            "statusMessage": "Linting changed files",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

And `.codex/hooks/lint-modified.sh`:

```bash
#!/bin/bash
# Codex PostToolUse hook: lint every JS/JSX file modified in the working tree.
# (Codex's apply_patch payload has no single file_path, so lint all changed files.)

FILES=$(git diff --name-only --diff-filter=ACM HEAD -- '*.js' '*.jsx')
[ -z "$FILES" ] && exit 0

if ! npx eslint --no-warn-ignored $FILES >&2; then
  echo "ESLint found problems in modified files - fix them before moving on." >&2
  exit 2
fi
exit 0
```

`chmod +x .codex/hooks/lint-modified.sh`, commit both files.

**Reason:** same as Part 3.3 — deterministic lint feedback on every edit, no AI memory involved — now regardless of which tool is editing. (If the hook doesn't fire, check `codex --version` is current; hooks are a recent Codex addition, and if the relative path fails on your setup, replace it with the absolute path to the script.)

**Verify:** In a Codex session: *"Create scratch.js containing an unused variable, then delete it."* The lint failure output should appear in the transcript after the edit.

### 8.4 Share the skills

Codex implements the same Agent Skills open standard as Claude Code and scans `<repo>/.agents/skills/` for them. Rather than maintaining two copies of `/ship` and `/verify-ui`, point Codex at Claude's directory:

**Instruction:**

```bash
mkdir -p .agents
ln -s ../.claude/skills .agents/skills
git add .agents
git commit -m "chore: share agent skills with Codex via .agents/skills symlink"
```

(A **symlink** is a filesystem shortcut — `.agents/skills` is not a copy, it *is* `.claude/skills` under a second name, so the two tools can never drift.)

In Codex, invoke a skill by mentioning `$ship` / `$verify-ui`, or browse them with `/skills`. The skill files need no changes: `name` and `description` (the only fields Codex requires) are present, Codex ignores the Claude-specific `disable-model-invocation` field, and the ship skill's review step is already tool-aware (Part 3.5 step 4 tells Codex to use its built-in `/review` where Claude uses the subagent).

**Reason:** the skills are the workflow's muscle memory — gate, review, tasks.md checkbox, approval, branch, PR. If Codex ships without them, the discipline exists only when Claude is driving, which is exactly when you don't need the backstop.

**Verify:** Run `codex` in the repo, type `/skills` — `ship` and `verify-ui` are listed. Dry-run `$ship` on a trivial branch change and confirm it stops at the approval step.

### 8.5 The reviewer on Codex

Codex has no user-defined subagents, but it ships two review entry points: `/review` inside a session ("ask Codex to review your working tree") and the non-interactive `codex review` CLI command, which can review uncommitted changes or a branch diff against a base. These are the Codex-side replacements for the code-reviewer subagent — with one caveat: when Codex reviews code Codex just wrote, that's self-review, not independent review. The cross-review rules in 7.6 exist for exactly that reason.

### 8.6 The best combination: who develops, who reviews

Your instinct is right, with one refinement: don't fix the roles to the tools — fix the *pattern*: **whoever wrote the code doesn't get the final review.** Per task:

| Situation | Developer | Reviewer(s) | Merge |
|---|---|---|---|
| Normal (Claude tokens available) | **Claude Code** — full harness: Plan Mode, hooks, /verify-ui, /ship with code-reviewer subagent | **Codex** at PR level, once per story: `codex review --base main` from the feature branch | You |
| Claude rate-limited | **Codex** — same task card, same branch, AGENTS.md + hooks + shared /ship (its step 4 uses Codex `/review` as the inner check) | **Claude Code's code-reviewer subagent** on the PR before merge, once your tokens return: *"Have the code-reviewer agent review the diff of PR #N"* | You |

Rules that make this safe:

1. **One task = one tool.** Never swap tools mid-task; finish the task card or roll the branch back and restart. Half-finished context handoffs between models are the v1 courier problem in disguise.
2. **The gates don't care who's typing.** `npm run verify`, the hooks, CI, and the DoD (including the real-endpoint smoke line for backend tasks) apply identically. This is what actually protects quality — the audit proved that model choice wasn't your risk; unverified process was.
3. **Cross-review is per-task/story and sequential** — a written verdict on a finished diff, folded into one fix pass. It is *not* a live ping-pong between the tools.
4. **You remain the only merger.** Neither tool merges a PR.
5. Claude Code remains the *primary* developer while the harness matures — it has the richer enforcement layer (Plan Mode, per-file hook, permission rules, isolated reviewer). Codex is the relief driver and the second pair of eyes, which is exactly the two-perspective validation that produced your good early code — minus you as the courier.

### 8.7 What doesn't port (know the gaps)

- **Plan Mode** has no Codex equivalent; the AGENTS.md rule "propose a plan and WAIT for explicit approval" plus `approval_policy = "on-request"` approximates it. Hold Codex to it: if it starts editing without an approved plan, stop it and point at AGENTS.md.
- **Per-command allow/deny permissions** (Part 3.2) don't exist in Codex; the sandbox (`workspace-write`) plus approval prompts are the substitute. Force-push protection therefore relies on the AGENTS.md rules and on GitHub itself — consider enabling branch protection for `main` in the repo settings (Settings → Branches → protect `main`), which backstops *both* tools at the server.
- **/rewind** is Claude-specific; on Codex, your checkpoint is git — commit early on the branch, `git checkout .` to abandon.
- **The code-reviewer's six-criteria prompt** lives in the subagent file Codex can't use; when Codex runs `/review`, paste the six criteria from Part 3.4 into the review request the first time you need a thorough pass.

### Dual-tool additions to the migration checklist

- [ ] 8.1 Split instructions: full shared `AGENTS.md` + slim importing `CLAUDE.md` — 10 min
- [ ] 8.2 `.codex/config.toml` (sandbox, approvals, Playwright MCP) — 5 min
- [ ] 8.3 `.codex/hooks.json` + `lint-modified.sh` — 10 min
- [ ] 8.4 `.agents/skills` symlink; verify `/skills` in Codex — 5 min
- [ ] GitHub branch protection on `main` — 5 min
- [ ] Dry run: one trivial task developed in Codex end-to-end ($ship, PR), reviewed by Claude's code-reviewer
