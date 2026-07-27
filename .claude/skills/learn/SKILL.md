---
name: learn
description: Generate a human-facing learning document after a substantial task - explains AWS/architecture concepts, tradeoffs, and debugging methodology for the PO's own understanding. NEVER referenced by AGENTS.md, CLAUDE.md, or tasks.md - for human learning only, not agent context.
argument-hint: [task-id]
disable-model-invocation: true
---

Generate a learning document for: $ARGUMENTS

Output ONLY to docs/learning/<task-id>-<short-slug>.html - a single self-contained
HTML file. Never modify code, AGENTS.md, CLAUDE.md, or tasks.md. Never add a
reference to this folder from any of those files.

1. Gather evidence: the task's ADR in docs/decisions/ if one exists, the relevant
   git commits, the manual test doc, and the task's card in tasks.md. (If a /retro
   was run on this task, its evidence-gathering already covered this ground -
   reuse it rather than re-deriving.) Also read every existing file already in
   docs/learning/ - match their structure, depth, and voice; don't reinvent the
   format each time.

2. Write for a Product Owner learning AWS/software architecture hands-on, not for
   an engineer skimming a changelog. docs/learning/t046-profile-api-aws-tour.html
   is the reference example - match its depth, tone, and structure closely.
   Required sections, in this order:
   - Masthead: title + a short standfirst + a facts strip (task ID, date, key
     identifiers touched) - same visual pattern as the reference file
   - The concept, plainly - what AWS service/pattern was involved, explained from
     first principles, no assumed prior knowledge
   - What we were trying to do - one-paragraph plain-English goal
   - How it actually works - a console-tour walkthrough of each real resource
     touched (numbered steps with a console path, like the reference file's
     step-num pattern), with a short "why this exists as a separate service"
     paragraph per major piece - the design philosophy, not just the mechanics
   - A status-code / outcome table if the task involved an API or multi-layered
     system - map each observable outcome to the exact layer that produced it,
     same table style as the reference
   - What broke and why it wasn't obvious - each real gotcha as: what you'd
     naturally assume -> why that's wrong -> what's actually true
   - "The road not taken" - if a real architectural alternative existed, give it
     its own full section like the reference file's proxy-vs-non-proxy section:
     what the other branch looks like, a real trade-off table across multiple
     dimensions, why the chosen path was still right HERE specifically (not
     universally), and - if a guardrail was traded from config into code/
     discipline - a "what replaces the guardrail you gave up" callout naming
     exactly what now stands in for it (a test, a lint rule, a review step)
   - Two safe, hands-on <details>/<summary> experiments the PO can actually run
     against the real deployed thing
   - What transfers to any AWS project - a short bullet list of principles that
     generalize beyond this specific task
   - A footer noting what was verified and against what, plus a pointer to the
     relevant ADR

3. Match the reference file's HTML/CSS structure exactly - the CSS custom
   properties, dark-mode-aware color scheme, serif headings, note/pass/warn
   callout boxes, .step-num walkthrough pattern, .fact strip. Reuse that file's
   <style> block as the base rather than inventing new styling per document, so
   every entry in docs/learning/ looks and feels consistent.

4. Simpler language throughout than the source material (ADR/commits are written
   for agents and are terse by design) - this document exists specifically
   because that terseness doesn't teach.

Show the PO the file path when done. This is optional, PO-invoked only - never
run automatically by /ship, /retro, or any other skill.

<!-- Maintainer note (2026-07-27, deferred): step 3 makes every run re-read the
     reference file's large <style> block. Once a SECOND document exists in
     docs/learning/, extract the shared CSS into a docs/learning/_template.html
     skeleton the skill copies from - not a <link>, since these files must stay
     openable from disk. Not worth doing with one document. -->

