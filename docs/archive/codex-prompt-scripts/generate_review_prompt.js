const fs = require('fs');
const path = require('path');

const taskId = process.argv[2];
if (!taskId) {
  console.error('Usage: node scripts/prompts/generate_review_prompt.js T0xx');
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
const fileLines = taskBlock.split(/\r?\n/).filter((line) => line.includes('Files:'));
const files = [];

fileLines.forEach((line) => {
  const matches = line.match(/`([^`]+)`/g) || [];
  matches.forEach((match) => {
    files.push(match.replace(/`/g, ''));
  });
});

const filesSection = files.length
  ? files.map((file) => `- ${file}`).join('\n')
  : '- <provide the file list from the task or git diff>'; 

const prompt = `Read docs/ai-prompts/claude-review.md first.

You are reviewing Task ${taskId} in the NutriPilot repo.

FILES TO REVIEW (ONLY THESE):
${filesSection}

TASK CONTEXT (verbatim from tasks.md):
${taskBlock}

REVIEW ACCEPTANCE (BLOCKING-ONLY):
- Only report issues that violate AGENTS.md, spec.md, plan.md, .specify/memory/constitution.md, or tasks.md.
- Ignore stylistic preferences or scope-expanding suggestions.

RESPONSE FORMAT (MANDATORY):
- Overall verdict: APPROVE or REQUEST CHANGES
- If REQUEST CHANGES:
  - Bullet list of concrete issues with file references
- If APPROVE:
  - One-line confirmation only
`;

process.stdout.write(prompt);
