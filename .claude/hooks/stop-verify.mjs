#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { block, changedFilesPath, ensureCacheDir, localBin, PROJECT_DIR, readInput, tail } from './lib.mjs';
import path from 'node:path';

const MAX_ATTEMPTS = 3;

const input = await readInput();
const listPath = changedFilesPath(input.session_id);
const attemptsPath = path.join(ensureCacheDir(), `stop-attempts-${input.session_id ?? 'default'}`);

if (!existsSync(listPath)) process.exit(0);

const changed = [...new Set(readFileSync(listPath, 'utf8').split('\n').filter(Boolean))].filter((file) =>
  existsSync(path.join(PROJECT_DIR, file)),
);

const reset = () => {
  rmSync(listPath, { force: true });
  rmSync(attemptsPath, { force: true });
};

if (changed.length === 0) {
  reset();
  process.exit(0);
}

const attempts = existsSync(attemptsPath) ? Number(readFileSync(attemptsPath, 'utf8')) || 0 : 0;
if (attempts >= MAX_ATTEMPTS) {
  reset();
  process.stderr.write(
    `stop-verify: still failing after ${MAX_ATTEMPTS} attempts, letting you stop. Tell the user what is broken.\n`,
  );
  process.exit(0);
}

const run = (bin, args) => spawnSync(bin, args, { cwd: PROJECT_DIR, encoding: 'utf8', timeout: 240_000 });
const failures = [];

const tsc = localBin('tsc');
if (tsc) {
  const result = run(tsc, ['--noEmit', '--pretty', 'false']);
  if (result.status !== 0) failures.push(`TypeScript (tsc --noEmit):\n${tail(result.stdout + result.stderr, 50)}`);
}

const jest = localBin('jest');
if (jest) {
  const result = run(jest, ['--ci', '--silent', '--passWithNoTests', '--findRelatedTests', ...changed]);
  if (result.status !== 0)
    failures.push(`Jest (related to ${changed.length} changed file(s)):\n${tail(result.stdout + result.stderr, 60)}`);
}

if (failures.length === 0) {
  reset();
  process.exit(0);
}

writeFileSync(attemptsPath, String(attempts + 1));
block(
  [`Verification failed (attempt ${attempts + 1}/${MAX_ATTEMPTS}). Fix these before finishing:`, ...failures].join(
    '\n\n',
  ),
);
