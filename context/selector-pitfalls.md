# Selector Pitfalls

Known patterns that cause strict-mode violations or false positives in generated Playwright tests.
Update this file whenever a new pitfall is discovered during codegen.

## Strict-mode ambiguity: partial label matches

**Problem:** `getByRole('button', { name: 'Home' })` matches any button whose aria-label *contains* "Home" — including channel cards labelled "Homeful." and "Homeful en Español."

**Fix:** Always scope navigation button selectors to their container:
```typescript
// ❌ Ambiguous — matches channel cards too
await page.getByRole('button', { name: 'Home' }).click();

// ✅ Scoped to nav
await page.getByTestId('navigation-menu').getByRole('button', { name: 'Home' }).click();
```

## Strict-mode ambiguity: numbered label substrings

**Problem:** `getByRole('button', { name: 'Go to slide 1' })` matches "Go to slide 10" because Playwright's default name matching is substring-based.

**Fix:** Use `{ exact: true }` for any selector whose label ends with a number:
```typescript
// ❌ Matches "Go to slide 10" too
await page.getByRole('button', { name: 'Go to slide 1' }).click();

// ✅ Exact match only
await page.getByRole('button', { name: 'Go to slide 1', exact: true }).click();
```

## General rules

- When a role+name selector resolves to more than one element, scope it to its parent container using `getByTestId`, `locator('.container')`, or `.first()` / `.nth()`.
- Prefer `getByTestId` for navigation shell elements — they are stable across content changes.
- Never use `getByRole` with a name that could be a substring of another element's label without adding `{ exact: true }`.
