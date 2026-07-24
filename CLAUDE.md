See @AGENTS.md for all project facts, commands, paths, design-system and quality rules,
and the tool-neutral workflow rules. Everything there applies.

## Claude Code-specific workflow
- Always start non-trivial work in Plan Mode; wait for my approval
- After implementing UI, verify visually with /verify-ui before declaring done (once
  it exists — until Part 3 is built, gate manually per Part 1's note)
- Ship via the /ship skill once it exists — until then, gate manually: run
  npm run verify && npm run build yourself, read the diff, commit on a feature branch
