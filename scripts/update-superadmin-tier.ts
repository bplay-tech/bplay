import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  const [diamond] = await sql`SELECT id FROM partner_tiers WHERE name = 'Diamond' LIMIT 1`;
  if (diamond) {
    const result = await sql`UPDATE users SET partner_tier_id = ${diamond.id} WHERE role = 'SUPER_ADMIN' RETURNING email`;
    console.log("Super admin tier updated to Diamond:", result[0]?.email ?? "no super admin found");
  } else {
    console.log("Diamond tier not found — run migration first");
  }
}

run();
