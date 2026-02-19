# App Behavior Patterns

Site-specific behavioral facts and test patterns.

Inject this into every codegen agent prompt — these patterns apply to ALL stories on this site.

---

## Onboarding flow

Every fresh browser session (no persisted state) shows a mandatory 5-screen onboarding flow on first load. It is NOT conditional — it always appears on a clean context. Do NOT wrap the dismissal in an `isVisible` check; call it unconditionally.

**Screen sequence:**

1. Welcome/intro — click the primary button (`data-testid="button"`)
2. Terms & Conditions — click "Go to next onboarding screen"
3. Privacy consent — select "No" for personalized offers, then click "Confirm data consent and go"
4. Shortcuts — click the primary button (`data-testid="button"`)
5. Start Streaming — click the primary button (`data-testid="button"`)

**Boilerplate to use verbatim in every generated spec:**

```typescript
import { test, expect, Page } from "@playwright/test";

async function dismissOnboarding(page: Page) {
  await page.getByTestId("button").click();
  await page.getByLabel("Go to next onboarding screen").click();
  await page
    .getByLabel("Consent to personalized offers")
    .locator("label")
    .filter({ hasText: "No" })
    .click();
  await page.getByLabel("Confirm data consent and go").click();
  await page.getByTestId("button").click();
  await page.getByTestId("button").click();
}
```

Call it immediately after `page.goto(...)`, before any other interactions:

```typescript
await page.goto("https://hpchannels-prod.apps.ps.accedo.tv/");
await expect(page).toHaveTitle(/HP TV\+/);
await dismissOnboarding(page);
```

---

## Home page load gate

After `dismissOnboarding()`, the SPA continues loading content asynchronously. Do NOT interact with navigation until the carousel is ready — use the carousel Previous button as the load signal:

```typescript
await expect(page.getByRole("button", { name: "Previous" })).toBeVisible({
  timeout: 30000,
});
```

This must appear before any click on navigation buttons (hamburger menu, Search, Home, etc.).

---

## SPA navigation pattern

This is a Next.js SPA. URL changes happen asynchronously — a plain `.click()` followed by a URL assertion will time out because the router hasn't committed the navigation yet. Always pair URL-changing clicks with `Promise.all`:

```typescript
await Promise.all([
  page.waitForURL("**/settings?section=about", { timeout: 30000 }),
  page
    .getByTestId("secondary-pages-container")
    .getByRole("link", { name: "About" })
    .click(),
]);
```

```typescript
await Promise.all([
  page.waitForURL(/\/search/, { timeout: 30000 }),
  page.getByRole("button", { name: "Search" }).click(),
]);
```

Use a regex pattern (`/\/search/`) when the exact URL includes query params you don't control; use a glob string (`'**/settings?section=about'`) when the path is exact.

---

## Navigation shell selectors

The nav is a `<div>` with `data-testid="navigation-menu"` — it does NOT have `role="navigation"`. Never use `getByRole('navigation')`.

```typescript
// ❌ This element does not exist
await expect(page.getByRole("navigation")).toBeVisible();

// ✅ Correct
await expect(page.getByTestId("navigation-menu")).toBeVisible();
```

The hamburger/menu icon button:

```typescript
await page.getByTestId("navigation-menu").getByTestId("iconButton").click();
```
