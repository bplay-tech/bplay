import { eq } from "drizzle-orm";
import { db } from "./client";
import { partnerTiers } from "./schema/partner-tiers";
import { exchangeRates } from "./schema/exchange-rates";
import { users } from "./schema/users";
import { userSettings } from "./schema/user-settings";
import { userNotifications } from "./schema/user-notifications";
import bcrypt from "bcryptjs";

const SUPER_ADMIN_EMAIL = "admin@bplay.io";
const SUPER_ADMIN_PASSWORD = "Bplay#SA2026!xK9m";

async function seedPartnerTiers() {
  console.log("Seeding partner tiers...");
  const existing = await db.select().from(partnerTiers).limit(1);
  if (existing.length > 0) {
    console.log("  Partner tiers already seeded — skipping");
    return;
  }
  await db.insert(partnerTiers).values([
    { name: "Bronze", commissionRate: "5.00", minSalesThreshold: 0, color: "#CD7F32" },
    { name: "Silver", commissionRate: "8.00", minSalesThreshold: 10, color: "#9CA3AF" },
    { name: "Gold", commissionRate: "12.00", minSalesThreshold: 25, color: "#F59E0B" },
  ]);
  console.log("  3 partner tiers created");
}

async function seedExchangeRate() {
  console.log("Seeding exchange rate...");
  const existing = await db.select().from(exchangeRates).limit(1);
  if (existing.length > 0) {
    console.log("  Exchange rate already seeded — skipping");
    return;
  }
  await db.insert(exchangeRates).values({ rate: "6.67" });
  console.log("  Exchange rate created: 1 USDC = 6.67 BPLAY");
}

async function seedSuperAdmin() {
  console.log("Seeding super admin...");

  const goldTier = await db
    .select()
    .from(partnerTiers)
    .where(eq(partnerTiers.name, "Gold"))
    .limit(1);
  if (!goldTier[0]) throw new Error("Gold tier not found — ensure tiers are seeded first");

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, SUPER_ADMIN_EMAIL))
    .limit(1);

  let adminId: string;

  if (existing[0]) {
    const [updated] = await db
      .update(users)
      .set({
        role: "SUPER_ADMIN",
        partnerTierId: goldTier[0].id,
        passwordHash,
        isActive: true,
        referralCode: "BPLAY-SA",
        updatedAt: new Date(),
      })
      .where(eq(users.email, SUPER_ADMIN_EMAIL))
      .returning();
    adminId = updated.id;
    console.log("  Super admin updated (role promoted to SUPER_ADMIN, password reset)");
  } else {
    const [created] = await db
      .insert(users)
      .values({
        email: SUPER_ADMIN_EMAIL,
        passwordHash,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        partnerTierId: goldTier[0].id,
        referralCode: "BPLAY-SA",
      })
      .returning();
    adminId = created.id;
    console.log("  Super admin created");
  }

  await db.insert(userSettings).values({ userId: adminId }).onConflictDoNothing();
  await db.insert(userNotifications).values({ userId: adminId }).onConflictDoNothing();

  console.log("");
  console.log("  ┌─────────────────────────────────────────┐");
  console.log(`  │  Email:    ${SUPER_ADMIN_EMAIL.padEnd(30)}│`);
  console.log(`  │  Password: ${SUPER_ADMIN_PASSWORD.padEnd(30)}│`);
  console.log("  └─────────────────────────────────────────┘");
  console.log("");
}

async function main() {
  try {
    await seedPartnerTiers();
    await seedExchangeRate();
    await seedSuperAdmin();
    console.log("Seed complete.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();
