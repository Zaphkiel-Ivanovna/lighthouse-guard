#!/usr/bin/env node
import { checkSource, PROTECTED_PATHS } from './architecture-rules.mjs';
import { block, readInput, toProjectPath } from './lib.mjs';

const input = await readInput();
const toolInput = input.tool_input ?? {};
const projectPath = toProjectPath(toolInput.file_path);

if (!projectPath) process.exit(0);

const protectedRule = PROTECTED_PATHS.find((rule) => rule.test(projectPath));
if (protectedRule) {
  block(`Blocked: ${projectPath} is protected. ${protectedRule.why}`);
}

const newCode = [toolInput.content, toolInput.new_string, ...(toolInput.edits ?? []).map((edit) => edit.new_string)]
  .filter(Boolean)
  .join('\n');

const violations = checkSource(projectPath, newCode);
if (violations.length > 0) {
  block(
    [
      `Blocked: ${projectPath} breaks the architecture rules:`,
      ...violations.map((v) => `  - ${v}`),
      'See CLAUDE.md and .claude/rules/architecture.md.',
    ].join('\n'),
  );
}
