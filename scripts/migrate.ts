import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const sql = neon(process.env.DATABASE_URL!);

async function runFile(filePath: string) {
  const content = readFileSync(filePath, "utf-8");
  const statements = content
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`\n→ ${filePath.split(/[\\/]/).pop()} (${statements.length} statements)`);

  for (let i = 0; i < statements.length; i++) {
    try {
      await sql.query(statements[i]);
      console.log(`  [${i + 1}/${statements.length}] OK`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("already exists") ||
        msg.includes("is not an existing enum label") ||
        msg.includes("does not exist")
      ) {
        console.log(`  [${i + 1}/${statements.length}] SKIP (already applied)`);
      } else {
        console.error(`  [${i + 1}/${statements.length}] ERROR:`, msg);
        process.exit(1);
      }
    }
  }
}

async function migrate() {
  const migrationsDir = join(process.cwd(), "db/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    await runFile(join(migrationsDir, file));
  }

  console.log("\nMigration complete.");
}

migrate();
