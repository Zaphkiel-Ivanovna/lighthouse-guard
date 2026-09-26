#!/usr/bin/env node
// PreToolUse(Bash): the project uses yarn 4 exclusively.
import { block, readInput } from './lib.mjs';

const input = await readInput();
const command = input.tool_input?.command ?? '';

const RULES = [
  {
    re: /(^|[;&|]\s*|\s)npm\s+(i|install|ci|add|uninstall|remove|update)\b/,
    why: 'Use yarn: `yarn add <pkg>` (JS-only) or `yarn expo install <pkg>` (native / SDK-pinned).',
  },
  {
    re: /(^|[;&|]\s*|\s)npx\s+expo\s+install\b/,
    why: 'Use `yarn expo install <pkg>` so the lockfile stays yarn-managed.',
  },
  {
    re: /(^|[;&|]\s*|\s)(pnpm|bun)\s+(i|install|add|remove)\b/,
    why: 'This project uses yarn 4 (see packageManager in package.json).',
  },
  {
    re: /(^|[;&|]\s*|\s)yarn\s+global\b/,
    why: 'yarn 4 has no global installs. Use `yarn dlx <tool>` for one-off binaries.',
  },
];

const hit = RULES.find((rule) => rule.re.test(command));
if (hit) block(`Blocked command: ${hit.why}`);
