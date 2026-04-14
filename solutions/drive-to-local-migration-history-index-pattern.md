---
title: Use a HISTORY_INDEX.md to handle immutable references when migrating projects off Google Drive
date: 2026-04-06
problem_type: knowledge
category: patterns
track: knowledge
tags: [migration, google-drive, local-ssd, history, immutable-files, claude-code-harness]
applies_when: Migrating any project workspace from a Google Drive sync path (H:/.shortcut-targets-by-id/... or H:/My Drive/...) to a local SSD path (C:/Users/JBOO/<project>/), when some files referencing the old path cannot or should not be edited
related_projects: [dreams, root-network]
---

## Context

When migrating a project off Google Drive sync onto the local SSD (per the
"Local SSD for code" rule), most file paths can be updated in place — code,
docs, configs, memory. But two classes of files reference the old Drive path
and **must not be edited**:

1. **Dated planning artifacts in the repo** — design specs and implementation
   plans authored at a specific point in time. These are committed to git as
   historical record. Editing them retroactively would distort the project's
   own documented history of what was true when the plan was written.

2. **Claude Code harness files under `~/.claude/`** — session transcripts
   (`*.jsonl`), subagent logs, file-history snapshots
   (`.claude/file-history/<session>/<hash>@v<n>`), and tool-result caches.
   These are append-only audit history. Editing them corrupts session
   replay and version-tracking inside Claude Code itself.

The naive approach (grep for the old path and rewrite everything) breaks
both. Leaving them silent is also bad — six months later nobody remembers
which paths in old docs are "live" vs "frozen", and a future agent will
follow the dead path and fail loudly (or worse, silently).

## Guidance

Create a `_archive/HISTORY_INDEX.md` at the project root that catalogues
every file still referencing the old path and explains why each one was
left in place. Structure:

1. **Header** — what the file is for, what migration date it references,
   and the rule that "these are intentionally not edited".
2. **Translation rule** — a one-line `old path → new path` mapping that a
   reader (human or agent) can apply mentally to any reference in the
   listed files. Be explicit about whether the old path still resolves
   on disk or is fully dead.
3. **Project planning docs section** — list each frozen doc with its
   path and the line numbers where the old path appears. Note explicitly
   that these are point-in-time history and that the *current*
   authoritative description lives in `<other doc>`.
4. **Harness artifacts section** — note the count, the parent directories
   under `~/.claude/`, and (critically) a regenerable grep command so the
   list can be re-derived later instead of going stale. List the top
   session IDs involved. Mark **DO NOT EDIT** with the reason (corrupts
   session replay).
5. **Pre-migration source location** — if a belt-and-suspenders backup
   of the old data still exists somewhere, name it and state the
   condition for deleting it (e.g., "after Drive unsync confirmed and
   end-to-end smoke test passes").
6. **Original (now-dead) path** — explicitly name the old path and its
   status, so future readers know not to recreate the symlink/shortcut.

Reference implementations:
- `C:\Users\JBOO\dreams\_archive\HISTORY_INDEX.md` — original (DREAMERS migration)
- `C:\Users\JBOO\root-network\_archive\HISTORY_INDEX.md` — second use (ROOT NETWORK migration)

## Why This Matters

- **Loud failures over silent staleness.** The translation rule makes it
  explicit which paths are stale, so anyone reading an old doc knows to
  apply the rewrite mentally instead of trusting the literal string.
- **Protects the harness.** Editing `.claude/` session files corrupts
  Claude Code itself — file-history version chains break, session replay
  can't reconstruct prior tool calls. The index documents this risk so
  no well-meaning future agent decides to "clean up" those files.
- **Preserves project history integrity.** Dated planning docs are a
  primary source for "what did we know on April 1?". Rewriting them to
  reflect April 6 reality erases that signal. The index lets the docs
  stay frozen while keeping the migration discoverable.
- **Makes deletion of the backup safe.** When the user is ready to
  delete the belt-and-suspenders source, the index already lists the
  precondition (`after Drive unsync confirmed`), so the future-self
  decision is mechanical instead of "wait, was this safe to remove?".
- **Compounds.** Each subsequent project migration can copy the
  template, fill in the specifics, and benefit from the same pattern
  with no extra design work.

## When to Apply

Apply this pattern when:
- Migrating an active project from Google Drive sync to local SSD
- The migration touches data files referenced by hardcoded paths in code
- Any committed planning docs in the repo describe the old layout
- The project has Claude Code session history under `~/.claude/projects/C--Users-JBOO/`

Skip this pattern only if:
- The project never had any Drive references (greenfield on local SSD)
- All references can be cleanly updated in place (no immutable artifacts)
- The migration is so recent that no harness session files exist yet

## Examples

**Minimal index skeleton** (adapt the specifics for the actual migration):

```markdown
# <PROJECT> — Historical References Index

These files reference the **old Drive path** (`<OLD_PATH>`) and were
intentionally left in place when <PROJECT> was migrated to
`<NEW_PATH>` on **YYYY-MM-DD**.

## Translation rule

`<OLD_PATH>/{...}` reads today as `<NEW_PATH>/{...}`. The old path
[no longer resolves / will be removed when Drive sync is uninstalled].

## Project planning docs (frozen — historical record)

- `docs/specs/<dated>.md` — references old path on lines X, Y, Z
- `docs/plans/<dated>.md` — references old path on lines X, Y, Z

Current authoritative layout: `docs/<current-doc>.md` (updated YYYY-MM-DD).

## Claude Code harness artifacts (immutable — DO NOT EDIT)

N files under `~/.claude/` reference the old path. These are session
transcripts, subagent logs, file-history snapshots, and tool-result
caches. Editing them corrupts session replay.

Regenerate the list with:
\`\`\`bash
grep -rl "<OLD_PATH_FRAGMENT>" \
  ~/.claude/projects/<project-id>/ \
  ~/.claude/file-history/ 2>/dev/null
\`\`\`

Top session IDs involved: <id1>, <id2>, <id3>

## Pre-migration source location

- `<BACKUP_PATH>` — belt-and-suspenders. Delete after <CONDITION>.

## Original (dead) path

- `<OLD_PATH>` — no longer resolves; will be fully gone after Drive unsync.
```

**Bash one-liner to count harness references for a given project:**

```bash
grep -rl "<OLD_PATH_FRAGMENT>" \
  ~/.claude/projects/C--Users-JBOO/ \
  ~/.claude/file-history/ 2>/dev/null | wc -l
```

Run this before writing the index so the "N files" claim is accurate.
