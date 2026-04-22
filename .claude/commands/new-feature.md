# /new-feature

Scaffold a new feature following the project's feature-based architecture.

## Arguments
`$ARGUMENTS` — feature name in kebab-case (e.g. `token-transfer`)

## Steps

1. Create `features/$ARGUMENTS/` with:
   - `index.ts` — barrel (only export public API)
   - `types.ts` — feature-specific TypeScript types
   - `hooks/` — client-side React hooks
   - `actions.ts` — Server Actions (`"use server"`)
   - `components/` — feature UI components

2. If the feature touches the DB:
   - Add schema in `db/schema/$ARGUMENTS.ts`
   - Add query functions in `db/queries/$ARGUMENTS.ts`
   - Generate migration with `npx drizzle-kit generate`

3. If the feature touches wallet/Web3:
   - Add wagmi hooks in `features/$ARGUMENTS/hooks/use-$ARGUMENTS.ts`
   - Add Zod schemas for any on-chain inputs in `features/$ARGUMENTS/types.ts`

4. Wire up the route in `app/(dashboard)/$ARGUMENTS/page.tsx` with `loading.tsx` and `error.tsx`.

5. Apply the full checklist from CLAUDE.md before reporting done.
