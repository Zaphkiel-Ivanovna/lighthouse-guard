#!/usr/bin/env node
// PostToolUse(Edit|Write|MultiEdit): formats the file with Prettier, applies
// ESLint autofixes, reports remaining ESLint errors to Claude and records the
// file so the Stop hook can typecheck + run related tests.
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { block, changedFilesPath, localBin, PROJECT_DIR, readInput, tail, toProjectPath } from './lib.mjs';

const input = await readInput();
const projectPath = toProjectPath(input.tool_input?.file_path);
if (!projectPath) process.exit(0);

const absolute = path.join(PROJECT_DIR, projectPath);
if (!existsSync(absolute)) process.exit(0);

const isCode = /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(projectPath);
const isFormattable = isCode || /\.(json|md|ya?ml)$/.test(projectPath);
const run = (bin, args) => spawnSync(bin, args, { cwd: PROJECT_DIR, encoding: 'utf8', timeout: 60_000 });

const prettier = localBin('prettier');
if (prettier && isFormattable) {
  run(prettier, ['--write', '--log-level', 'warn', '--ignore-unknown', projectPath]);
}

const eslint = localBin('eslint');
if (eslint && isCode) {
  run(eslint, ['--fix', '--quiet', projectPath]);
  const result = run(eslint, ['--quiet', '--format', 'stylish', projectPath]);
  // Exit code 1 = lint errors (Claude must fix). 2 = ESLint config/crash: report without blocking.
  if (result.status === 1) {
    block(`ESLint errors remain in ${projectPath} (autofix already applied):\n${tail(result.stdout, 40)}`);
  } else if (result.status === 2) {
    process.stderr.write(`ESLint could not run on ${projectPath}:\n${tail(result.stderr || result.stdout, 10)}\n`);
  }
}

if (/^(src|__tests__)\/.*\.(ts|tsx)$/.test(projectPath)) {
  appendFileSync(changedFilesPath(input.session_id), `${projectPath}\n`);
}
