const fs = require('fs');
const path = require('path');

const taskId = process.argv[2];
if (!taskId) {
  console.error('Usage: node scripts/prompts/generate_task_prompt.js T0xx');
  process.exit(1);
}

const tasksPath = path.resolve(__dirname, '..', '..', 'specs', '000-planning-phase', 'tasks.md');
const content = fs.readFileSync(tasksPath, 'utf8');
const lines = content.split(/\r?\n/);
const taskPattern = new RegExp(`^- \\[.\\] ${taskId}\\b`);

const startIndex = lines.findIndex((line) => taskPattern.test(line));
if (startIndex === -1) {
  console.error(`Task ${taskId} not found in ${tasksPath}.`);
  process.exit(1);
}

let endIndex = startIndex + 1;
while (endIndex < lines.length) {
  const line = lines[endIndex];
  if (/^\s*- \[[ xX]\] T\d+/.test(line) || /^##\s|^###\s|^---/.test(line)) {
    break;
  }
  endIndex += 1;
}

const taskBlock = lines.slice(startIndex, endIndex).join('\n');

const prompt = `You are Codex implementing ${taskId} in the NutriPilot repo.

Read first:
- AGENTS.md
- spec.md
- specs/000-planning-phase/plan.md
- .specify/memory/constitution.md
- specs/000-planning-phase/tasks.md (${taskId})

Task scope (verbatim from tasks.md):
${taskBlock}

Instructions:
- Modify only files listed in the task.
- Add/update tests listed in the task.
- Follow UI/theme requirements in tasks.md and docs/ai-prompts/codex-frontend.md when applicable.
- Mark the task complete in tasks.md when done.
- Run the tests listed in the task and report results.

If anything is missing or ambiguous, stop and ask.
`;

process.stdout.write(prompt);
