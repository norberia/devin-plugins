# devin-plugins

norberia's personal Devin plugin set. The repo root is a meta-plugin: installing
it pulls in every plugin under `plugins/` via `requiredPlugins`.

## Install

```bash
devin plugins install norberia/devin-plugins
```

Recorded in the personal manifest, so it syncs to every signed-in machine and
cloud session. Plugins are then available as `/<plugin>:<skill>` plus any
rules, hooks, and MCP servers they ship.

## Plugins

| Plugin                        | What it adds                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| [`longbridge`](plugins/longbridge) | Longbridge MCP (`https://mcp.longbridge.com`, OAuth 2.1): quotes, portfolio, trading for US/HK. |
| [`ticktick`](plugins/ticktick)     | TickTick MCP (`https://mcp.ticktick.com`, OAuth 2.1): tasks, lists, habits, focus, tags.        |

## Adding a plugin

1. Create `plugins/<name>/.devin-plugin/plugin.json` (see
   [plugin docs](https://github.com/CognitionAI/team-marketplace-template) for
   the format) plus optional `AGENTS.md`, `rules/`, `skills/`, `hooks.json`,
   `.mcp.json`.
2. Add a `git-subdir` entry for it under `requiredPlugins` in
   [`.devin-plugin/plugin.json`](.devin-plugin/plugin.json).
3. `node scripts/validate.mjs`, commit, push. New sessions pick it up;
   `devin plugins update` refreshes existing machines.

## Validate

```bash
node scripts/validate.mjs
```
