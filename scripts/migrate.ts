import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  const migrationFile = join(process.cwd(), "db/migrations/0000_exotic_ulik.sql");
  const migrationSql = readFileSync(migrationFile, "utf-8");

  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Running ${statements.length} statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await sql.query(statement);
      console.log(`[${i + 1}/${statements.length}] OK`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists")) {
        console.log(`[${i + 1}/${statements.length}] SKIP (already exists)`);
      } else {
        console.error(`[${i + 1}/${statements.length}] ERROR:`, msg);
        process.exit(1);
      }
    }
  }

  console.log("Migration complete.");
}

migrate();
