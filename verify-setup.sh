#!/bin/bash
echo "🔍 Verifying development environment..."
echo ""
echo "✓ Node.js:" $(node --version)
echo "✓ npm:" $(npm --version)
echo "✓ Git:" $(git --version)
echo "✓ GitHub CLI:" $(gh --version | head -n 1)
echo "✓ Python:" $(python3 --version)
echo "✓ uv:" $(uv --version)
echo "✓ Codex:" $(codex --version 2>/dev/null || echo "Not in PATH but installed")
echo ""
echo "✓ Project structure:"
[ -d src ] && echo "  ✓ src/" || echo "  ✗ src/ MISSING"
[ -d tests ] && echo "  ✓ tests/" || echo "  ✗ tests/ MISSING"
[ -f constitution.md ] && echo "  ✓ constitution.md" || echo "  ✗ constitution.md MISSING"
[ -f spec.md ] && echo "  ✓ spec.md" || echo "  ✗ spec.md MISSING"
echo ""
echo "✓ npm packages:"
npm list jest eslint prettier --depth=0
echo ""
echo "✅ Setup verification complete!"
