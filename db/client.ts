import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | undefined;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    _db = drizzle(neon(url, { fetchOptions: { cache: "no-store" } }), { schema });
  }
  return _db;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop: string | symbol) {
    return getDb()[prop as keyof NeonHttpDatabase<typeof schema>];
  },
});
