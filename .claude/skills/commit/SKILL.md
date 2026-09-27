---
name: commit
description: Create a git commit following the project's gitmoji + scoped-type convention, after checking the staged diff and running verification.
disable-model-invocation: true
argument-hint: '[optional hint about the change]'
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(yarn verify:*)
---

# Commit

## Convention

```
<gitmoji> <type>(<scope>): <Imperative summary, capitalised, no period>
* <gitmoji> <type>: <detail>           ← optional bullets, one per notable sub-change
* <gitmoji> <type>(<scope>): <detail>
```

- The summary line is ≤ 72 characters, in English, and uses backticks around identifiers.
- The scope is the feature or layer: `lighthouse`, `settings`, `faq`, `ble`, `ui`, `theme`, `i18n`, `navigation`, `store`, `config`, `claude`, `deps`.
- Bullets only when the commit groups several meaningful changes.

| Gitmoji      | Type                                                          | When                                              |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------- |
| ✨           | `feat`                                                        | new user-facing capability                        |
| 🐛           | `fix`                                                         | bug fix                                           |
| ♻️           | `refactor`                                                    | behaviour-preserving restructuring                |
| 🏗️           | `architecture`                                                | structural or architectural change                |
| 🚚           | `resource-move`                                               | move or rename files                              |
| 💄           | `ui`                                                          | visual / styling change                           |
| 💫           | `animations`                                                  | animations and transitions                        |
| 🌐           | `i18n`                                                        | translations                                      |
| ♿️           | `a11y`                                                        | accessibility                                     |
| ⚡️           | `performance`                                                 | performance                                       |
| ✅           | `test`                                                        | add or update tests                               |
| 🔧           | `config`                                                      | config files (app.config, eslint, tsconfig, eas…) |
| 🧑‍💻           | `dev-experience`                                              | tooling, scripts, Claude setup                    |
| ➕ / ➖ / ⬆️ | `dependency-add` / `dependency-remove` / `dependency-upgrade` | dependencies                                      |
| 🏷️           | `types`                                                       | types only                                        |
| 🔊 / 🔇      | `logging`                                                     | add or remove logs                                |
| 🗑️           | `pruning`                                                     | remove dead code or features                      |
| 📝           | `docs`                                                        | documentation                                     |
| 🎉           | `init`                                                        | first commit                                      |

## Steps

1. `git status` and `git diff --staged` (or `git diff` if nothing is staged). Read the actual changes.
2. If nothing is staged, stage the files belonging to **one** logical change with `git add <paths>` (never `git add -A` blindly, and never add `.env*` or secrets). If the working tree mixes unrelated changes, propose separate commits.
3. Run `yarn verify`. If it fails, stop and report: do not commit a red tree.
4. Write the message per the convention, with any hint from `$ARGUMENTS`. Match the style of `git log -10 --format=%B`.
5. Commit with a heredoc, ending with the attribution trailer the session requires.
6. Show `git log -1 --stat`. **Never push** unless the user explicitly asks.
