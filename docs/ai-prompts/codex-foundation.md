# Codex – Foundation Task Template (T007–T012)

Use this template for **FOUNDATION tasks only**

You are implementing Task {TASK_ID}: {TASK_NAME} from tasks.md.

SCOPE (STRICT – NO EXCEPTIONS):
- Modify ONLY these files:
  - {file1}
  - {file2}
- Do NOT modify any other files.
- Do NOT implement the next task.
- Do NOT refactor unrelated code.

ARCHITECTURE (MANDATORY):
- Follow spec.md and plan.md exactly
- React 18 + Vite
- ESM syntax ONLY (import / export)
- AWS Amplify for auth and API access
- No additional libraries
- No framework or routing changes

CONSTITUTION COMPLIANCE (MANDATORY):
Follow constitution.md strictly:
- All public functions require JSDoc
- Functions must be ≤ 50 lines
- Cyclomatic complexity ≤ 10
- Explicit error handling (fail fast)
- Clear comments explaining WHY, not WHAT
- No TODOs unless explicitly required

FOUNDATION-SPECIFIC RULES:
- Initialize Amplify exactly once
- No side effects at module scope unless explicitly required
- No business logic in UI or context layers
- Keep responsibilities narrow and explicit

TESTING (REQUIRED):
- Add or update tests for this task
- Follow AAA pattern
- Cover happy path and error cases
- Maintain ≥ 80% coverage
- Place tests in:
  - tests/{relevant-test-file}

DELIVERABLE CHECKLIST:
- Task {TASK_ID} fully implemented
- Code compiles
- Tests pass
- No scope creep
- Mark task as [x] in tasks.md
- Provide a short summary of what was changed and why

Do NOT explain concepts.
Do NOT suggest improvements outside this task.