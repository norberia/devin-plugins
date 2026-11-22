# TickTick usage

The `ticktick` MCP server reads and writes the user's real TickTick account
(tasks, lists, habits, focus records, tags, comments).

- Before any destructive or bulk call, list exactly what will change and wait
  for explicit user confirmation: `delete_task`, `delete_tag`,
  `delete_project_group`, `delete_comment`, `delete_focus`, `move_task`,
  `batch_update_tasks`, `complete_tasks_in_project`, and `rename_tag`.
  Summarizing is not confirmation.
- Single creates, updates, and completions the user asked for need no extra
  confirmation; reads never do.
- Call `get_user_preference` for the account time zone before writing dates.
  Send `startDate`/`dueDate` with an explicit offset (`2026-11-23T10:00:00+0800`)
  and set `timeZone`; the web app renders times in the viewer's local zone.
- `list_projects` includes the virtual inbox (`inbox<userId>`); omitting
  `projectId` on `create_task` uses the inbox.
- Write tools such as `update_task`, `complete_task`, and `delete_task` need
  both `project_id` and `task_id`; read the task first if the project is unknown.
- `delete_task` moves the task to Trash. Never auto-retry a failed write; report
  the server error verbatim.
- Use `get_tool_details` for the full schema of an unfamiliar tool.
