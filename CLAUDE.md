# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A PoC for AI-driven browser test generation. The pipeline reads a YAML file of natural-language user stories, fans out `playwright-codegen-agent` instances to explore and validate each story in a headless browser, and writes standalone Playwright `.spec.ts` files. On subsequent runs, existing spec files are executed directly instead of re-exploring.

## Commands

```bash
npm i                                          # install dependencies
npx playwright test tests/generated/           # run all generated specs
npx playwright test tests/generated/hp/home-page-loads.spec.ts  # run a single spec
```

The main entry point is the `/generate-tests` Claude Code command:

```
/generate-tests automations/hp.yml
```

## Architecture

### Pipeline flow

```
automations/*.yml
  → /generate-tests command (orchestrator)
      → Context Scanning (context/ dir)
      → Step 1: categorize stories — HAS_SPEC vs NEEDS_CODEGEN
      → Step 2: run existing specs directly via npx playwright test
      → Step 3: fan out playwright-codegen-agent (parallel, one per story)
          → each agent explores the site, validates steps, writes .spec.ts
      → Step 4a: validate generated specs via npx playwright test
      → Step 4b: if failures, spawn general-purpose fix agents (parallel)
      → Post-run summary
```

### Key directories

```
automations/        # YAML story files (input)
context/
  auth/             # environments.yaml (URLs), credentials.yaml (users)
  docs/             # app-behavior.md — site-specific patterns injected into every agent
  selector-pitfalls.md  — known bad selectors injected into every agent
tests/generated/    # output .spec.ts files, mirroring YAML file stem
test_results/       # per-story screenshot directories
.claude/
  commands/         # generate-tests.md, run-automation.md
  agents/           # playwright-codegen-agent.md, playwright-agent.md
  skills/           # playwright-cli skill + reference docs
  settings.json     # permission allow-list for agent tool calls
```

### Context injection

Before spawning agents, the orchestrator reads and injects two files directly into every agent prompt:
- `context/selector-pitfalls.md` — patterns that cause strict-mode violations (scoped selectors, `exact: true` for numbered labels)
- `context/docs/app-behavior.md` — site-specific behavioral facts (onboarding flow boilerplate, load gates, SPA navigation pattern, nav shell selectors)

These are the primary levers for improving agent output quality without re-exploration.

### `playwright-codegen-agent`

The core agent. It explores the site interactively using `playwright-cli`, builds a codegen log of stable Playwright selectors from each step's output, then writes a `.spec.ts` file. It does NOT create screenshot directories — the orchestrator pre-creates them and passes a fully resolved `SCREENSHOTS_DIR` path.

### Permission model

`.claude/settings.json` uses `defaultMode: "dontAsk"` for background agents — unlisted tools are silently denied. The allow-list must include exact command forms (e.g. `Bash(mkdir -p *)` is a separate entry from `Bash(mkdir *)`). Subshells `$()` and pipes `|` are blocked even when the command prefix matches — all dynamic values must be pre-resolved by the orchestrator before being passed to agents.
