# NutriPilot Agentic Development Workflow v3

**Version:** 3.6
**Date:** 2026-07-11 (updated 2026-07-13: added the specification flow as Part 2 and dual-harness Codex operation as Part 8 — the Parts now appear in the order you execute them; updated 2026-07-18: added Part 4.0, the PO content flow, guarded by the new `/design-spec-sync` and `/groom` skills; added Part 4.1, the learning loop, run by the new `/retro` skill — the ritual and task-writing rules are now 4.2 and 4.3; updated 2026-07-19: document-sync pass — fixed stale cross-references, synced the Part 7 checklist with the repo, defined the Kickoff-vs-/groom boundary, reordered Part 6 to match the groomed self-contained US3 cards, added housekeeping steps to the /ship spec and the design-screen comparison to /verify-ui; same date, goal-review pass — added the prose-vs-state maintenance rule and compressed the completed steps 0.1/0.2, made the slim importing CLAUDE.md the 3.1 default and retired the monolith, allowed Part 3 in one session with the dry-run as its acceptance test, deferred Part 8 until first rate-limit, corrected the mock-data framing in Part 0 and the Part 7 prompts, and routed the spec.md /api-prefix fix into the 2.2 session; updated 2026-07-24: full-UI MVP scope decision recorded in Part 0, two-track map added at the top, Part 6 rebuilt as parallel design/code tracks with an explicit convergence, two standing sync rules added to Part 4.0, the Story Kickoff specified as the /kickoff skill in new step 3.8, Part 7 checklist extended to match)
**Replaces:** `docs/agentic-workflow-v2.md` (deleted)
**Corrected against:** `docs/audit-2026-07-11.md` (the repo audit; where v2 and the audit conflict, the audit wins)
**Audience:** Product Owner with junior dev skills, using Claude Code + Claude Design

**How to read this document:** every setup step has three parts — **Instruction** (exactly what to do, with ready-to-paste content), **Reason** (why it matters), and **Verify** (how you confirm it worked). Technical terms are defined the first time they appear. All config blocks are complete; nothing says "adjust as needed" without telling you exactly what to adjust.

**The map (added 2026-07-24).** Two tracks run in parallel; steps WITHIN each track are sequential.

```
DESIGN TRACK (spec.md, DESIGN.md, docs/design/) — sequential:
  0. Design-system sync (Manrope font + components)
  1. Export all screens + states → docs/design/screens/
  2. /design-spec-sync, one screen per session
  2b. /groom US3 — after the dashboard screen syncs
  3. Requirement IDs (2.2) — once spec.md stops moving

CODE TRACK (eslint, Amplify, src/) — sequential:
  T048 (lint + CI) → T046 (wire the backend) → T047 (error messages)

CONVERGE — then, in order:
  4. Harness build (one sitting) + dry run
  5. /verify-ui audit of the three shipped screens
  6. /kickoff per new story
  7. Build
```

The convergence dependencies, explicitly: **/verify-ui needs the harness AND the updated design docs** (auditing against the old Sora system would be wasted work); **/kickoff needs requirement IDs AND exported screens**; **building any new story needs T046's wiring pattern**. Part 6 is this same path with reasons attached.

**Maintenance rule (added 2026-07-19):** state lives in the Part 7 checklist and the repo, never in prose. When a step completes or a claim is superseded, replace its prose with a one-line status pointer — full instructions stay only for steps not yet done. Prose that duplicates repo state is where drift comes from.

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
| **Start with mock data** | Mock fixtures power unit tests before real endpoints exist; the groomed US3 cards wire the real endpoint from the start |
| **The 70% problem** | AI gets you 70% fast; the last 30% (integration, security, edge cases) is where the gates below earn their keep |

### Changed by the audit (the two systemic findings)

The audit (`docs/audit-2026-07-11.md`) found the code quality is good — all gates pass — but exposed two system-level failures that v2's harness alone would not have caught:

1. **"Done" ≠ deployed.** The profile Lambdas (T023/T024) are checked off in tasks.md and the source is real and tested — but no task ever existed for registering them with AWS or creating the API route. The deployed API is still boilerplate, and the frontend calls a `/profile` route that doesn't exist. The agent did exactly what it was asked; the *task generation* was the gap.
2. **All green gates were mock-only.** Every acceptance criterion in tasks.md is satisfiable with mocked tests, so a user story can reach "complete" without one real HTTP request ever succeeding.

v3's response, threaded through every part below: **real-endpoint verification enters the Definition of Done, and tasks.md becomes a maintained contract** (checkboxes updated mechanically by `/ship`, backend tasks always carry wiring + smoke verification).

