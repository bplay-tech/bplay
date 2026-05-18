import { test as setup } from "@playwright/test";
import path from "path";

const SESSION_FILE = path.join(__dirname, ".auth/session.json");

const EMAIL = process.env.TEST_EMAIL ?? "admin@bplay.io";
const PASSWORD = process.env.TEST_PASSWORD ?? "Bplay#SA2026!xK9m";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.waitForSelector("#login-email", { timeout: 15_000 });
  await page.fill("#login-email", EMAIL);
  await page.fill("#login-password", PASSWORD);
  await page.click('[type="submit"]');
  await page.waitForURL("**/dashboard/**", { timeout: 15_000 });

  // Persist cookies + localStorage for all subsequent tests
  await page.context().storageState({ path: SESSION_FILE });
});
