---
name: playwright-cli
description: Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, or extract information from web pages.
allowed-tools: Bash(playwright-cli:*)
---

# Configuration

If a `playwright-cli.json` exists in the working directory, use it automatically. If the user provides a path to a config file, use `--config path/to/config.json`. Otherwise, skip configuration — the env var and CLI defaults are sufficient.

```json
{
  "browser": {
    "browserName": "chromium",
    "launchOptions": { "headless": true },
    "contextOptions": { "viewport": { "width": 1440, "height": 900 } }
  },
  "outputDir": "./screenshots"
}
```

# Browser Automation with playwright-cli

## Quick start

```bash
# open new browser
playwright-cli open
# navigate to a page
playwright-cli goto https://playwright.dev
# interact with the page using refs from the snapshot
playwright-cli click e15
playwright-cli type "page.click"
playwright-cli press Enter
# take a screenshot (rarely used, as snapshot is more common)
playwright-cli screenshot
# close the browser
playwright-cli close
```

## Commands

| Command | Description |
|---|---|
| `open [url]` | Open browser, optionally navigate. Flags: `--browser=chrome/firefox/webkit/msedge`, `--persistent`, `--profile=<path>`, `--config=<file>`, `--extension` |
| `goto <url>` | Navigate to URL |
| `snapshot [--filename=]` | Get ARIA snapshot of current page |
| `click <ref>` | Click element |
| `dblclick <ref>` | Double-click element |
| `type <text>` | Type into focused element |
| `fill <ref> <text>` | Fill input field |
| `hover <ref>` | Hover over element |
| `select <ref> <value>` | Select dropdown option |
| `check <ref>` / `uncheck <ref>` | Check / uncheck checkbox |
| `drag <ref> <ref>` | Drag element to target |
| `upload <file>` | Upload file to focused input |
| `eval <expr> [ref]` | Evaluate JS on page or element |
| `dialog-accept [text]` / `dialog-dismiss` | Accept or dismiss dialog |
| `resize <w> <h>` | Resize viewport |
| `close` / `delete-data` | Close browser / delete persistent session data |
| `go-back` / `go-forward` / `reload` | Browser navigation |
| `press <key>` | Press key (Enter, ArrowDown, Tab, etc.) |
| `keydown <key>` / `keyup <key>` | Hold / release modifier key |
| `mousemove <x> <y>` / `mousedown [btn]` / `mouseup [btn]` / `mousewheel <dx> <dy>` | Mouse events |
| `screenshot [ref] [--filename=]` | Screenshot page or element |
| `pdf [--filename=]` | Save page as PDF |
| `tab-list` / `tab-new [url]` / `tab-close [n]` / `tab-select <n>` | Tab management |
| `state-save [file]` / `state-load <file>` | Save / restore full browser state |
| `cookie-list/get/set/delete/clear` | Cookie management |
| `localstorage-list/get/set/delete/clear` | LocalStorage management |
| `sessionstorage-list/get/set/delete/clear` | SessionStorage management |
| `route <pattern> [--status=N] [--body=]` | Mock network requests |
| `route-list` / `unroute [pattern]` | List or clear route mocks |
| `console [level]` | Get browser console logs |
| `network` | Get network request log |
| `run-code <fn>` | Run arbitrary Playwright code |
| `tracing-start` / `tracing-stop` | Start / stop tracing |
| `video-start` / `video-stop [file]` | Start / stop video recording |
| `list` / `close-all` / `kill-all` | List sessions, close or force-kill all browsers |

## Snapshots

After each command, playwright-cli provides a snapshot of the current browser state.

```bash
> playwright-cli goto https://example.com
### Page
- Page URL: https://example.com/
- Page Title: Example Domain
### Snapshot
[Snapshot](.playwright-cli/page-2026-02-14T19-22-42-679Z.yml)
```

You can also take a snapshot on demand using `playwright-cli snapshot` command.

If `--filename` is not provided, a new snapshot file is created with a timestamp. Default to automatic file naming, use `--filename=` when artifact is a part of the workflow result.

## Browser Sessions

```bash
# create new browser session named "mysession" with persistent profile
playwright-cli -s=mysession open example.com --persistent
# same with manually specified profile directory (use when requested explicitly)
playwright-cli -s=mysession open example.com --profile=/path/to/profile
playwright-cli -s=mysession click e6
playwright-cli -s=mysession close  # stop a named browser
playwright-cli -s=mysession delete-data  # delete user data for persistent session

playwright-cli list
# Close all browsers
playwright-cli close-all
# Forcefully kill all browser processes
playwright-cli kill-all
```

## Local installation

In some cases user might want to install playwright-cli locally. If running globally available `playwright-cli` binary fails, use `npx playwright-cli` to run the commands. For example:

```bash
npx playwright-cli open https://example.com
npx playwright-cli click e1
```

## Specific tasks

- **Request mocking** [references/request-mocking.md](references/request-mocking.md)
- **Running Playwright code** [references/running-code.md](references/running-code.md)
- **Browser session management** [references/session-management.md](references/session-management.md)
- **Storage state (cookies, localStorage)** [references/storage-state.md](references/storage-state.md)
- **Test generation** [references/test-generation.md](references/test-generation.md)
- **Tracing** [references/tracing.md](references/tracing.md)
- **Video recording** [references/video-recording.md](references/video-recording.md)
