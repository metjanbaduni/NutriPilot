# AI Prompt System – Foundation Phase

## Purpose

This directory contains **authoritative prompt templates** used to control how AI agents (Codex and Claude) operate on this repository.

These prompts are **not optional guidance**. They are part of the delivery system.

The goal is to:
- Prevent scope creep
- Enforce architecture and constitution standards
- Make AI behavior predictable and repeatable
- Scale AI-assisted development without losing control

---

## How This Fits Into the Master Guide

- Master Guide → philosophy, governance, quality gates
- spec.md / plan.md / .specify/memory/constitution.md → source of truth
- tasks.md → execution contract
- docs/ai-prompts/ → enforcement layer

If there is a conflict:
1. spec.md and plan.md win
2. .specify/memory/constitution.md wins
3. tasks.md wins
4. These prompts win
5. AI agent output loses

---

## When to Use These Prompts

You use **one Codex task prompt** to implement a task.  
You use **one Claude review prompt** to review that task.

Never free-form a prompt for foundational work.

## Prompt Generation (Recommended)

Use the helper scripts to generate consistent prompts from `tasks.md`:
- `node scripts/prompts/generate_task_prompt.js T0xx`
- `node scripts/prompts/generate_review_prompt.js T0xx`

Claude review context:
- `docs/ai-prompts/claude-review.md`

### Usage Examples

Generate a Codex implementation prompt:
```
npm run prompt:task -- T031
```

Generate a Claude review prompt:
```
npm run prompt:review -- T031
```

Tip: Replace `T031` with the task ID you want to run next.

---

## Phase 2 (Foundation) – Locked Scope

The following tasks are architecturally sensitive and MUST use the Foundation templates:

| Task | Description | Template |
|----|----|----|
| T007 | React entry + Amplify init | Codex – Foundation |
| T008 | App shell + routes | Codex – Foundation |
| T009 | SessionContext | Codex – Foundation |
| T010 | API client | Codex – Foundation |
| T011 | Dynamo client (backend lib) | Codex – Foundation |
| T012 | Test harness | Codex – Foundation |

No substitutions. No shortcuts.

---

## Non-Goals

These prompts are NOT meant to:
- Replace spec.md
- Teach programming
- Explore alternatives
- Improve code style beyond .specify/memory/constitution.md

They exist to **control execution**, not creativity.
