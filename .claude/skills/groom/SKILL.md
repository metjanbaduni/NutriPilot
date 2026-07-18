---
name: groom
description: Groom tasks.md for a user story or after a spec/design change. Use before starting any story, or whenever spec.md / DESIGN.md have changed (run design-spec-sync first if the change came from a screen).
argument-hint: [story-or-scope]
---

Groom specs/000-planning-phase/tasks.md for: $ARGUMENTS
Only tasks.md may be modified. Never touch code in a grooming session.

1. Read spec.md, docs/design/DESIGN.md, .specify/memory/constitution.md, AGENTS.md,
   and the target story's section in tasks.md.
2. Convert every task in scope to the full Task Card format. Each card must have:
   - Files: real paths (verify they exist or are clearly new)
   - UI cards: all four states (loading/error/empty/populated) in Acceptance
   - Backend cards: Real Endpoint Rule in Acceptance + smoke evidence in DoD
   - Acceptance: only yes/no-verifiable statements
   - DoD: `npm run verify` (plus story-specific evidence)
3. Cross-check cards against the CURRENT spec.md and DESIGN.md — if the docs changed
   since a card was written, update the card to match the docs, and list each such
   change explicitly as "drift fixed: <what changed>".
4. Cards must be self-contained: state decisions directly, never reference
   conversations or question numbers.
5. If anything requires a guess, add it to a "Questions for the PO" list —
   never fill gaps silently.
6. Output the full diff + questions. Wait for approval before applying.
   Ship via /ship (tasks.md changes are commits like any other).
