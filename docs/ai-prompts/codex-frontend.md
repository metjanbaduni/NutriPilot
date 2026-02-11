# Codex - Frontend/UI Task Template

Use this template for UI or frontend tasks (components, screens, layout, styling).

You are implementing Task {TASK_ID}: {TASK_NAME} from tasks.md.

CONSTITUTION PATH:
- `.specify/memory/constitution.md`

SCOPE (STRICT - NO EXCEPTIONS):
- Modify ONLY these files:
  - {file1}
  - {file2}
- Do NOT modify any other files.
- Do NOT implement the next task.
- Do NOT refactor unrelated code.

ARCHITECTURE (MANDATORY):
- Follow spec.md and plan.md exactly.
- React 18 + Vite.
- ESM syntax ONLY (import / export).
- AWS Amplify for auth and API access.
- No additional libraries.
- No framework or routing changes.

DESIGN & UI (MANDATORY):
- Match the existing dark theme style from `src/index.css`.
- Reuse existing tokens and classes where possible.
- If new styles are required, add them to:
  - `src/index.css` (global tokens + reusable UI classes), OR
  - `src/styles/{feature}.css` (feature-specific), and import it.
- Provide states: loading, empty, error, and populated (per spec).
- Accessibility: labels on inputs, visible focus, aria for status/errors.
- Keep layout responsive for mobile and desktop.

CONSTITUTION COMPLIANCE (MANDATORY):
Follow .specify/memory/constitution.md strictly:
- All public functions require JSDoc.
- Functions must be <= 50 lines.
- Cyclomatic complexity <= 10.
- Explicit error handling (fail fast).
- Comments explain WHY, not WHAT.
- No TODOs unless explicitly required.

FRONTEND-SPECIFIC RULES:
- Do not hardcode secrets.
- Keep UI logic separate from API/data logic.
- Use existing hooks/clients where available.
- Do not introduce console.log.

TESTING (REQUIRED):
- Add or update tests for this task.
- Follow AAA pattern.
- Cover happy path and error cases.
- Maintain >= 80% coverage.
- Place tests in:
  - tests/{relevant-test-file}
- Run:
  - npm test -- {test-path}

DELIVERABLE CHECKLIST:
- Task {TASK_ID} fully implemented.
- UI matches spec mocks and dark theme.
- Tests pass.
- No scope creep.
- Mark task as [x] in tasks.md.
- Provide a short summary of what was changed and why.

Do NOT explain concepts.
Do NOT suggest improvements outside this task.
