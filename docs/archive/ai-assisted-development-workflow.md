# AI-Assisted Development Workflow (Spec-Kit + Codex + Claude)

## Purpose
This document explains the AI-assisted development workflow used in the NutriPilot project so far. The approach is based on specification-driven development (spec-kit), with Codex as the implementation agent and Claude as the review agent, orchestrated by the product owner.

The main objective is to keep delivery fast without losing control over scope, quality, and architecture.

## 1) Starting Point: Spec-Kit as the Source of Execution
Work starts from spec-kit artifacts, not from ad-hoc coding prompts.

Core inputs:
- `spec.md` for product behavior and UX expectations
- `specs/000-planning-phase/plan.md` for architecture and implementation direction
- `specs/000-planning-phase/tasks.md` for executable units of work
- `.specify/memory/constitution.md` for coding standards and constraints
- `AGENTS.md` for repository-specific operating rules

Working principle:
- Spec and plan define what must be built.
- Tasks define how work is sequenced.
- Constitution and AGENTS define quality and execution constraints.
- AI output is valid only when it aligns with all of the above.

This structure prevents "agent improvisation" and keeps implementation tied to explicit requirements.

## 2) Role Split: Implementation vs Review
The workflow uses two AI roles with explicit boundaries:

- Codex (developer role):
  - Implements one task at a time.
  - Works in strict task scope.
  - Runs required tests and local gates.
  - Updates task status in `tasks.md` when complete.

- Claude (review role):
  - Reviews only changed files for that task.
  - Reports only blocking issues against governing docs.
  - Uses a blocking-only policy to avoid style-only churn.

This separation creates useful tension: one agent builds quickly, one agent checks compliance.

## 3) Execution Unit: Task-Driven Loop
The core loop is task-level and repeatable:

1. Select the next task from `tasks.md`.
2. Generate Codex prompt from task definition:
   - `npm run prompt:task -- T0xx`
3. Codex implements task in scope and runs listed tests.
4. Generate Claude review prompt:
   - `npm run prompt:review -- T0xx`
5. Claude returns `APPROVE` or `REQUEST CHANGES`.
6. If changes are requested, feed only blocking points back to Codex.
7. Re-run task tests and quality checks.
8. Mark task complete.

This loop is now supported by prompt generators:
- `scripts/prompts/generate_task_prompt.js`
- `scripts/prompts/generate_review_prompt.js`

And standardized review context:
- `docs/ai-prompts/claude-review.md`

## 4) Prompt Governance and Context Management
A key improvement was reducing free-form prompting.

Rules now used:
- Task prompts are generated from `tasks.md` instead of written from scratch.
- Review prompts enforce:
  - file list boundaries
  - blocking-only findings
  - mandatory response format
- "Source-of-truth order" is explicit:
  - `AGENTS.md -> spec.md -> plan.md -> constitution -> tasks.md`

Benefits:
- Less manual prompt writing.
- Less context drift between sessions.
- More consistent review quality.

## 5) Governance Files Explained (`AGENTS.md -> spec.md -> plan.md -> constitution -> tasks.md`)
This is the practical meaning of each file in the working order used by the team.

- `AGENTS.md`
  - Repository operating manual for AI agents.
  - Defines execution rules: scope discipline, test/lint/format expectations, workflow quality standards, review acceptance policy, and command conventions.
  - We added reusable workflow rules here after US2, such as "task is complete only when tests + lint + format pass" and "each story needs manual + architecture docs."

- `spec.md`
  - Product contract (what the product should do).
  - Defines user-facing behavior, routes, API intent, UX outcomes, and success criteria.
  - Used to decide whether an implementation is behaviorally correct from a product perspective.

- `specs/000-planning-phase/plan.md`
  - Technical implementation strategy (how to build `spec.md`).
  - Captures architecture, layering, technology choices, and boundaries between frontend/backend responsibilities.
  - Used when multiple implementation options exist and one must align with architecture.

- `.specify/memory/constitution.md`
  - Engineering quality constitution.
  - Defines mandatory coding constraints (for example JSDoc expectations, function length/complexity limits, explicit error handling, testing quality standards).
  - Used as the quality bar during implementation and review.

- `specs/000-planning-phase/tasks.md`
  - Execution contract (what gets built next, in what order, with what acceptance).
  - Defines task scope, files, acceptance criteria, tests, and DoD for each task.
  - We evolved this file from split implementation/tests into self-contained task cards for smoother delivery.

How they work together:
- `spec.md` and `plan.md` define destination and architecture.
- `constitution.md` defines minimum engineering quality.
- `tasks.md` turns all of that into executable steps.
- `AGENTS.md` enforces operating behavior for the AI agents while executing those steps.

## 6) Quality Gates (Task and Story Level)
Quality is enforced in two layers:

### Task-level Done Criteria
A task is complete only when:
- listed tests pass
- `npm run lint` passes
- `npm run format:check` passes

### Story-level Gate
Before moving to next user story:
- all story tasks are checked complete
- `npm test` passes
- `npm run test:coverage` passes with >=80% global
- `npm run lint` passes
- `npm run format:check` passes
- manual test checklist is executed

These checks reduce hidden regressions and prevent "mostly done" transitions.

## 7) Documentation as Part of Delivery
Each user story is now expected to ship with two operational docs:

- Manual test guide:
  - `docs/manual_testing/<story>.md`
  - Example: `docs/manual_testing/profile-onboarding.md`

- Architecture and troubleshooting guide:
  - `docs/architecture/<story>.md`
  - Example: `docs/architecture/us2-profile-onboarding.md`

This moves knowledge from chat history into reusable project docs.

## 8) What Changed After US2 (Key Retrospective)
US2 exposed process gaps:
- implementation and tests were sometimes split into separate follow-up tasks
- frontend adaptation to theme happened late
- repeated prompt writing created overhead and mistakes
- runtime mismatches (Amplify v6 module changes, route placeholders, auth event name changes) were detected late in manual testing

Improvements applied:
- US3 tasks were rewritten as self-contained task cards:
  - implementation + tests + acceptance + DoD in one place
- prompt generation scripts were added
- review context was centralized
- workflow standards were strengthened in `AGENTS.md`

Net effect:
- less orchestration overhead
- fewer "afterthought" fixes
- clearer handoff between implement and review cycles

## 9) Practical Runbook (How a Typical Day Works)
Typical execution pattern:

1. Pick next task ID from `tasks.md`.
2. Generate and run Codex prompt:
   - `npm run prompt:task -- T0xx`
3. Apply fixes from Codex run, ensure required tests are executed.
4. Generate and run Claude review prompt:
   - `npm run prompt:review -- T0xx`
5. Address blocking review findings only.
6. Re-run tests and gates.
7. Mark task done in `tasks.md`.
8. At story boundary, execute full story-level gate and manual test checklist.

Recommended sequencing:
- one implementation session per user story
- one orchestration/review session for prompting and control

This keeps context focused and reduces collision between parallel sessions.

## 10) Why This Workflow Works
This approach scales because it treats AI as deterministic operators within a controlled system:

- specification first
- task contracts second
- implementation/review role split
- explicit quality gates
- documented troubleshooting

It is not "chat-driven coding"; it is guided, testable delivery with AI acceleration.

## 11) Current Limitations
Known constraints:
- still requires disciplined task writing
- still requires human orchestration at story boundaries
- manual test execution remains essential for route/auth/integration behavior

Next maturity step would be automating more of the orchestration (for example, scripted task status checks and automated review packet generation from git diff).
