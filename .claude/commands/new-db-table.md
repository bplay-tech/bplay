# /new-db-table

Create a new Neon DB table with Drizzle ORM schema, typed queries, and Zod validators.

## Arguments
`$ARGUMENTS` — table name in snake_case (e.g. `wallet_transactions`)

## Steps

1. Create `db/schema/$ARGUMENTS.ts`:
   - Define the Drizzle table with `pgTable`
   - Include `id` (uuid, defaultRandom), `createdAt`, `updatedAt`
   - Export the inferred insert/select types: `type New$Entity` and `type $Entity`

2. Create `db/queries/$ARGUMENTS.ts`:
   - `findById(id: string)`
   - `findMany(filters: ...)` with sensible defaults
   - `create(data: New$Entity)`
   - `update(id: string, data: Partial<New$Entity>)`
   - `remove(id: string)`
   - All functions return typed results, never `any`

3. Add Zod schemas in `lib/zod.ts` for the insert shape.

4. Re-export from `db/schema/index.ts` and `db/queries/index.ts`.

5. Run `npx drizzle-kit generate` and review the generated migration.
