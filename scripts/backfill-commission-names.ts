import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, like, notLike } from "drizzle-orm";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const { transactions, bplayPurchases, affiliations, users } = schema;

async function main() {
  // Find all differential commission transactions without a via name yet
  const rows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "REFERRAL"),
        like(transactions.notes, "%commission diff%"),
        notLike(transactions.notes, "%via%")
      )
    );

  console.log(`Found ${rows.length} transaction(s) to backfill.`);
  if (rows.length === 0) return;

  let updated = 0;
  let skipped = 0;

  for (const tx of rows) {
    if (!tx.txHash) { skipped++; continue; }

    // Find the purchase via txHash
    const [purchase] = await db
      .select()
      .from(bplayPurchases)
      .where(eq(bplayPurchases.txHash, tx.txHash))
      .limit(1);

    if (!purchase) { skipped++; continue; }

    // Find buyer's direct affiliate (sales person)
    const [salesAffiliation] = await db
      .select()
      .from(affiliations)
      .where(eq(affiliations.referredUserId, purchase.userId))
      .limit(1);

    if (!salesAffiliation) { skipped++; continue; }

    const [salesUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, salesAffiliation.affiliateId))
      .limit(1);

    if (!salesUser) { skipped++; continue; }

    // Find admin (the owner of this transaction)
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, tx.userId))
      .limit(1);

    if (!adminUser) { skipped++; continue; }

    const newNotes = `${tx.notes} via ${salesUser.name} · admin: ${adminUser.name}`;

    await db
      .update(transactions)
      .set({ notes: newNotes })
      .where(eq(transactions.id, tx.id));

    console.log(`  ✓ ${tx.id.slice(0, 8)}… → via ${salesUser.name} · admin: ${adminUser.name}`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
