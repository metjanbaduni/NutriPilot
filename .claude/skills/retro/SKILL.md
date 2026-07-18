---
name: retro
description: End-of-story retrospective. Mine the story's history for lessons and propose durable harness updates. Run after a story's quality gate passes, or after any task that went wrong.
argument-hint: [story-or-task]
---

Retrospective for: $ARGUMENTS
Read-only analysis first; you may only modify files the PO approves in step 5.
The retro validates the SYSTEM, not the code — code issues are already fixed by
now; your job is finding which gate should have caught them earlier.

1. GATHER EVIDENCE (durable sources only — past sessions are gone):
   - git log + diffs for the story's commits and PR review threads
   - code-reviewer verdicts: which findings appeared, which recurred across tasks
   - fix-after-ship commits (a "fix:" commit touching a just-shipped file means
     a gate missed something)
   - docs/manual_testing/ evidence vs. what the task cards promised
   - the "Questions for the PO" lists from grooming: which answers turned out
     wrong or incomplete during implementation

2. FIND LESSON CANDIDATES. A candidate is a mistake or friction that a standing
   order, gate, or template change could have prevented. Classify each:
   - AGENT ASSUMED: a gap in docs/cards allowed a guess → doc or card-template fix
   - RULE MISSING: nothing forbade a bad pattern → propose the smallest rule
   - RULE IGNORED: a rule existed but wasn't followed → propose a reviewer
     criterion or hook, NOT another rule restating the first
   - GATE TOO LATE: caught at review/smoke when a hook or lint could have caught
     it → propose the earlier check
   - PROCESS FRICTION: a skill step that was skipped, unclear, or wasteful →
     propose the skill edit

3. FOR EACH CANDIDATE, CLIMB THE ENFORCEMENT LADDER before proposing. Strongest
   to weakest: structural change (card template / skill step) → hook or lint
   rule → reviewer criterion → prose rule in AGENTS.md/constitution. Propose the
   strongest enforcement that fits. If you propose prose, justify explicitly why
   nothing stronger works.

4. PRESENT a numbered proposal list. For each: classification, target file,
   exact text, ladder level chosen + why, and the context cost (lines added to
   standing orders). Then two closing sections:
   - "Considered and rejected": candidates dismissed as one-offs or already
     machine-caught, with one-line reasoning each.
   - "Totals": total lines added across all proposals if fully approved.
   An empty proposal list is a valid, good outcome — never manufacture lessons.

5. Apply ONLY what the PO approves. Update docs/HARNESS.md if any skill changed.
   Ship via /ship.
