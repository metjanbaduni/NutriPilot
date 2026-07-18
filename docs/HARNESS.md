# The AI harness — one-page reference

> **Maintenance rule: any session that adds or changes a skill, hook, or subagent must update this file in the same commit.**

This page inventories what is actually installed in `.claude/` right now, and where each piece fires during normal work. Jargon, one line each: a **skill** is a reusable instruction file you trigger by typing a slash-command (like `/groom`); a **subagent** is a separate AI worker with its own context and a restricted tool list; a **hook** is a script the tool runs automatically at fixed moments — no AI judgment involved.

**Status note (2026-07-18):** `.claude/` currently contains the two skills below and nothing else. The rest of the harness planned in `docs/agentic-workflow-v3.md` Part 3 — settings/permissions, the lint hook, the code-reviewer subagent, `/ship`, `/verify-ui` — is **not installed yet**. Items below are marked *installed* or *planned* accordingly; when a planned item lands, update its entry here (see the maintenance rule).

## Skills (installed)

### /groom — `.claude/skills/groom/SKILL.md`
- **Purpose:** brings a story's task cards in `specs/000-planning-phase/tasks.md` up to the full Task Card format and in line with the current spec.md and DESIGN.md.
- **When:** before starting any story, or whenever spec.md / DESIGN.md changed (run `/design-spec-sync` first if the change came from a screen).
- **Command:** `/groom US4` (or any scope, e.g. `/groom the dashboard story`).
- **Approval gates:** it only ever touches tasks.md, never code; it shows you the full diff plus a "Questions for the PO" list and **waits for your approval before applying**; the applied change ships through `/ship` like any commit.

### /design-spec-sync — `.claude/skills/design-spec-sync/SKILL.md`
- **Purpose:** reconciles spec.md and `docs/design/DESIGN.md` (plus token files) with a newly exported or changed Claude Design screen.
- **When:** after every screen export, before grooming or implementing that screen's story.
- **Command:** `/design-spec-sync dashboard`.
- **Approval gates:** it only touches spec.md, DESIGN.md, and `docs/design/tokens/*` — never tasks.md or code; every discrepancy is classified (product decision → question for you; doc gap → drafted update; rule violation → screen goes back to Claude Design) and **product decisions always wait for your answer**; doc changes ship through `/ship`.

## Subagents

- **None installed.** Planned: **code-reviewer** (`.claude/agents/code-reviewer.md`, workflow-v3 Part 3.4) — a read-only reviewer (tools: Read, Grep, Glob, Bash) invoked automatically as step 4 of `/ship`, reviewing every diff against seven criteria (correctness, security, constitution, design system, tasks.md discipline, backend reality, decision consistency).

## Hooks and settings

- **None installed.** Planned (workflow-v3 Part 3.2–3.3): `.claude/settings.json` with pre-approved safe commands and hard denies (force-push, `rm -rf`, reading `.env`), and a **lint-on-edit hook** — after every file Claude edits or writes, a script runs ESLint on that file and feeds errors straight back so they're fixed immediately.

## Typical task walkthrough (per-task ritual, workflow-v3 Part 4.1)

1. **Plan** — you paste the task prompt in Plan Mode; nothing fires yet.
2. **Implement** — Claude edits files. *Planned:* the lint hook fires on every edit.
3. **`/verify-ui`** *(planned skill, Part 3.6)* — Claude opens the screen in a real browser, screenshots it, and checks it against DESIGN.md.
4. **`/ship`** *(planned skill, Part 3.5)* — runs the quality gate and build, *planned:* delegates to the code-reviewer subagent, updates the tasks.md checkbox, then **stops for your approval** before committing, pushing, and opening the PR.
5. **CI** *(planned, Part 3.7 / T048)* — GitHub re-runs `npm run verify && npm run build` on the pushed branch; you merge when green.
6. **`/clear`** — next task starts with a fresh context.

Until the planned pieces land, you run the gates by hand: `npm run verify && npm run build`, read the diff, commit on a branch.

## Typical screen walkthrough (PO content flow, workflow-v3 Part 4.0)

1. **Generate** the screen in Claude Design against the locked design system.
2. **You approve** it visually.
3. **Export** it into the repo.
4. **`/design-spec-sync <screen>`** — answer its questions; the docs now match the screen.
5. **`/groom <story>`** — the task cards now match the docs.
6. **Implement** via the per-task ritual above.

Iron rule: changes flow downstream only, always through these gates — never hand-edit tasks.md to match a screen while the docs are stale. Full section: `docs/agentic-workflow-v3.md` Part 4.0.
