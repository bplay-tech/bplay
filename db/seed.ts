import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import { partnerTiers } from "./schema/partner-tiers";
import { exchangeRates } from "./schema/exchange-rates";
import { users } from "./schema/users";
import { userSettings } from "./schema/user-settings";
import { userNotifications } from "./schema/user-notifications";
import bcrypt from "bcryptjs";

const getEnv = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`${key} must be set in env`);
  return val;
};

const SUPER_ADMIN_EMAIL = getEnv("SUPER_ADMIN_EMAIL");
const SUPER_ADMIN_PASSWORD = getEnv("SUPER_ADMIN_PASSWORD");

async function seedPartnerTiers() {
  console.log("Seeding partner tiers...");
  await db
    .insert(partnerTiers)
    .values([
      {
        name: "Bronze",
        commissionRate: "9.00",
        minTurnoverUsd: 0,
        color: "#CD7F32",
      },
      {
        name: "Silver",
        commissionRate: "11.00",
        minTurnoverUsd: 50000,
        color: "#9CA3AF",
      },
      {
        name: "Gold",
        commissionRate: "13.50",
        minTurnoverUsd: 120000,
        color: "#D4AF37",
      },
      {
        name: "Platinum",
        commissionRate: "17.00",
        minTurnoverUsd: 300000,
        color: "#67E8F9",
      },
      {
        name: "Diamond",
        commissionRate: "20.00",
        minTurnoverUsd: 600000,
        color: "#B9F2FF",
      },
    ])
    .onConflictDoUpdate({
      target: partnerTiers.name,
      set: {
        commissionRate: sql`excluded.commission_rate`,
        minTurnoverUsd: sql`excluded.min_turnover_usd`,
        color: sql`excluded.color`,
      },
    });
  console.log("  5 partner tiers upserted");
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

  const platinumTier = await db
    .select()
    .from(partnerTiers)
    .where(eq(partnerTiers.name, "Diamond"))
    .limit(1);
  if (!platinumTier[0])
    throw new Error("Diamond tier not found — ensure tiers are seeded first");

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
        partnerTierId: platinumTier[0].id,
        passwordHash,
        isActive: true,
        referralCode: "BPLAY-SA",
        updatedAt: new Date(),
      })
      .where(eq(users.email, SUPER_ADMIN_EMAIL))
      .returning();
    adminId = updated.id;
    console.log(
      "  Super admin updated (role promoted to SUPER_ADMIN, password reset)",
    );
  } else {
    const [created] = await db
      .insert(users)
      .values({
        email: SUPER_ADMIN_EMAIL,
        passwordHash,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        partnerTierId: platinumTier[0].id,
        referralCode: "BPLAY-SA",
      })
      .returning();
    adminId = created.id;
    console.log("  Super admin created");
  }

  await db
    .insert(userSettings)
    .values({ userId: adminId })
    .onConflictDoNothing();
  await db
    .insert(userNotifications)
    .values({ userId: adminId })
    .onConflictDoNothing();

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
