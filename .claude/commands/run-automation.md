---
model: opus
description: Parallel user story validation — discovers YAML stories, fans out bowser-qa-agents, aggregates results
argument-hint: [headed] [filename-filter] [vision]
---

# Purpose

Discover user stories from YAML files, fan out parallel `playwright-agent` instances to validate each story, then aggregate and report pass/fail results with screenshots.

## Variables

YALM*FILENAME: $1 Path to filename of the stories to run against. Either a .yml or .yaml file
HEADED: detected from $ARGUMENTS — (default: "false" — set to "true" or "headed" for visible browser windows)
VISION: detected from $ARGUMENTS — if the keyword "vision" appears anywhere in the arguments, enable vision mode (screenshots returned as image responses in the agent's context for richer validation; higher token cost). Default: false.
AGENT_TIMEOUT: 300000
SCREENSHOTS_BASE: "screenshots/bowser-qa"
RUN_DIR: "{SCREENSHOTS_BASE}/{YYYYMMDD_HHMMSS}*{short-uuid}" (generated once at start of run)

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
```

## Instructions

- The yaml file should already list all stores. For each one, spawn one `playwright-agent` with the story data
- Launch ALL agents in a single message so they run in parallel
- Be absolutely sure you clearly prompt each agent to have one specific task so all tasks get covered and you get results for every story
<!-- - If FILENAME_FILTER is provided and non-empty, only run stories from files whose name contains that substring -->
- If a YAML file fails to parse, log a warning and skip it
- If no stories are found after discovery, report that and stop
- Be resilient: if a teammate times out or crashes, mark that story as FAIL and include whatever output was available
- After all agents complete and you have their results, shut down each agent
