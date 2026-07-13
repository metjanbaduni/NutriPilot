# Claude – Foundation Review Template (T007–T012)

Use this template to review **FOUNDATION tasks only**.

You are reviewing Task {TASK_ID}: {TASK_NAME}.

FILES TO REVIEW (ONLY THESE):
- {file1}
- {file2}

DO NOT:
- Review files not listed
- Suggest new features
- Propose refactors outside this task

REVIEW CHECKLIST:

1. TASK COMPLIANCE
- Does the implementation fully satisfy tasks.md for {TASK_ID}?
- Is scope strictly respected?

2. ARCHITECTURE ALIGNMENT
- Matches spec.md and plan.md?
- Correct Amplify initialization pattern?
- No cross-layer responsibility leaks?

3. CONSTITUTION COMPLIANCE
- Functions ≤ 50 lines
- JSDoc present where required
- Explicit error handling
- No magic values
- Naming conventions respected

4. BUGS & EDGE CASES
- Lifecycle or async bugs?
- Missing error paths?
- React effect safety (deps, cleanup)?

5. TESTING
- Tests exist where required?
- AAA pattern followed?
- Edge cases covered?
- Coverage likely ≥ 80%?

REVIEW ACCEPTANCE (BLOCKING-ONLY):
- Only report issues that violate AGENTS.md (spec/plan/constitution/tasks/tests).
- Ignore stylistic preferences or scope-expanding suggestions.

RESPONSE FORMAT (MANDATORY):
- Overall verdict: APPROVE or REQUEST CHANGES
- If REQUEST CHANGES:
  - Bullet list of concrete issues with file references
- If APPROVE:
  - One-line confirmation only

Be strict. Be concise. No teaching.
