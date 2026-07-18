---
name: design-spec-sync
description: Reconcile spec.md and DESIGN.md with a newly generated or changed Claude Design screen. Use after every screen export, before grooming or implementing that screen's story.
argument-hint: [screen-name]
---

Reconcile the docs with the screen: $ARGUMENTS
Only spec.md, docs/design/DESIGN.md, and docs/design/tokens/* may be modified.
Never touch tasks.md or code in this session.

1. Read the exported screen files/assets the PO points you to, plus the current
   spec.md section for that screen and DESIGN.md.
2. Build a DISCREPANCY LIST — every place the screen and the docs disagree:
   - Elements on the screen that spec.md never mentions
   - Elements spec.md promises that the screen doesn't show
   - New components, states, or tokens not in DESIGN.md
   - Anything on the screen that contradicts an established rule (fixed macro
     colors, dark-only, four-states, no icons/emoji)
3. Classify each discrepancy and act accordingly:
   - PRODUCT DECISION (screen and docs disagree on WHAT the feature does):
     never resolve yourself — put it in "Questions for the PO" with a
     recommendation, and wait.
   - DOC GAP (screen shows something the docs don't describe yet): draft the
     doc update, clearly marked as new.
   - RULE VIOLATION (screen breaks an established design rule): flag it — the
     SCREEN is wrong, not the rule; the PO fixes it in Claude Design and
     re-exports. Never weaken a rule to match a screen.
4. After the PO answers: apply the approved doc updates. Report as a change list
   ("spec.md §Dashboard: added X; DESIGN.md: new component Y").
5. Remind the PO of the next step: run /groom for the affected story so the
   cards catch up with the docs. Ship doc changes via /ship.
