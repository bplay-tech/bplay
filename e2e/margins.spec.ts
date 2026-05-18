import { test, expect } from "@playwright/test";

// All dashboard routes accessible to super-admin
const PAGES = [
  { path: "/dashboard/overview", name: "Overview" },
  { path: "/dashboard/buy", name: "Buy BPLAY" },
  { path: "/dashboard/sales", name: "Sales & Referrals" },
  { path: "/dashboard/payouts", name: "Payouts" },
  { path: "/dashboard/team", name: "Team" },
  { path: "/dashboard/purchases", name: "Purchases" },
  { path: "/dashboard/exchange-rate", name: "Exchange Rate" },
  { path: "/dashboard/compose", name: "Compose" },
  { path: "/dashboard/news", name: "News" },
  { path: "/dashboard/settings", name: "Settings" },
];

// px-4 = 16px (mobile), sm:px-6 = 24px (desktop >= 640px)
const MIN_PADDING_PX = 16;
// gap-6 = 1.5rem = 24px at default 16px root font-size
const EXPECTED_GAP_PX = 24;
// max-w-7xl = 1280px
const MAX_CONTENT_WIDTH_PX = 1280;

test.describe("Dashboard layout margins — desktop", () => {
  for (const { path, name } of PAGES) {
    test(`${name} — main has correct padding`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const padding = await page.evaluate(() => {
        const main = document.querySelector("main");
        if (!main) return null;
        const s = getComputedStyle(main);
        return {
          left: parseFloat(s.paddingLeft),
          right: parseFloat(s.paddingRight),
          top: parseFloat(s.paddingTop),
        };
      });

      expect(padding, `${name}: <main> not found`).not.toBeNull();
      expect(padding!.left, `${name}: left padding too small`).toBeGreaterThanOrEqual(MIN_PADDING_PX);
      expect(padding!.right, `${name}: right padding too small`).toBeGreaterThanOrEqual(MIN_PADDING_PX);
      expect(padding!.top, `${name}: top padding missing`).toBeGreaterThanOrEqual(MIN_PADDING_PX);
    });

    test(`${name} — page root uses gap-6`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const gap = await page.evaluate(() => {
        const child = document.querySelector("main")?.firstElementChild as HTMLElement | null;
        return child ? parseFloat(getComputedStyle(child).gap || "0") : null;
      });

      expect(gap, `${name}: first child of <main> not found`).not.toBeNull();
      expect(gap!, `${name}: expected gap-6 (24px), got ${gap}px`).toBe(EXPECTED_GAP_PX);
    });

    test(`${name} — content width ≤ max-w-7xl`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const width = await page.evaluate(() => {
        const main = document.querySelector("main");
        return main ? main.getBoundingClientRect().width : null;
      });

      expect(width, `${name}: <main> not found`).not.toBeNull();
      expect(width!, `${name}: content exceeds max-w-7xl`).toBeLessThanOrEqual(MAX_CONTENT_WIDTH_PX + 1);
    });

    test(`${name} — no horizontal scroll`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 2
      );

      expect(overflow, `${name}: horizontal overflow detected`).toBe(false);
    });
  }

  test("sticky nav does not overlap page content", async ({ page }) => {
    await page.goto("/dashboard/overview");
    await page.waitForLoadState("networkidle");

    const { navBottom, mainTop } = await page.evaluate(() => {
      const header = document.querySelector("header");
      const main = document.querySelector("main");
      return {
        navBottom: header?.getBoundingClientRect().bottom ?? 0,
        mainTop: main?.getBoundingClientRect().top ?? 0,
      };
    });

    expect(mainTop, "Main content overlaps sticky nav").toBeGreaterThanOrEqual(navBottom - 1);
  });

  test("every page has a non-empty h1", async ({ page }) => {
    for (const { path, name } of PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const h1 = await page.evaluate(() => document.querySelector("h1")?.textContent?.trim() ?? "");
      expect(h1.length, `${name}: missing or empty <h1>`).toBeGreaterThan(0);
    }
  });
});

test.describe("Dashboard layout margins — mobile (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const { path, name } of PAGES) {
    test(`${name} — no horizontal scroll on mobile`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 2
      );

      expect(overflow, `${name}: horizontal overflow on mobile`).toBe(false);
    });

    test(`${name} — left padding ≥ 16px on mobile`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const paddingLeft = await page.evaluate(() => {
        const main = document.querySelector("main");
        return main ? parseFloat(getComputedStyle(main).paddingLeft) : null;
      });

      expect(paddingLeft, `${name}: <main> not found on mobile`).not.toBeNull();
      expect(paddingLeft!, `${name}: no left padding on mobile`).toBeGreaterThanOrEqual(MIN_PADDING_PX);
    });
  }
});