v2 also got ~13 repo facts wrong (paths, commands, spec claims — full table in audit section 5). Every config in this document uses the verified real values, and the hook syntax has been checked against the current official Claude Code documentation (v2's `$CLAUDE_FILE_PATHS` form is outdated; hooks now receive JSON on stdin — explained in Part 3.3).

### Scope decision (2026-07-24): the full UI is the MVP

After reviewing all 23 screens in Claude Design, the PO decided to **ship the full UI as the MVP**, not the narrower scope currently in spec.md. New surfaces entering scope:

- **Weekly Overview** (new screen)
- **Electrolytes + supplements tracking** — dashboard card, Log Meal fields, and the AI analysis schema
- **A landing page**
- **Settings' four states + a view/edit toggle**

The typeface also changed: **Sora → Manrope**.

Consequences: **US5+ become real stories with their own Kickoffs** (this is why the Kickoff is now a skill — Part 3.8), and **remaining backend work expands** — new stored fields, endpoint/schema changes, and weekly aggregation all need Lambdas-and-wiring work beyond what tasks.md holds today. spec.md does not yet reflect any of this; it catches up screen by screen via `/design-spec-sync`, per the Part 6 design track. Until a surface has been synced, spec.md is behind the screens by design — the screens are the newer decision.

---

## Part 1 — Phase 0: Cleanup task zero

This Part is the **CODE TRACK** of the two-track map at the top of this document — it does not gate everything. The entire design track (design-system sync, screen exports, `/design-spec-sync`, requirement IDs) runs in parallel with it; only the convergence steps (harness build, `/verify-ui` audit, Kickoffs, new-story code) wait for this track to finish. See the map rather than re-deriving the order here. Steps 0.1–0.2 are complete (status pointers below). Steps 0.3–0.5 are Claude Code sessions run in this exact order: **T048 first** (so the new lint rules and CI guard the next two fixes), then **T046** (the critical backend blocker), then **T047**.

> **Note on steps 0.3–0.5:** the harness (Part 3) doesn't exist yet, so for these three sessions you run the gates yourself: after Claude finishes, run `npm run verify && npm run build` in your terminal, read the diff (`git diff`), and commit manually with a `type: description` message on a feature branch. This is the last time you'll do it by hand.

### Step 0.1 — Sync tasks.md with reality *(by hand)*

> **Status: ✅ done 2026-07-13** — PR #1 plus follow-up commits. Checked off T026A/T044; added the T046–T048 task cards (they live in tasks.md, which is authoritative — T046 has since been enriched there and is the template card Part 4.3 teaches from); applied the audit 4.3 format fixes (T007 `.jsx`, template DoD → `npm run verify`, the Quality Gate "Independent Test executed" line, removed stale T032/T033 refs). Pattern for future syncs: tasks.md is edited by hand or by `/groom`, gated by `git diff`.

### Step 0.2 — Archive the Codex-era leftovers *(by hand)*

> **Status: ✅ done 2026-07-13** — commit `93b1960`, merged in PR #1. Moved `.codex`, `scripts/prompts`, `docs/ai-assisted-development-workflow.md`, `.github/copilot-instructions.md`, `.github/prompts`, `docs/ai-prompts`, `docs/architecture`, `.specify/templates`, and `.specify/specs` into `docs/archive/`; pruned the two `prompt:*` npm scripts. One deviation, in your favor: `AGENTS.md` was rewritten directly with the **Part 8.1 shared version** (with the pre-T046 "Known state") instead of the short pointer originally specified here — so step 3.1 only needs the slim importing `CLAUDE.md`; AGENTS.md is already in its final shape. Deliberately untouched: `.specify/memory/constitution.md` (quality source of truth) and `docs/manual_testing/` (live test evidence, used by every Demo Gate).

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

> **Stale, compression pending (2026-07-24):** this step is written for the original 3-surface / 4-PNG scope; the full-UI decision (Part 0) supersedes it via design-track steps 1–2 in Part 6. It will be compressed to a status pointer **after** the export commit lands, not before — until then it stays as reference for how a screen session is run.

**Instruction:** For each of the three UI surfaces in spec.md — **Dashboard**, **Log Meal modal**, **Settings** — run one Claude Design conversation:

1. Paste the screen's full section from spec.md (layout sketch, States, Interactions) plus the contents of `docs/design/DESIGN.md`, and say: *"Generate this screen exactly per the spec and design system. Dark mode only. Mobile-first, 390px wide. If the spec is ambiguous or contradicts itself, list the ambiguities instead of inventing."*
2. For the Dashboard, generate **two states**: populated (the spec's layout sketch) and empty ("No meals logged today" + Log First Meal button). States are where screens diverge from specs; one state hides the other's gaps.
3. Save the results as PNG into `docs/design/screens/` — `dashboard.png`, `dashboard-empty.png`, `log-meal-modal.png`, `settings.png`.
4. Keep `docs/design/screens/NOTES.md` open while you work. Every time a screen forces a question the spec doesn't answer — or answers two ways — write one line: what you noticed, and which spec section it touches. **Do not fix anything yet.** The Kickoff (2.3) consumes this list.
5. Commit the folder when done: `git add docs/design/screens && git commit -m "docs: design screens as visual contract per spec"` (do this on `main` after the Phase 0 PR merges, to avoid branch juggling).

Generate Settings too, even though that screen already exists in the app — comparing the generated screen to the running app is a free audit of what shipped.

> **Once the skills exist:** every screen export is followed by `/design-spec-sync <screen>` so the docs catch up with what you approved visually. Part 4.0 is the full per-screen ritual.

**Reason:** the screens are the spec rendered in the only format you can review at a glance, which makes generating them a **requirements review you're qualified to do**. Proof it works: walking the Dashboard mockup against the API contract already exposed a real gap — the spec's Dashboard shows a "Nutritionist Analysis" panel, but the `GET /api/dashboard` response contains no field that could feed it, and no task builds it. You'll hit that exact item in 2.3.

**Verify:** `ls docs/design/screens/` shows the four PNGs plus NOTES.md, and NOTES.md has at least a few lines (if it's empty, you reviewed too fast — the Nutritionist Analysis contradiction alone should be on it).

### 2.2 Step 2 — Number the requirements in spec.md *(one Claude Code session, once)*

**Instruction:** Fresh session, Plan Mode, paste:

> Read spec.md. Add requirement IDs, changing no wording: (1) for each screen section — Dashboard, Log Meal modal, Settings — prefix each item under Layout, States, and Interactions with an ID: DASH-01, DASH-02… / MEAL-01… / SET-01…; (2) give each of the seven API endpoint sections an ID: API-01 through API-07. Then produce a coverage table (in your reply, not in a file): every ID → the tasks.md task(s) that implement it, or "NO TASK". Do not modify tasks.md.

One wording exception rides along in this session (decided 2026-07-19): spec.md's endpoint headings say `/api/profile`, `/api/dashboard`, etc., but the shipped convention — `src/api/*.js` and `contracts/openapi.yaml` — is unprefixed (`/profile`, `/dashboard`, `/meals`). While numbering the seven endpoint sections, correct their paths to the unprefixed shape in the same diff, so the spec matches the deployed path convention.

Review the diff (pure insertions plus the path-prefix corrections), commit: `docs: add requirement IDs to spec.md`. Keep the coverage table from the reply — paste it into `docs/design/screens/NOTES.md` under a "Coverage" heading; the Kickoff will re-derive it, but you'll want to see the two match.

**Reason:** IDs turn "is everything covered?" from an afternoon of cross-reading into a mechanical lookup any agent can do — and they give the change process (2.6) a stable handle: "change DASH-04" is unambiguous forever, "change the progress bars thing" is not.

**Verify:** `grep -c "DASH-" spec.md` returns 8 or more; `git diff --stat` touches only spec.md; every row of the coverage table has either a task ID or "NO TASK" (the NO TASK rows are the point — expect several for the Dashboard).

### 2.3 Step 3 — Story Kickoff *(worked example: US3, the Dashboard)*

This is the step that replaces micromanagement. Before any story starts, one session cross-checks the three altitudes and reports what's missing — **in your language, at story level** — and you make the calls. Ten minutes of your judgment, once per story, instead of watching every diff.

**Instruction:** Fresh session, Plan Mode, paste:

> Story Kickoff for User Story 3 (Dashboard). Read: the Dashboard and GET /api/dashboard sections of spec.md (with requirement IDs); the design screens docs/design/screens/dashboard.png and dashboard-empty.png; docs/design/screens/NOTES.md; the US3 block in specs/000-planning-phase/tasks.md; and the task-writing rules in docs/agentic-workflow-v3.md Part 4.3. Do NOT write any code or edit any file yet. Report, in this order:
> 1. Requirements (by ID) with no covering task.
> 2. Tasks or task clauses with no requirement behind them (scope creep).
> 3. Contradictions — inside spec.md, or between spec.md and the design screens.
> 4. Missing mandatory categories. Every story must contain all six: UI states / frontend logic / backend handler / infrastructure+wiring+deploy / tests / Demo Gate.
> 5. Decisions only I can make — each as a plain-language question with 2–3 options and your recommendation.
> Then propose the corrected US3 task block: full Task Card format (Part 4.3), backend cards shaped like T046, Demo Gate last, new tasks numbered from the next free task ID (verify against tasks.md — T051 as of 2026-07-19; T049 and T050 are taken by backlog items). Wait for my approval before touching tasks.md.

> **US3 status annotation (2026-07-19):** the US3 block was already brought to full self-contained cards by `/groom` (commit `cc902bc`) — T027 is now T046-shaped, carrying its own Amplify registration, route, deploy, and live smoke test, so a run of this Kickoff must not redo the breakdown. For US3, the Kickoff is **reduced to adding what grooming didn't**: (1) the Demo Gate card, (2) the data-seeding task — numbered from the next free ID, which is **T051**, not T049 (T049 = Nutritionist Analysis backlog, T050 = TopNav backlog), and (3) the requirement-ID coverage check (which itself waits on 2.2 — spec.md has no requirement IDs yet). In the answer key below, the wiring-task and self-contained-card items are already resolved by the groom; the Demo Gate, seeding, and coverage items are still open. The screen prerequisite also still applies: `docs/design/screens/` does not exist yet, so 2.1 must run before this Kickoff. This is the general boundary between Kickoff and `/groom` — defined in Part 4.0.

**Reason:** every gap caught here costs one line in a task card; the same gap caught after implementation costs a rework session, and caught after "story complete" it costs an audit. US2 is the proof — its missing wiring task was invisible for months precisely because no step ever compared the three altitudes.

**Verify — grade the report against this answer key.** A good US3 kickoff must surface at least these (all confirmed by inspection on 2026-07-13); if it misses two or more, say *"Re-check the States and Interactions lists against the tasks"*:

- **Nutritionist Analysis panel** (Dashboard layout): no field for it in the API-05 response schema, no task builds it — a spec-internal contradiction *and* a coverage gap.
- **No wiring/deploy task**: T027 (as currently written in tasks.md) creates only the Lambda source — US2's C1 failure about to repeat. The fix is the T046-shaped T027 card from Part 4.3.
- **Meal-card accordion expand** and **pull-to-refresh** (Interactions): in no task.
- **No seeding mechanism**: US3's own Independent Test says "after seeding meals," but nothing can create a meal until US4 — the story as written cannot execute its own test.
- **No Demo Gate**: the Independent Test exists as prose, with no checkbox that forces its execution.
- **Delete-meal from the dashboard** belongs to US4 (T042) — fine, but the US3 Demo Gate must not require it.

**The decisions it should put to you** (recommendations included so you can calibrate its advice): Nutritionist Analysis → defer to Phase 2 (add to spec.md's Out of Scope list; it needs AI work that belongs with US4's OpenAI plumbing) or spec a rule-based version now — deferring is the lean call. Pull-to-refresh → a visible refresh affordance for MVP (pull gestures are native-app territory); one-line spec edit. Seeding → one small dev-only script task (T051 — the next free ID; T049/T050 are taken) so the Independent Test can run before US4 exists.

### 2.4 Step 4 — Approve the corrected story block

**Instruction:** Read the proposed block — at story altitude, not line-by-line. Your checklist, and the only five things you check:

1. All **six mandatory categories** present (UI states / frontend logic / backend handler / infra+wiring+deploy / tests / Demo Gate)?
2. **Demo Gate last**, and does its Acceptance name the Independent Test *and* the screen comparison?
3. Every backend card **T046-shaped** (registration + route + push + live smoke in Acceptance)?
4. Did every **decision you made in 2.3** land in a card or a spec edit — and nothing you rejected sneak in?
5. Is anything there you can't trace to a requirement ID? (If yes, ask why; usually it's scope creep.)

Then approve. The agent applies the block to tasks.md, applies any spec.md edits your decisions require (e.g. moving Nutritionist Analysis to Out of Scope), and commits both in one commit: `docs: US3 kickoff — corrected story block + spec decisions`. The Demo Gate card it writes should look like this (this is the shape to expect, with your real task numbers):

```markdown
- [ ] T052 [US3] Demo Gate: Independent Test + design match
  - Files: `docs/manual_testing/dashboard-insights.md`
  - Notes: run only after every other US3 task is checked; requires the dashboard endpoint
    deployed (T027). Seed meals via the T051 script first.
  - Tests: manual, plus /verify-ui screenshots of /dashboard (populated AND empty states).
  - Acceptance: US3 Independent Test executed against the dev environment and passing;
    /verify-ui screenshots match docs/design/screens/dashboard.png and dashboard-empty.png
    in layout, states, and tokens; evidence (date + screenshots) recorded in the manual test doc.
  - DoD: `npm run verify`; the Product Owner signs off in the manual test doc.
```

**Reason:** this is the altitude contract in action — the agent owns the HOW, you own the WHAT and the LOOKS LIKE, and this checkpoint is where the two meet. The five-point checklist is deliberately short: if approving a story block takes more than ten minutes, the block (or the report) is too noisy — say so.

**Verify:** `git show --stat` for the kickoff commit touches at most spec.md + tasks.md; the US3 block in tasks.md now ends with the Demo Gate; every 2.3 decision is visible in the diff.

### 2.5 Step 5 — Execute the story, then run the Demo Gate

**Instruction:** Prerequisite check first: the harness (Part 3) must be fully set up before the block's first task starts — this is the only step of the specification flow that depends on it. Each task in the approved block then runs through the Part 4 ritual — one task, one session, one branch, `/ship`, PR, merge. Nothing new to learn; the kickoff changed *what's* in the cards, not how they run. Keep the story order from Part 6: the self-contained backend card first (or in parallel with the frontend chain), then the frontend chain per the Dependencies section of tasks.md — there is no fixture-to-API swap step.

When every card except the Demo Gate is checked, run the gate — this is **your** session, ~20 minutes:

1. Seed data (the T051 script), `npm run dev`, sign in.
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

Point (3) is the one that protects you: "this invalidates T031, the Dashboard component you already shipped" is exactly the sentence that must be said *before* you commit to a change, not discovered after. If the screen needs regenerating, that's your 2.1 homework before the change's tasks start — and the regenerated screen then flows through the Part 4.0 ritual (`/design-spec-sync`, then `/groom`) like any other screen change.

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

When US4's Demo Gate is checked, the original spec.md loop is complete end to end — the full-UI MVP (Part 0 scope decision) continues through the US5+ stories, each via its own `/kickoff` — and you'll have run this Part three times (US3, US4, and the change intakes between), which is the point where it's yours.

---

## Part 3 — Harness setup, corrected for this repo

All of 3.1–3.6 plus 3.8 may be created in a single session — every file below is fully specified, so there is nothing to design — and the Part 7 dry-run is the acceptance test for the lot; the per-step Verify lines then become optional spot-checks, not required rituals. (3.7's CI file arrives via T048 on its own track.) After Part 3 is done, you never run gates by hand again.

Vocabulary for this part: **frontmatter** is a small block of `key: value` settings between two `---` lines at the top of a Markdown file — tools read it as configuration; **YAML** is the format those key/value lines are written in; a **matcher** is a pattern that says which events a rule applies to (e.g. "when the Edit or Write tool runs"); **stdin** ("standard input") is the pipe through which one program feeds data into another; a **subagent** is a separate Claude instance with its own context window and its own restricted tool list; a **skill** is a reusable instruction file you invoke as a slash-command (like `/ship`); a **hook** is a script Claude Code runs automatically at lifecycle events — no AI judgment involved.

### Step 3.1 — Create CLAUDE.md

**Instruction:** The shared facts file already exists — step 0.2 shipped `AGENTS.md` in its final Part 8.1 shape (with the pre-T046 "Known state"), so this step is only the slim Claude-side file. Create `CLAUDE.md` at the repo root with exactly this content (`@AGENTS.md` is Claude Code's import syntax — the referenced file's content is loaded as if pasted here):

```markdown
See @AGENTS.md for all project facts, commands, paths, design-system and quality rules,
and the tool-neutral workflow rules. Everything there applies.

## Claude Code-specific workflow
- Always start non-trivial work in Plan Mode; wait for my approval
- After implementing UI, verify visually with /verify-ui before declaring done
- Ship via the /ship skill only — it enforces the gate, review, tasks.md update,
  and the feature-branch + PR flow
```

> **The monolithic single-file CLAUDE.md this step used to specify is retired** (superseded 2026-07-19): its full content lives in Part 8.1's `AGENTS.md` template, which is already committed as `AGENTS.md`. Never maintain two copies of the shared facts — a second copy is exactly the drift this document exists to prevent. The "describe reality, never aspiration" rule now lives with the template in 8.1 (the pre-T046 caveat there).

**Reason:** CLAUDE.md is loaded at every session start and survives context compaction — it's the one instruction layer the agent can't forget. This is *context engineering*: everything you used to retype per prompt lives here once, via the AGENTS.md import. It's lean on purpose: every line costs context in every session.

**Verify:** Start a fresh Claude Code session and ask: *"What command proves the coverage gate passed, and where is the backlog source of truth?"* It should answer `npm run verify` (or `test:coverage`) and `specs/000-planning-phase/tasks.md` without reading other files — that proves the import works.

### Step 3.2 — Permissions in .claude/settings.json

**Instruction:** Create `.claude/settings.json` (create the `.claude/` folder if needed) with this content — the `hooks` section is explained in Step 3.3 but included here so you paste the file once:

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

**Instruction:** The `hooks` block is already in your settings.json from Step 3.2. Now create the script it points at. First check you have `jq` (a small command-line JSON reader the script uses): run `which jq` — if it prints nothing, install it with `brew install jq`.

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
7. Decision consistency — does the change contradict a documented decision? Check spec.md
   "Out of Scope", plan.md architecture choices, constitution.md approved tools / cost
   constraints, and AGENTS.md "Known state". Examples: introducing light mode, adding a paid
   or non-AWS dependency, bypassing the Amplify API client, resurrecting anything from
   docs/archive/. Cite the contradicted decision in the finding.

Output format:
- Verdict: APPROVE or REQUEST CHANGES
- Critical issues (must fix) — each: file, line, problem, concrete fix
- Warnings (should fix) — same format
- One-line note per review area (1–7) confirming what you checked
```

Commit the file.

The frontmatter's `tools: Read, Grep, Glob, Bash` restricts the subagent to inspection tools — it can read files, search, and run git commands, but has no Edit or Write, so it *can't* quietly fix things; it must report. That keeps the generator/reviewer tension honest.

**Reason:** this restores the two-perspective validation you liked about v1 — with the handoff automatic instead of you couriering diffs. Criteria 5 and 6 are new in v3 and exist because of the audit: they are the checks that would have caught "US2 complete but /profile doesn't exist" months earlier.

**Verify:** After any small change, say: *"Have the code-reviewer agent review these changes."* You get a structured verdict with the seven area notes. (If Claude can't find the subagent, restart the session — a brand-new `.claude/agents/` directory is only detected at session start.)

### Step 3.5 — The /ship skill

> #### One-time push setup (prerequisite — once per machine, before the first /ship)
>
> `/ship`'s final step pushes the branch and opens the PR from inside the session. That only works hands-free if `git` and `gh` can authenticate without prompting — and as of 2026-07-13 this machine had neither: the personal SSH key's passphrase was not stored in the Keychain (every push prompted for it), and `gh`'s *active* account was the work one (`metjan-baduni_wcar`), not `metjanbaduni`.
>
> **Instruction:**
> 1. In `~/.ssh/config`, add two lines to the personal host block (leave the work blocks untouched):
>
> ```
> Host github.com-personal
>   HostName github.com
>   User git
>   IdentityFile ~/.ssh/id_ed25519_personal
>   IdentitiesOnly yes
>   AddKeysToAgent yes
>   UseKeychain yes
> ```
>
> 2. Run `ssh-add --apple-use-keychain ~/.ssh/id_ed25519_personal` in your terminal — it asks for the key's passphrase **one last time** and stores it in the macOS Keychain.
> 3. Run `gh auth switch --user metjanbaduni` so PRs are created by (and on) your personal account. Note this switch is machine-wide: if you use `gh` for work elsewhere, switch back there with `gh auth switch --user metjan-baduni_wcar`.
>
> **Reason:** `AddKeysToAgent` loads the key into the ssh-agent on first use; `UseKeychain` reads the passphrase from the macOS Keychain so nothing ever prompts again (including after a reboot). `gh pr create` acts as whichever `gh` account is *active* — with the work account active it fails on (or wrongly authors) PRs in the personal repo, even though the git remote points at the right place.
>
> **Verify:** `ssh-add -l` lists the ed25519 key; `ssh -T git@github.com-personal` greets "Hi metjanbaduni!" with **no passphrase prompt**; `gh auth status` shows `metjanbaduni` as the active account. The next `git push` runs silently.

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
6. Housekeeping — apply each check that fires, in the same commit as the work:
   a. If any file under `.claude/` changed: update `docs/HARNESS.md` to match (its
      maintenance rule — the harness one-pager must never lag the harness).
   b. If the work fixes a pitfall recorded in AGENTS.md "Known state": update or
      remove that entry (a stale pitfall is worse than none).
   c. If the task card carries a `Progress:` line: remove it — the task is done.
   d. If the work completes an item on the docs/agentic-workflow-v3.md Part 7
      checklist: tick it.
7. Show the user: summary of changed files + the tasks.md checkbox change + any
   housekeeping edits from step 6 + a proposed commit message (format:
   `type: description`, then a short bullet list).
8. WAIT for explicit user approval. Do not proceed without it.
9. On approval: `git add` each changed file by explicit path — never `git add .` or
   `git add -A` — commit, and push the current feature branch
   (`git push -u origin <branch>`). Then open a pull request with
   `gh pr create --fill` — or, if a PR already exists for this branch, just push
   (the PR updates automatically). If the push prompts for a passphrase or fails
   with "Permission denied (publickey)", or `gh pr create` fails with a permissions
   error: STOP and tell the user to complete the one-time push setup documented
   at the top of step 3.5. Do not retry or try to work around authentication.
10. Report the PR URL and remind the user to check CI (`gh run watch` or the GitHub
    Actions tab).
```

Commit the file. You invoke it by typing `/ship`. The `disable-model-invocation: true` line means only *you* can trigger it — Claude will never decide to ship on its own.

**Reason:** the whole end-of-task ritual becomes one command, with you as the sole approval gate for what enters the repo (step 8) and for the merge itself (the PR — a **pull request** is GitHub's "proposed change" page where CI runs and you press Merge). Three corrections vs v2: one `verify` command instead of three (audit #2/#3), feature branch + PR instead of pushing main (audit #9 — pushing main directly contradicted both the constitution and your actual practice), and the tasks.md checkbox update is now step 5 of shipping instead of a thing you remember (audit finding: T026A/T044 sat unchecked because remembering doesn't scale).

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
   If docs/design/screens/<screen>.png exists, also compare the screenshot against it —
   layout, states, and tokens; the design screen is a contract, not a bitmap, so no
   pixel-diffing.
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

### Step 3.8 — The /kickoff skill

**Instruction:** Create `.claude/skills/kickoff/SKILL.md` during the same harness sitting as 3.1–3.6. This turns the Story Kickoff (the Part 2.3 worked example) into a repeatable skill — necessary now that the full-UI scope decision (Part 0) makes US5+ real stories, each needing its own Kickoff.

```markdown
---
name: kickoff
description: Story Kickoff — create a NEW story's task block in tasks.md from spec.md and the design screens. Run once per story, before any of its code. /groom maintains existing blocks; /kickoff creates them.
disable-model-invocation: true
---

Story Kickoff for the named story. Read: the story's spec.md sections (with requirement
IDs); its design screens in docs/design/screens/ (every state); docs/design/screens/NOTES.md;
specs/000-planning-phase/tasks.md; and the task-writing rules in
docs/agentic-workflow-v3.md Part 4.3. Do not write code or edit any file until step 5.

1. COVERAGE FIRST: walk the story's requirement IDs and report (a) every ID with no
   covering task, and (b) every proposed task clause with no requirement behind it.
   Coverage drives the breakdown — not the other way around.
2. Propose the story's task block:
   - Full Task Card format (Files / Notes / Tests / Acceptance / DoD), every card
     SELF-CONTAINED: executable by an agent with no other prompt.
   - Every UI card names its four states (loading / empty / error / populated) in
     Acceptance.
   - Every backend card carries the Real Endpoint Rule (Amplify registration + route
     behind the Cognito authorizer + amplify push + live smoke evidence) — the T046 shape.
   - The block ALWAYS ends with a Demo Gate card (Independent Test executed against the
     dev environment + design-screen comparison via /verify-ui).
   - Explicitly include the easy-to-forget plumbing: data seeding for the Independent
     Test; contracts/openapi.yaml updates for any new or changed endpoint; data-model
     additions for any new stored field; and any one-time PO setup (secrets, account
     signup, CLI auth) as a named PRECONDITION on the cards that need it.
3. DECISIONS ONLY THE PO CAN MAKE: list each as a plain-language question with 2–3
   options and a recommendation. Questions are NEVER filled silently — a gap filled
   silently is a product decision made by nobody.
4. Show the full proposed block + the questions list, then WAIT for approval.
5. On approval: apply the block to tasks.md (numbering from the next free task ID —
   verify against tasks.md, never assume) plus any spec.md edits the PO's decisions
   require, in one commit: "docs: <story> kickoff — story block + spec decisions".
```

Commit the file (during the harness sitting, via the dry-run branch or its own `/ship`).

**Reason:** Part 2.3 proved the Kickoff works but ran it as a pasted prompt — fine when US3 and US4 were the only stories left. The full-UI MVP means at least four more Kickoffs, and a skill is how a discipline survives repetition without decaying (same argument as `/ship`: remembering doesn't scale). The plumbing list is the audit's C1 lesson generalized: what never gets its own card never ships — seeding, openapi.yaml, data-model fields, and one-time PO setup are exactly the items history shows get forgotten.

**Verify:** run `/kickoff` for the first new story (after its screens are synced and requirement IDs exist). The proposed block must pass the Part 2.4 five-point checklist without edits, and the questions list must be non-empty for any screen whose spec section is fresh — a silent Kickoff on a new surface means it invented answers.

---

## Part 4 — The per-task ritual and how to write tasks

### 4.0 The PO content flow: screens → specs → tasks → code

**Why this section exists:** everything you build travels down one chain — a **Claude Design screen** becomes lines in **spec.md + DESIGN.md**, which become cards in **tasks.md**, which become **code**. Every arrow in that chain is a *translation step*, and translation is where information gets lost or quietly distorted: a screen shows a panel the spec never mentions, a card promises a state the docs dropped, code implements a card that no longer matches the spec. US2's unwired backend was exactly this — a loss at the docs → cards arrow that nobody was guarding.

So each arrow gets a guard:

| Handoff | Guarded by |
|---|---|
| screen → spec.md + DESIGN.md | `/design-spec-sync` (skill) |
| spec.md + DESIGN.md → tasks.md | `/groom` (skill) |
| tasks.md → code | the per-task ritual (4.2) + the code-reviewer |

**Story Kickoff vs `/groom` — the boundary.** Two different stations touch tasks.md, and they must not blur: **the Story Kickoff creates a story's block, once** — the full breakdown against spec + design screen, the Demo Gate card, the seed/data task, and the requirement-ID coverage check (requirements with no covering task, and vice versa). The Kickoff is now a **skill** — `/kickoff <story>`, specified in Part 3.8; Part 2.3 remains the worked example of what a good Kickoff must surface. **`/groom` maintains an existing block** after spec.md or DESIGN.md change: it re-aligns cards with the current docs and upgrades them to the full card format, but it does not invent the story-level infrastructure a Kickoff owns. First time a story is scheduled: `/kickoff`. Every doc change after: `/design-spec-sync` (if a screen moved), then `/groom`. When the two overlap — a story got groomed before its Kickoff ran, as happened with US3 — the Kickoff shrinks to exactly the pieces grooming doesn't produce (see the US3 annotation in 2.3).

**The per-screen ritual.** Every screen — new or changed — goes through these six steps, in order:

1. **GENERATE** the screen in Claude Design, against the locked design system.
2. **PO APPROVES** visually — you look at the picture and say yes. This is your altitude.
3. **EXPORT** the approved screen into the repo.
4. **`/design-spec-sync <screen>`** — answer its questions — spec.md and DESIGN.md now match the screen.
5. **`/groom <story>`** — the story's task cards now match the docs.
6. **IMPLEMENT** via the per-task ritual (4.2).

**The iron rule: changes flow downstream only, always through the gates.** If you don't like what you see, change the *screen* (step 1) and let the change flow down through sync and groom. Never hand-edit tasks.md to match a screen while the docs are stale — it feels faster, but the next `/groom` run cross-checks cards against the current docs and will revert your edit as drift. Change the screen, sync, groom. Same energy as "requirements decided in chat evaporate" (2.7): a decision that skips a gate isn't recorded anywhere the gates can see.

**The three-way classification.** When `/design-spec-sync` finds the screen and the docs disagreeing, it sorts every discrepancy into exactly one of three bins:

- **Product decision** — screen and docs disagree on WHAT the feature does. Only you can settle this; it comes to you as a question with a recommendation. Example: the screen shows a Nutritionist Analysis panel the API can't feed — defer it or spec it?
- **Doc gap** — the screen shows something the docs simply don't describe yet. The agent drafts the doc update, clearly marked as new, for your approval.
- **Rule violation** — the screen breaks an established design rule (fixed macro colors, dark-only, four states, no icons/emoji). Here the *screen* is wrong, not the rule: you fix it in Claude Design and re-export. Rules never bend to match a screen, because each rule was a decision you already made once — a screen that violates it is a generation glitch, and weakening the rule to accommodate a glitch would silently reopen every screen that decision covers.

**Two standing rules for every `/design-spec-sync` session (added 2026-07-24):**

1. **spec.md records BEHAVIOR, never prototype mechanism.** Claude Design prototypes fake a backend with localStorage so the screens feel alive — that is scaffolding, not product. Nothing about localStorage, client-side persistence, or any other prototype mechanism may ever reach spec.md. The spec says *what the user sees and what the system guarantees*; how the prototype faked it is noise.
2. **Unsourced targets are product decisions, never inventions.** If a screen shows progress against a target that no constitution formula produces (e.g. sodium or potassium targets — the macro formulas don't compute them), that is a **product decision to flag** in the sync's questions list. The agent must never invent a formula, a default target, or a data source to make the screen coherent.

**The control principle.** Every gate produces the same two outputs: a **diff** (what the agent proposes to change) and a **questions list** (what it couldn't decide). You review the diff and answer the questions — you never re-read whole documents to find what moved. And the mirror rule for the agent: anything ambiguous *must* surface as a question. Silent gap-filling is forbidden at every station — a gap filled silently is a product decision made by nobody.

### 4.1 The learning loop: how mistakes become gates

**Why this section exists:** the agent cannot learn. Its brain is frozen — nothing it figures out in a session survives `/clear`. All "learning" in this workflow is lessons written into the files it reads at session start: AGENTS.md, the constitution, the skills, the hooks, the card template. **The files are the memory.** If a mistake taught you something and no file changed, the lesson does not exist — the next session will happily make the same mistake with the same confidence.

The gates you already have catch most mistakes *in-session*: the lint hook catches style and complexity on every edit, the code-reviewer catches constitution and design-system violations before commit, CI catches broken builds, and the real-endpoint smoke test catches "done but not deployed." The gap is everything that *escapes* those gates and gets caught late — by you at a Demo Gate, by a `fix:` commit the week after, by an audit months later. Each of those late catches is evidence that some gate should have fired earlier, or that a gate is missing entirely.

**The loop** closes that gap:

```
implement → gates catch what they can → what escapes is caught late
     ↑                                              │
     │                                              ▼
next session inherits the files ← PO approves ← /retro mines the
                                    /rejects     evidence, drafts lessons
```

`/retro` reads only durable evidence — git history, PR threads, reviewer verdicts, manual-test docs, grooming question lists — because the sessions themselves are gone. It drafts each lesson as a concrete file change, you approve or reject, and approved lessons land in the standing files. That's the whole mechanism.

**The enforcement ladder.** For every proposed lesson, `/retro` must pick the strongest enforcement that fits, in this order: **structural change** (a card-template field or skill step — impossible to skip) → **hook or lint rule** (a script, fires every time) → **reviewer criterion** (checked once per task) → **prose rule** in AGENTS.md or the constitution (depends on the agent reading and honoring it — the weakest). The standing question for every proposal, yours and the agent's alike: *"could this be a check instead of a sentence?"* A sentence costs context in every future session and can be ignored; a check costs nothing until it fires and cannot be.

**Why your approval gate stays.** A system that rewrites its own rules ungoverned has three failure modes: **rule bloat** (every hiccup becomes a paragraph, and the standing orders drown in their own weight), **wrong generalizations** (one bad afternoon becomes a permanent rule against something that wasn't the problem), and **self-grading** (the agent that made the mistake decides what the mistake was). Reviewing retro proposals is governance, not micromanaging — it's the same altitude contract as everywhere else: the agent drafts, you decide. Your four review questions for each proposal:

1. Could this be a **check instead of a sentence**? (If yes, push it up the ladder.)
2. What does this **cost every future session**? (Lines in standing orders are paid on every prompt.)
3. Is this a **real pattern or a one-off**? (One occurrence is an anecdote; the retro must argue the pattern.)
4. What did the retro **miss that I personally tripped over**? (You saw friction the git history can't show — add it.)

**The honest framing:** this loop does not make mistakes impossible; it makes each *kind* of mistake payable once. The first occurrence is tuition. The retro converts it into a gate, and the net tightens with every story — the unwired-backend class of failure can't recur because it became the Real Endpoint Rule; whatever US3 teaches will become a gate the same way. Rare, not impossible.

**When to run:** after each story's quality gate passes — ideally before `/clear`, while the branch and PR are fresh — or immediately after any task that went badly enough that you'd hate to repeat it. `/retro US3` for a story; `/retro T047` for a single painful task. An empty proposal list is a valid outcome: a story that taught nothing new means the gates are working.

### 4.2 The ritual

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

### 4.3 Writing tasks — the rules that prevent the next C1

The audit's root-cause finding: the unwired backend wasn't an agent failure, it was a *task-generation* failure — no task ever said "register and deploy," and every acceptance criterion was satisfiable with mocks. These rules fix the generator (you):

1. **Every task uses the full Task Card format** — Files / Notes / Tests / Acceptance / DoD. The one-line format from Phases 1–3 is retired. A card must be executable by an agent with no other prompt: if you'd have to explain something in chat, it belongs in Notes.
2. **Every backend task carries wiring + real-endpoint smoke verification in Acceptance/DoD.** A Lambda task is not done when the handler file exists and mocked tests pass. It is done when: the function is registered in `backend-config.json`, the route exists behind the Cognito authorizer, `amplify push` succeeded, and a live request returned the expected shape. Put that sentence in the card, every time.
3. **Story gates require the executed Independent Test.** Each user story phase in tasks.md defines an Independent Test — the story is not complete until it has actually been run against the dev environment (it's now a checkbox in the User Story Quality Gate, from step 0.1).
4. **DoD is `npm run verify`** — one command, not a remembered list.
5. **Checkboxes are updated by `/ship` (step 5), never from memory.**
6. **Task cards live inside story blocks, and story blocks are produced by a Story Kickoff** (Part 2.3) — you don't hand-write task lists anymore; the agent proposes the breakdown against spec + design screen, and you approve it at story altitude with the Part 2.4 checklist. Every story block ends with a Demo Gate.

**Worked example — T046 is the template.** Look at its card in tasks.md (Phase 4, US2): Files names the *config* files, not just source; Notes says what "wired" means (authorizer, push) and forces the nutripilotFunction decision; Acceptance demands live 200s and the executed Independent Test; DoD demands recorded smoke evidence. When you write T027 (`getDashboard`), copy this shape:

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

> This example has since been superseded by the real groomed T027 card in tasks.md, which is richer and **authoritative** — read that one, not this. Note also the path convention it uses: routes are unprefixed (`/dashboard`, `/profile`) per `contracts/openapi.yaml` and the shipped `src/api/*` — spec.md's `/api/...` headings are corrected to match in the 2.2 session.

---

## Part 5 — Review layers, including Codex

**Inner loop (automatic, every task):** the code-reviewer subagent, invoked as step 4 of `/ship`. It runs in its own context with read-only tools, reviews against the seven criteria (including the two audit-driven ones), and the main agent fixes what it reports. You never courier anything.

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

**(Rebuilt 2026-07-24 for the full-UI scope decision — Part 0.)** Two tracks run in parallel; steps within each track are sequential. The compact map at the top of this document is this same path without the reasons.

### DESIGN TRACK — spec.md, DESIGN.md, docs/design/; zero code dependency

0. **Design-system sync for the Manrope font change + component updates.** DESIGN.md and the token files catch up with what changed in Claude Design: Sora → Manrope everywhere, plus the component updates the 23-screen review produced. This step also creates **one task card** for the code-side font change (swap the font import/family in the shipped CSS) *and* for fixing the stale "Sora" references in this doc's 3.6 skill text and in AGENTS.md (checked 2026-07-24: AGENTS.md currently has none — the card should verify at execution time rather than assume; DESIGN.md's five Sora references are fixed by this sync itself).
1. **Export all screens and states** to `docs/design/screens/`, commit. All 23 screens, every state — the export is the visual contract; an unexported screen doesn't exist to the workflow.
2. **`/design-spec-sync`, one screen per session**, your Claude Design notes pasted in. Runs under the two standing rules in Part 4.0: behavior-never-mechanism (no localStorage in spec.md) and unsourced-targets-are-product-decisions (e.g. sodium/potassium).
   
   **2b. `/groom US3` — immediately after the dashboard's `/design-spec-sync`.** The groomed US3 cards (commit cc902bc) predate the full-UI decision; the dashboard screen now carries the electrolytes card, so once it syncs, re-groom US3 to re-align its cards with the new docs — before the reduced US3 Kickoff at convergence, not during it.
3. **Requirement IDs (2.2) — once spec.md settles.** Pointless while `/design-spec-sync` is still moving sections. New prefixes for the new surfaces (e.g. WEEK- for Weekly Overview, LAND- for the landing page), and the `/api` heading fix rides along in the same session as before.

### CODE TRACK — eslint, Amplify, src/; parallel with the design track, fully independent

Phase 0 in its existing order: **T048 (lint + CI) → T046 (wire the backend) → T047 (error messages)**. Part 1 is the detail. Nothing in the design track waits for this, and nothing here waits for the design track.

### CONVERGE — both tracks done, then in order

4. **Harness build in one sitting** (Part 3, including the new `/kickoff` skill, 3.8), then the dry-run task from the Part 7 checklist — its acceptance test.
5. **`/verify-ui` audit of the three shipped screens** (login, register, settings) against the **new** design system. Every finding becomes a task card, not an in-session fix — the audit measures the gap; the ritual closes it.
6. **`/kickoff` per new story** — US3's reduced Kickoff (per the 2.3 annotation), then US4, then the US5+ stories the scope decision created.
7. **Build** — the per-task ritual, story by story: backend card first (T046 wiring pattern), frontend chain per the Dependencies section of tasks.md, Demo Gate, outer review, merge. For US3 specifically: T027 is self-contained and `[P]`; T028 → T029 → T031 with T030 anytime before T031; there is no fixture-to-API swap task — don't add one.

The convergence dependencies, explicitly: **/verify-ui needs the harness AND the updated design docs** — auditing shipped screens against the retired Sora system would measure the wrong gap; **/kickoff needs requirement IDs AND exported screens** — coverage-first is meaningless without IDs to cover; **building any new story needs T046's wiring pattern** — every backend card copies it.

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

> **This checklist is the single record of workflow progress; `/ship` ticks items here when work completes them.**

**Done (kept for the record):**

- [x] 0.1 Sync tasks.md: check T026A/T044, paste T046–T048, format fixes — done 2026-07-13 (PR #1)
- [x] 0.2 Archive all dead-workflow files (.codex, scripts/prompts, .github/prompts, docs/ai-prompts, docs/architecture, .specify/templates + specs, old workflow doc), prune `prompt:*` scripts, rewrite AGENTS.md — done 2026-07-13 (commit 93b1960, PR #1)
- [x] 4.0 (partial, ran early) US3 cards groomed to full self-contained format via `/groom` — done 2026-07-18 (commit cc902bc); does **not** replace the US3 Kickoff below
- [x] 4.0 Create `/groom` + `/design-spec-sync` skills (`.claude/skills/groom/`, `.claude/skills/design-spec-sync/`) — done 2026-07-18 (commit 8baa492)
- [x] 4.0 Create `docs/HARNESS.md` (harness one-pager; its maintenance rule feeds /ship housekeeping step 6a) — done 2026-07-18 (commit 8baa492)
- [x] 4.1 Create `/retro` skill (`.claude/skills/retro/`) — done 2026-07-18 (commit 7f04298)

**CODE TRACK (sequential; parallel with the design track):**

- [ ] 0.3 T048: lint rules + delete `.eslintrc.js` + CI — Claude session, manual gate
- [ ] 0.4 T046: backend wiring + live smoke test — Claude session (pair exercise for Amplify CLI)
- [ ] 0.5 T047: error messages — Claude session; open the cleanup PR; merge when CI is green

**DESIGN TRACK (sequential; parallel with the code track):**

- [ ] 6.0 Design-system sync: Manrope + component updates into DESIGN.md/tokens via `/design-spec-sync`; creates the task card for the code-side font change + the stale-Sora fixes (this doc's 3.6; verify AGENTS.md at execution time)
- [ ] 6.1 Export all 23 screens + states → `docs/design/screens/` (+ NOTES.md), commit — screens are already generated in Claude Design (scope decision, Part 0)
- [ ] 6.2 `/design-spec-sync` one screen per session, PO notes pasted in — every screen through the gate, under the two Part 4.0 standing rules
- [ ] 6.2b `/groom US3` after the dashboard's `/design-spec-sync` — re-align the cc902bc cards (electrolytes card, new docs) before the reduced US3 Kickoff
- [ ] 2.2 Requirement IDs added to spec.md + coverage table — one session, only after spec.md settles; new prefixes for the new surfaces (WEEK-, LAND-, …) + the `/api` heading fix

**CONVERGE (both tracks done; in order):**

- [ ] 3.1 Create `CLAUDE.md` — 15 min
- [ ] 3.2 Create `.claude/settings.json` (permissions + hooks block) — 10 min
- [ ] 3.3 Install `jq` if needed; create + chmod `.claude/hooks/lint-changed.sh` — 10 min
- [ ] 3.4 Create `.claude/agents/code-reviewer.md` — 10 min
- [ ] 3.5 Create `.claude/skills/ship/SKILL.md` — 10 min
- [ ] 3.5 prerequisite: one-time push setup (SSH key in Keychain + `gh auth switch` to personal) — 5 min (`gh auth switch` to `metjanbaduni` verified done 2026-07-19; Keychain half unverified)
- [ ] 3.6 Add Playwright MCP; create `.claude/skills/verify-ui/SKILL.md` — 20 min
- [ ] 3.7 Confirm `.github/workflows/ci.yml` exists (from 0.3) and is green
- [ ] 3.8 Create `.claude/skills/kickoff/SKILL.md` — 10 min (same sitting as 3.1–3.6)
- [ ] Dry run: one trivial change through the full ritual (branch → plan → implement → /verify-ui → /ship → CI → merge) — 30 min
- [ ] `/verify-ui` audit of the three shipped screens (login, register, settings) against the new design system — findings become task cards
- [ ] 2.3–2.4 US3 Story Kickoff via `/kickoff`, reduced scope per the 2.3 annotation: Demo Gate card + seeding task (T051) + requirement-ID coverage check, approved and committed
- [ ] `/kickoff` per remaining new story (US4, then the US5+ stories from the full-UI scope decision) — each before its first task
- [ ] First real task: first card of the approved US3 block per the Part 6 order (T027 backend, or T028 if starting the frontend chain)
- [ ] 2.5 US3 Demo Gate executed and signed off — the workflow has now run end to end once

### Reusable prompts

**Start a screen task (Plan Mode):**
> Implement task T0NN from specs/000-planning-phase/tasks.md: the <SCREEN> screen. Follow docs/design/DESIGN.md and docs/design/tokens/*.css, matching the structural patterns of the existing auth and settings screens (but NOT their error-message handling — see CLAUDE.md quality rules). Tests use tests/fixtures/dashboard.js (T031's card fixes its internal inconsistencies); the screen itself consumes its data hook — do not wire the fixture into app code. Give me the simplest viable plan and list anything the design system or spec leaves undefined.

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

> **Status: deferred (2026-07-19).** Set this up the day you first hit a rate limit mid-story — nothing here blocks anything else, and unexercised machinery is where drift breeds. Two exceptions already live: 8.1's shared `AGENTS.md` shipped in step 0.2, and the slim importing `CLAUDE.md` is step 3.1's job. The Codex-side pieces (8.2–8.5 and the dual-tool checklist below) wait.

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
| Standing instructions | `AGENTS.md` (shared) + `CLAUDE.md` (Claude extras) | both — see 8.1 |
| Lint-on-edit hook | `.claude/` (Claude) + `.codex/` (Codex) | per-tool twin — see 8.3 |
| Skills (/ship, /verify-ui) | `.claude/skills/`, shared via symlink | both — see 8.4 |
| Reviewer | code-reviewer subagent (Claude) / built-in `/review` (Codex) | per-tool — see 8.5 |

The deterministic gates being tool-agnostic is the whole point: whichever model types the code, the same scripts, CI, and DoD decide whether it ships.

### 8.1 One instruction file for both tools

**Instruction:** The standing instructions are two files: the shared `AGENTS.md` below (already shipped in step 0.2, superseding the short pointer that step originally specified) and the slim importing `CLAUDE.md` (created in step 3.1). This section holds the authoritative template for both.

`AGENTS.md` (repo root) — the shared file both tools read:

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

> **Pre-T046 caveat (template vs reality):** the "Known state" block above is the *post-T046* target. Until T046 and T048 ship, the section must instead carry the pre-T046 reality — deployed API is the boilerplate echo (`/api` → nutripilotFunction), getProfile/updateProfile are NOT registered, `/profile` is not a real route, and no CI exists — which is exactly what the committed `AGENTS.md` says today. Swap to the block above only when T046/T048 land. Standing instructions describe reality, never aspiration.

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

Commit both (`AGENTS.md` already is; `CLAUDE.md` lands with step 3.1).

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

Codex has no user-defined subagents, but it ships two review entry points: `/review` inside a session ("ask Codex to review your working tree") and the non-interactive `codex review` CLI command, which can review uncommitted changes or a branch diff against a base. These are the Codex-side replacements for the code-reviewer subagent — with one caveat: when Codex reviews code Codex just wrote, that's self-review, not independent review. The cross-review rules in 8.6 exist for exactly that reason.

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
- **The code-reviewer's seven-criteria prompt** lives in the subagent file Codex can't use; when Codex runs `/review`, paste the seven criteria from Part 3.4 into the review request the first time you need a thorough pass.

### Dual-tool additions to the migration checklist

- [ ] 8.1 Split instructions: full shared `AGENTS.md` + slim importing `CLAUDE.md` — 10 min
- [ ] 8.2 `.codex/config.toml` (sandbox, approvals, Playwright MCP) — 5 min
- [ ] 8.3 `.codex/hooks.json` + `lint-modified.sh` — 10 min
- [ ] 8.4 `.agents/skills` symlink; verify `/skills` in Codex — 5 min
- [ ] GitHub branch protection on `main` — 5 min
- [ ] Dry run: one trivial task developed in Codex end-to-end ($ship, PR), reviewed by Claude's code-reviewer
