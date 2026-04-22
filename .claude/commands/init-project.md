# /init-project

Bootstrap a new Next.js + Tailwind + Neon DB + MetaMask project from scratch.

## Steps

### 1. Create Next.js app
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"
```

### 2. Install core dependencies
```bash
npm install @neondatabase/serverless drizzle-orm
npm install wagmi viem @tanstack/react-query
npm install clsx tailwind-merge class-variance-authority
npm install zod
npm install -D drizzle-kit @types/node
```

### 3. Create directory structure
```
mkdir -p app/(auth)/login app/(dashboard)
mkdir -p components/ui components/layout components/wallet
mkdir -p db/schema db/queries db/migrations
mkdir -p features lib types public
mkdir -p lib/abis
```

### 4. Create base files
- `db/client.ts` — Neon + Drizzle setup
- `lib/wagmi.ts` — wagmi config with MetaMask connector
- `lib/utils.ts` — `cn()`, `formatAddress()`, `checksumAddress()`
- `lib/contracts.ts` — contract addresses keyed by chain ID
- `lib/logger.ts` — structured logger (wraps console in dev, silent in prod)
- `lib/zod.ts` — shared Zod schemas
- `types/index.ts` — core domain types
- `drizzle.config.ts` — Drizzle Kit config
- `app/providers.tsx` — `WagmiConfig` + `QueryClientProvider` wrapper
- `app/layout.tsx` — root layout importing `Providers`
- `.env.local` template with `DATABASE_URL`, `NEXT_PUBLIC_CHAIN_ID`

### 5. Configure tsconfig.json
Ensure `"strict": true` and path alias `"@/*": ["./*"]`.

### 6. Confirm
Run `npx tsc --noEmit` — should pass with zero errors.
Run `npx drizzle-kit generate` — should succeed (empty schema is fine).
