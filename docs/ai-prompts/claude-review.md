# Claude Review Context

## Purpose
Provide a consistent, high-signal review context so Claude can review tasks quickly without missing project constraints.

## Source of Truth (in order)
1. AGENTS.md
2. spec.md
3. specs/000-planning-phase/plan.md
4. .specify/memory/constitution.md
5. specs/000-planning-phase/tasks.md

## Review Rules
- Only report blocking issues that violate the sources above.
- Do not suggest scope expansion.
- Do not propose optional refactors or stylistic preferences.
- Limit findings to the files explicitly listed in the review prompt.

## Required Output Format
- Overall verdict: APPROVE or REQUEST CHANGES
- If REQUEST CHANGES:
  - Bullet list of concrete issues with file references
- If APPROVE:
  - One-line confirmation only

## Standard Review Checklist
1. Task compliance vs tasks.md
2. Architecture alignment vs spec/plan
3. Constitution compliance (JSDoc, function length/complexity, error handling)
4. Tests (required cases + AAA pattern)
5. Scope strictly respected

## If Files Are Missing
If the review prompt does not list files, request the list before reviewing.
