# Setup

```
nvmrc use
npm i
```

then, with claude code

```
claude /generate-tests automations/hp.yml
```

This PoC attempts to use playwright-cli + llm to read a yml file describing use-cases in natural language. For each use case, a subagent would run playwright, perform the test and report back.

To reduce token usage, the sub-agent writes a spec file with node + playwright, so that the file is executed instead of going in an exploratory phase.

To enrich the context of the app, a `/context` folder was added. Ideally each project would fill this with as much information of hte app as needed. This includes credentials, environments, etc.

Both `app-behavior.md` and `selector-pitfalls.md` were generated automatically to mitigate errors/failed tests by the sub-agents

# Token usage

This PoC has 3 test cases, with each sub-agent using ~40k tokens

Rough total: ~130-135k tokens for this full /generate-tests invocation.

# TODO

- Generate automations/\*yml files from a ticket (JIRA)
- generate context from Confluence/Figma?
- Session state / auth injection: support `context/auth/session-state.json` (captured via a one-time Playwright `storageState()` script) so auth-gated sites skip login in both agent exploration and generated spec runs. Inject into `playwright.config.ts` and surface to codegen agents via context scanning.

# Commands

## run-automation (deprecated)

Receives a path to a yml file with multiple test cases. Orchestrates specialized agentes for each test case

## generate-tests

Receives a path to a yml file with multiple test cases. Orchestrates specialized agentes for each test case and writes spec files for subsequent runs using playwright directly.

Subsequent runs will check if there is a spec file for a given test case, and will run that instead

# Skills

## playwright-cli

This skill was generated during the playwright-cli setup (see its README)

# playwright-cli

- [Config schema](https://github.com/microsoft/playwright-cli#configuration-file)

Point your agent at the CLI and let it cook. It'll read the skill off `playwright-cli` --help on its own:

```
Test the "add todo" flow on https://demo.playwright.dev/todomvc using playwright-cli.
Check playwright-cli --help for available commands.
```

## cli

### Open visual dashboard

npx playwright-cli show

### Open named sessions

npx playwright-cli -s=browser1 open https://example.com
npx playwright-cli -s=browser2 open https://example.com

### List all open sessions

npx playwright-cli list

### Close a specific one

npx playwright-cli -s=browser1 close

### Or close all at once

npx playwright-cli close-all

# References

- [playwright-cli](https://github.com/microsoft/playwright-cli)
