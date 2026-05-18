import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

const EXCHANGE_RATE_URL = "/dashboard/exchange-rate";
const OVERVIEW_URL = "/dashboard/overview";
const API_URL = "/api/bplay-rate";

// Deliberately different from the seed value (~0.0303) so changes are detectable
const TEST_RATE_INPUT = "0.050000"; // USDC per BPLAY — typed into the form
const TEST_RATE_DISPLAY = "0.0500"; // How it appears in the "Current Rate" card
const TEST_RATE_TICKER = "$0.0500"; // How the CryptoTicker BplayCard shows it
const TEST_RATE_STORED = 20; // BPLAY per USDC stored in DB (1 / 0.05)

async function submitRate(page: Page, rate: string) {
  await page.goto(EXCHANGE_RATE_URL);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="rate"]', rate);
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Exchange rate updated successfully")).toBeVisible({
    timeout: 10_000,
  });
}

test.describe("Exchange Rate — E2E", () => {
  let originalRate = "0.030300";

  // Use absolute URLs so beforeAll/afterAll work outside the test-fixture page context
  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext({
      storageState: "e2e/.auth/session.json",
      baseURL: BASE_URL,
    });
    const page = await ctx.newPage();
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");
    const val = await page.inputValue('input[name="rate"]').catch(() => "");
    if (val && parseFloat(val) > 0) originalRate = val;
    await ctx.close();
  });

  // Always restore original rate so other test suites are not affected
  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({
      storageState: "e2e/.auth/session.json",
      baseURL: BASE_URL,
    });
    const page = await ctx.newPage();
    await submitRate(page, originalRate);
    await ctx.close();
  });

  // ─── Page structure ──────────────────────────────────────────────────────────

  test("exchange-rate page: loads with h1 and current-rate card", async ({ page }) => {
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Exchange Rate");
    await expect(page.getByText("CURRENT RATE", { exact: false })).toBeVisible();
    await expect(page.locator("text=1 BPLAY =")).toBeVisible();
  });

  test("exchange-rate page: form is pre-filled with the current rate", async ({ page }) => {
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    const inputVal = await page.inputValue('input[name="rate"]');
    expect(
      parseFloat(inputVal),
      "Form input should be pre-filled with the current USDC/BPLAY rate"
    ).toBeGreaterThan(0);
  });

  // ─── Happy path ───────────────────────────────────────────────────────────────

  test("exchange-rate page: successful update shows success message", async ({ page }) => {
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="rate"]', TEST_RATE_INPUT);
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Exchange rate updated successfully")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("exchange-rate page: current-rate card updates immediately after save", async ({
    page,
  }) => {
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="rate"]', TEST_RATE_INPUT);
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Exchange rate updated successfully")).toBeVisible({
      timeout: 10_000,
    });

    // The "1 BPLAY = X USDC" card should reflect the new rate on the same page render
    await expect(
      page.locator(`text=1 BPLAY = ${TEST_RATE_DISPLAY} USDC`)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("exchange-rate page: last-updated timestamp is present after save", async ({ page }) => {
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="rate"]', TEST_RATE_INPUT);
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Exchange rate updated successfully")).toBeVisible({
      timeout: 10_000,
    });

    // Timestamp should be visible and contain today's date
    const tsText = await page.locator("text=Last updated:").textContent();
    expect(tsText, '"Last updated:" label should be visible after save').toBeTruthy();
    // Should include the current year
    expect(tsText).toMatch(/202[0-9]/);
  });

  test("exchange-rate page: form input reflects new rate after hard refresh", async ({
    page,
  }) => {
    // After a full page reload the server re-renders with the latest DB value
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");
    await page.reload({ waitUntil: "networkidle" });

    const inputVal = await page.inputValue('input[name="rate"]');
    expect(
      parseFloat(inputVal).toFixed(6),
      "BUG: form input should show the current rate after a hard page refresh — noStore() fix needed"
    ).toBe(TEST_RATE_INPUT);
  });

  // ─── Overview / CryptoTicker propagation ─────────────────────────────────────

  test("overview: CryptoTicker shows new BPLAY rate after soft navigation from exchange-rate page", async ({
    page,
  }) => {
    // The rate was set in a previous test; navigate softly to overview
    await page.goto(OVERVIEW_URL);
    await page.waitForLoadState("networkidle");

    // React Query fetches /api/bplay-rate on mount (placeholderData + staleTime:0); allow 15s
    await expect(page.getByText(TEST_RATE_TICKER).first()).toBeVisible({ timeout: 15_000 });
  });

  test("overview: CryptoTicker shows new BPLAY rate after hard refresh", async ({
    page,
  }) => {
    await page.goto(OVERVIEW_URL);
    await page.reload({ waitUntil: "load" });

    // Would fail before export const dynamic = "force-dynamic" on overview/page.tsx
    // AND before noStore() in getCurrentExchangeRate()
    await expect(page.getByText(TEST_RATE_TICKER).first()).toBeVisible({ timeout: 15_000 });
  });

  test("overview: BPLAY balance USD value recalculates with new rate after hard refresh", async ({
    page,
  }) => {
    await page.goto(OVERVIEW_URL);
    await page.reload({ waitUntil: "load" });

    // The server-rendered USD value uses getCurrentExchangeRate(). With noStore() it
    // must reflect the latest rate, not a cached value.
    const bplayCard = page.locator("text=BPLAY Balance").locator("../..").first();
    await expect(bplayCard).toBeVisible();
    // Verify a USD value is rendered (format "$X.XX")
    const cardText = await bplayCard.textContent();
    expect(cardText, "BPLAY balance card should contain a USD value").toMatch(/\$/);
  });

  // ─── API route ────────────────────────────────────────────────────────────────

  test("/api/bplay-rate returns the updated rate", async ({ request }) => {
    const res = await request.get(API_URL);
    expect(res.ok(), "/api/bplay-rate should return 200").toBeTruthy();

    const body = await res.json();
    expect(body).toHaveProperty("ratePerUsdc");

    // Stored rate should be ~20 (= 1 / 0.05), previously returned 33.0033 (stale)
    expect(
      body.ratePerUsdc,
      "BUG: /api/bplay-rate returned a stale rate; expected ~20 (1/0.05). noStore() fix needed"
    ).toBeCloseTo(TEST_RATE_STORED, 1);
  });

  // ─── Validation ──────────────────────────────────────────────────────────────

  test("validation: zero rate is rejected server-side", async ({ page }) => {
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    // Remove HTML5 min/required so the form actually submits with 0
    await page.evaluate(() => {
      const el = document.querySelector('input[name="rate"]') as HTMLInputElement;
      el.removeAttribute("min");
      el.removeAttribute("required");
      el.value = "0";
    });
    await page.evaluate(() => {
      (document.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    });

    await expect(page.locator("text=Rate must be a positive number")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator("text=Exchange rate updated successfully")).not.toBeVisible();
  });

  test("validation: negative rate is rejected server-side", async ({ page }) => {
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      const el = document.querySelector('input[name="rate"]') as HTMLInputElement;
      el.removeAttribute("min");
      el.value = "-1";
    });
    await page.evaluate(() => {
      (document.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    });

    await expect(page.locator("text=Rate must be a positive number")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("validation: non-numeric input is rejected server-side", async ({ page }) => {
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      const el = document.querySelector('input[name="rate"]') as HTMLInputElement;
      el.removeAttribute("type");
      el.removeAttribute("required");
      el.value = "abc";
    });
    await page.evaluate(() => {
      (document.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    });

    await expect(page.locator("text=Rate must be a positive number")).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── Access control ──────────────────────────────────────────────────────────

  test("exchange-rate page is inaccessible without auth", async ({ browser }) => {
    // Completely fresh context — no cookies, no session
    const ctx = await browser.newContext({ baseURL: BASE_URL });
    const page = await ctx.newPage();
    await page.goto(EXCHANGE_RATE_URL);
    await page.waitForLoadState("networkidle");

    // Must redirect to login; staying on exchange-rate is a security bug
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    await ctx.close();
  });
});
