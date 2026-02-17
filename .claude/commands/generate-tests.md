---
model: opus
description: Parallel test generation — discovers YAML stories, fans out playwright-codegen-agents, aggregates results and generates .spec.ts files
argument-hint: [headed] [filename-filter] [vision] [output-dir=tests/generated]
---

# Purpose

Discover user stories from YAML files, fan out parallel `playwright-codegen-agent` instances to validate each story, then aggregate pass/fail results with screenshots. For every story that passes ALL steps, the agent also produces a standalone Playwright .spec.ts test file.

## Variables

YAML_FILENAME: $1 Path to filename of the stories to run against. Either a .yml or .yaml file
HEADED: detected from $ARGUMENTS — (default: "false" — set to "true" or "headed" for visible browser windows)
VISION: detected from $ARGUMENTS — if the keyword "vision" appears anywhere in the arguments, enable vision mode (screenshots returned as image responses in the agent's context for richer validation; higher token cost). Default: false.
OUTPUT_DIR: detected from $ARGUMENTS — extract value after "output-dir=" (default: "tests/generated"). This is where generated .spec.ts files will be written.
CONTEXT_DIR: detected from $ARGUMENTS — extract value after "context-dir=" (default: "context/"). Root of the shared knowledge base.
AGENT_TIMEOUT: 300000
SCREENSHOTS_BASE: "screenshots/"
RUN_DIR: "{SCREENSHOTS_BASE}/{YYYYMMDD_HHMMSS}\*{short-uuid}" (generated once at start of run)

## Codebase Structure

Example of the structure would look like

```
automations/
├── hackernews.yaml    # Sample HN stories
└── *.yaml             # Additional story files

test_results/
└── 20260210_143022_a1b2c3/                 # Run directory (datetime + short uuid)
    ├── hackernews/                         # Source file stem
    │   ├── front-page-loads-with-posts/    # Slugified story name
    │   ├── navigate-to-page-two-and-back/
    │   └── view-top-post-comments/
    └── another-file/
        └── story-name/

tests/generated/                            # OUTPUT_DIR (configurable)
├── hackernews/                             # Mirrors YAML file stem
│   ├── front-page-loads-with-posts.spec.ts
│   ├── navigate-to-page-two-and-back.spec.ts
│   └── view-top-post-comments.spec.ts
└── another-file/
    └── story-name.spec.ts
```

## Playwright Config Bootstrap

Before spawning agents, perform these checks:

1. **Check for `playwright.config.ts`** in the project root. If it does NOT exist, create a minimal one:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/generated",
  use: {
    baseURL: undefined,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  retries: 1,
  reporter: [["html", { open: "never" }]],
});
```

2. **Check for `@playwright/test`** in `package.json` devDependencies. If not present, run `npm install --save-dev @playwright/test` before spawning agents.

## Context Scanning

Before spawning agents, scan the `CONTEXT_DIR` directory and build a **context summary** to pass to each agent:

1. **Check if `CONTEXT_DIR` exists.** If it does not, set `CONTEXT_SUMMARY` to empty and skip this section.

2. **Auth & Environments** — check for `CONTEXT_DIR/auth/`:
   - If `environments.yaml` exists, read it and note the default environment URL.
   - If `credentials.yaml` exists, read it and note the available user roles (just the role names and emails — do NOT log passwords in the summary).

3. **Business Logic Docs** — check for `CONTEXT_DIR/docs/`:
   - List all `.md` files by filename. Do NOT read their contents yet — the agent will read relevant ones on demand.

4. **API Specs** — check for `CONTEXT_DIR/api/`:
   - List all files (`.yaml`, `.json`). Note their filenames.

5. **Design References** — check for `CONTEXT_DIR/designs/`:
   - List all files. Note filenames.

6. **Build `CONTEXT_SUMMARY`** — a structured block like:

```
## Available Context (from context/)

**Default environment:** staging → https://staging.example.com
**Available users:** admin (admin@example.com), viewer (viewer@example.com)
**Business logic docs:** checkout-flow.md, user-roles.md
**API specs:** openapi.yaml
**Design references:** homepage.png, homepage-annotations.md
```

If the context directory is empty or missing, set:

```
## Available Context
None — no context/ directory found.
```

## Instructions

### Step 1 — Categorize stories

For each story in the YAML file, check if a .spec.ts file already exists at the expected path:

```
OUTPUT_DIR/<yaml-file-stem>/<story-name-slugified>.spec.ts
```

Split stories into two groups:

- **HAS_SPEC**: A .spec.ts file already exists — run it directly via `npx playwright test`
- **NEEDS_CODEGEN**: No .spec.ts file — needs a `playwright-codegen-agent` to explore and generate one

### Step 2 — Run existing specs

For all HAS_SPEC stories, run them in a single Bash command:

```bash
npx playwright test <path1>.spec.ts <path2>.spec.ts ... --reporter=list 2>&1
```

Parse the output to determine PASS/FAIL for each spec file. This is fast, cheap, and uses zero agent tokens.

### Step 3 — Fan out codegen agents for new stories

For NEEDS_CODEGEN stories only, spawn `playwright-codegen-agent` instances:

- Pass each agent the following context:
  - The story name and workflow
  - The OUTPUT_DIR path, including the YAML-file-stem subdirectory (e.g., `tests/generated/hackernews/`)
  - The YAML file name (human-readable, for the `test.describe` block label)
  - The HEADED, VISION, and SCREENSHOTS_DIR variables
  - The `CONTEXT_SUMMARY` block (so the agent knows what context is available)
  - The `CONTEXT_DIR` path (so the agent can read files on demand)
- Launch ALL codegen agents in a single message so they run in parallel
- Be absolutely sure you clearly prompt each agent to have one specific task so all tasks get covered and you get results for every story

### General rules

- If a YAML file fails to parse, log a warning and skip it
- If no stories are found after discovery, report that and stop
- Be resilient: if a teammate times out or crashes, mark that story as FAIL and include whatever output was available
- After all codegen agents complete and you have their results, shut down each agent

## Post-Run Summary

After all steps complete, provide a unified summary covering both existing specs and codegen results:

```
## Results

| Story | Mode | Status | Test File |
| --- | --- | --- | --- |
| Front page loads with posts | EXISTING SPEC | PASS | tests/generated/hackernews/front-page-loads-with-posts.spec.ts |
| Navigate to page two and back | CODEGEN | PASS + GENERATED | tests/generated/hackernews/navigate-to-page-two-and-back.spec.ts |
| View top post comments | CODEGEN | FAIL — NO TEST | — |
```

Mode values:

- **EXISTING SPEC** — ran an existing .spec.ts file directly (no agent tokens spent)
- **CODEGEN** — explored via playwright-codegen-agent, generated .spec.ts on success

If at least one test file exists (existing or newly generated), also print:

```
Run all tests:
  npx playwright test tests/generated/
```
