# Platform Adapters

The IDE is a host. The AI runtime owns skill discovery and invocation. A skill
can be installed but inactive, and an installed extension may still be
unauthorized or unavailable in the current surface.

## Codex

- User discovery: `~/.agents/skills`.
- Automatic invocation: description match when implicit invocation is allowed.
- Manual fallback: `$designing-distinctive-ui` or `/skills`.
- VS Code/Cursor running the Codex extension follows this runtime, not the host.

## Claude Code

- User discovery: `~/.claude/skills`; workspace `.claude/skills`.
- Automatic invocation: description match unless model invocation is disabled.
- Manual fallback: `/designing-distinctive-ui`.
- The Claude Code IDE extension uses the same runtime paths.

## Gemini CLI

- User discovery: `~/.agents/skills` or `~/.gemini/skills`.
- Automatic invocation: description match through native skill activation.
- Manual fallback: name the skill or inspect `/skills`.
- Keep Gemini's native activation confirmation when it appears.

## Antigravity

- User discovery: `~/.gemini/config/skills`.
- Workspace discovery: `.agents/skills`.
- Automatic invocation: description match; naming the skill is the fallback.
- Detecting a Gemini Code Assist extension alone does not prove this runtime is
  available.

## Cursor

- User discovery: `~/.agents/skills` or `~/.cursor/skills`.
- Workspace discovery: `.agents/skills` or `.cursor/skills`.
- Automatic invocation: description match.
- Manual fallback: `/designing-distinctive-ui`.

## Windsurf

- User discovery: `~/.agents/skills` or
  `~/.codeium/windsurf/skills`.
- Workspace discovery: `.agents/skills` or `.windsurf/skills`.
- Automatic invocation: Cascade matches the description.
- Manual fallback: `@designing-distinctive-ui`.

## VS Code GitHub Copilot

- User discovery: `~/.agents/skills` or `~/.copilot/skills`.
- Workspace discovery: `.agents/skills` or `.github/skills`.
- Automatic invocation: Copilot matches the description.
- Manual fallback: `/designing-distinctive-ui`.
- VS Code without a compatible AI extension is only an IDE, not a runtime.

## Capability Fallback

Run `npm run recommend` to distinguish detected IDEs, runtimes, skill links,
Impeccable readiness, and manual invocation. Do not insert always-on rules into
`AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.

If visual browser evidence is unavailable, continue code checks and report the
visual result as unverified. If Impeccable is missing, stop build edits and give
its official installation command rather than substituting another design
owner.
