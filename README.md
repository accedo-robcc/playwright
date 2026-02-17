# Setup

```
nvmrc use
npm i
```

# SKILLS

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

# TODO

**Always use a named session.** Derive a short, descriptive kebab-case name from the user's prompt. This gives each task a persistent browser profile (cookies, localStorage, history) that accumulates across calls.
