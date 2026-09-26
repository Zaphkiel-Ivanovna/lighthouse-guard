// Shared helpers for Claude Code hooks. Hooks receive a JSON payload on stdin
// and signal a blocking error with exit code 2 (stderr is fed back to Claude).
import { Buffer } from 'node:buffer';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
export const CACHE_DIR = path.join(PROJECT_DIR, '.claude', '.cache');

export async function readInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

/** Project-relative POSIX path, or null when the file is outside the project. */
export function toProjectPath(filePath) {
  if (!filePath) return null;
  const rel = path.relative(PROJECT_DIR, path.resolve(PROJECT_DIR, filePath));
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join('/');
}

export function block(message) {
  process.stderr.write(`${message.trim()}\n`);
  process.exit(2);
}

export function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  return CACHE_DIR;
}

export function localBin(name) {
  const bin = path.join(PROJECT_DIR, 'node_modules', '.bin', name);
  return existsSync(bin) ? bin : null;
}

export function changedFilesPath(sessionId) {
  return path.join(ensureCacheDir(), `changed-${sessionId ?? 'default'}.txt`);
}

/** Keep the tail of long tool output so Claude gets the useful part. */
export function tail(text, lines = 60) {
  const all = text.trim().split('\n');
  return all.length <= lines ? all.join('\n') : ['…', ...all.slice(-lines)].join('\n');
}
