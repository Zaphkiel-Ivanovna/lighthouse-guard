---
name: verify
description: Run the full quality gate (ESLint, Prettier, TypeScript, Jest, optionally expo-doctor and Maestro E2E) and report results. Use before finishing any task, before committing, or when the user asks whether the project is healthy.
argument-hint: '[e2e] [doctor]'
allowed-tools: Bash(yarn verify:*), Bash(yarn lint:*), Bash(yarn typecheck:*), Bash(yarn test:*), Bash(yarn format:*), Bash(yarn doctor:*), Bash(maestro test:*), Bash(yarn test:e2e:*)
---

# Verify

1. Run `yarn verify` (lint → format check → typecheck → Jest). Fix problems in this order:
   - Formatting: `yarn format`.
   - Lint: autofix with `yarn lint --fix`, then fix the rest by hand. **Never** silence a rule with `eslint-disable` unless the reason is real and written next to it.
   - Types: fix the root cause. No `any`, no `@ts-expect-error` unless there is a linked upstream issue.
   - Tests: understand the failure before touching the test. Never weaken an assertion to make it pass.
2. If `$ARGUMENTS` contains `doctor`, or dependencies changed: run `yarn doctor` and report version mismatches against the SDK.
3. If `$ARGUMENTS` contains `e2e`: check that `maestro` is installed (`maestro --version`) and a simulator or emulator is booted with the dev build installed, then run `yarn test:e2e`. If a prerequisite is missing, say what is missing instead of failing silently.
4. If native config changed (`app.config.ts`, plugins, native deps): remind the user to run `yarn prebuild` and rebuild the dev client. JS checks cannot catch native build errors.
5. Report a short summary: each gate ✅/❌, what you fixed, and what remains (with the exact error).
