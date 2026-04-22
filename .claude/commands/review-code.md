# /review-code

Review staged or recently modified files against this project's standards.

## What to check

### Technical debt
- Functions over 30 lines — flag and suggest split points
- Files mixing concerns (DB + UI logic, wallet + formatting, etc.)
- Duplicated logic that should be extracted to a shared utility

### Type safety
- Any `any` types
- Missing Zod validation at boundaries (Server Actions, API routes, wallet inputs)
- Inlined types that should live in `types/`

### Next.js patterns
- `useEffect` used for data fetching (should be RSC or React Query)
- Mutations in Server Components
- Missing `loading.tsx` or `error.tsx` for async route segments
- `window` access without SSR guard

### Tailwind
- Classes concatenated with string interpolation instead of `cn()`
- Variants built with ternary chains instead of `cva()`
- Responsive classes missing

### DB
- Inline DB calls in components or pages (should be in `db/queries/`)
- Raw SQL strings outside of migrations
- Missing connection reuse (should use `db/client.ts`)

### Wallet / Web3
- Direct `window.ethereum` access
- Scattered wallet state outside `WalletProvider`
- Hardcoded chain IDs or contract addresses

## Output format
For each issue: file path + line range, one-line description, suggested fix.
Group by severity: Critical → Warning → Style.
