# BPLAY Partner Portal — Full System Implementation Plan

## Context

This plan builds the entire BPLAY Partner Portal on top of the already-initialized Next.js 16 scaffold. The portal is a financial/commission management system for BPLAY token partners with three roles (Seller, Admin, SuperAdmin), full auth, transaction tracking, affiliate management, BPLAY token purchase flow, payout requests, and team management.

The scaffold at `d:/Bplay/next` already has: Next.js 16, Tailwind v4, Drizzle+Neon, wagmi v3+viem, TanStack Query, zod, clsx, tailwind-merge, cva. What does NOT exist yet: any UI, any features, any auth, any stores, or complete schema tables.

**Key architectural decisions:**
- `partner_tiers` is a seeded DB table (not an enum). Users hold a FK `partner_tier_id`.
- Commission rate lives on `partner_tiers`, not on users.
- `user_settings` is a separate one-to-one table (payout method, wallet address).
- `user_notifications` is a separate one-to-one table (notification toggles).
- `affiliations` is a proper many-to-one relationship table — no `affiliated_by` FK on users.
- `exchange_rates` is a DB table managed by SuperAdmin (not a hardcoded env var).
- `transactions` has no `commission` field — only `amount`. Commission is computed on the fly from `partner_tiers.commission_rate` when needed.
- Exchange rate for BPLAY purchases is fetched from DB at request time and locked into the `bplay_purchases` row.

---

## Step 0 — Install New Packages

```bash
npm install next-auth@beta bcryptjs zustand lucide-react resend
npm install @radix-ui/react-dialog @radix-ui/react-switch @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-slot
npm install -D @types/bcryptjs tsx
```

---

## Step 1 — Environment Variables

### `.env.local` — append to existing file:
```
NEXTAUTH_SECRET=a-long-random-secret-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_xxxxxxxx
ALCHEMY_WEBHOOK_SECRET=xxxxxxxx
NEXT_PUBLIC_TREASURY_USDC_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```
Note: `NEXT_PUBLIC_BPLAY_EXCHANGE_RATE` is REMOVED — rate is now fetched from DB.

### `.env.example` — append same keys with placeholder values

### `next.config.ts` — add:
```ts
experimental: { authInterrupts: true }
```

---

## Step 2 — Database Schema

> All tables are new. The old `users` table (which only had `wallet_address`) is fully replaced by a new migration. Run `npm run db:generate` then `npm run db:push` after writing all schema files.

---

### `db/schema/partner-tiers.ts` — NEW (seeded)
```ts
import { pgTable, uuid, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const partnerTiers = pgTable("partner_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),            // "Bronze" | "Silver" | "Gold"
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
  minSalesThreshold: integer("min_sales_threshold").notNull().default(0),
  color: text("color").notNull(),                   // e.g. "#CD7F32" for badge styling
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PartnerTier = typeof partnerTiers.$inferSelect;
export type NewPartnerTier = typeof partnerTiers.$inferInsert;
```

Seed data (in `db/seed.ts`):
```
Bronze | commission_rate: 5.00 | min_sales_threshold: 0  | color: #CD7F32
Silver | commission_rate: 8.00 | min_sales_threshold: 10 | color: #9CA3AF
Gold   | commission_rate: 12.00| min_sales_threshold: 25 | color: #F59E0B
```

---

### `db/schema/users.ts` — REWRITE (breaking change)
```ts
import { pgTable, text, uuid, timestamp, boolean, pgEnum, type AnyPgColumn } from "drizzle-orm/pg-core";
import { partnerTiers } from "./partner-tiers";

export const userRoleEnum = pgEnum("user_role", ["SELLER", "ADMIN", "SUPER_ADMIN"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("SELLER"),
  partnerTierId: uuid("partner_tier_id").notNull().references(() => partnerTiers.id),
  referralCode: text("referral_code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

---

### `db/schema/affiliations.ts` — NEW
One-to-many: one affiliate (partner) → many referred users.
```ts
import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const affiliations = pgTable("affiliations", {
  id: uuid("id").defaultRandom().primaryKey(),
  affiliateId: uuid("affiliate_id").notNull().references(() => users.id),
  referredUserId: uuid("referred_user_id").notNull().unique().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Affiliation = typeof affiliations.$inferSelect;
export type NewAffiliation = typeof affiliations.$inferInsert;
```

---

### `db/schema/user-settings.ts` — NEW (one-to-one with users)
```ts
import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const payoutMethodEnum = pgEnum("payout_method", ["USDC", "BANK_TRANSFER"]);

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id),
  walletAddress: text("wallet_address"),
  preferredPayoutMethod: payoutMethodEnum("preferred_payout_method").notNull().default("USDC"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
```

---

### `db/schema/user-notifications.ts` — NEW (one-to-one with users)
```ts
import { pgTable, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userNotifications = pgTable("user_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id),
  newSale: boolean("new_sale").notNull().default(true),
  weeklyReport: boolean("weekly_report").notNull().default(true),
  payoutConfirm: boolean("payout_confirm").notNull().default(true),
  teamActivity: boolean("team_activity").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserNotifications = typeof userNotifications.$inferSelect;
```

---

### `db/schema/exchange-rates.ts` — NEW (DB-managed, admin-editable)
```ts
import { pgTable, uuid, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const exchangeRates = pgTable("exchange_rates", {
  id: uuid("id").defaultRandom().primaryKey(),
  rate: numeric("rate", { precision: 12, scale: 6 }).notNull(),    // USDC → BPLAY rate (e.g. 6.67)
  usdcContractAddress: text("usdc_contract_address").notNull(),
  treasuryAddress: text("treasury_address").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ExchangeRate = typeof exchangeRates.$inferSelect;
```

Seed data:
```
rate: 6.67
usdc_contract_address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
treasury_address: 0x0000000000000000000000000000000000000000
```

---

### `db/schema/transactions.ts` — NEW
No `commission` column — just `amount`. Commission is computed from `partner_tiers.commission_rate` on the fly.
```ts
import { pgTable, uuid, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const txTypeEnum = pgEnum("tx_type", ["SALE", "PAYOUT", "REFERRAL"]);
export const txStatusEnum = pgEnum("tx_status", ["pending", "confirmed", "failed"]);

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: txTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),   // USD amount
  buyerWallet: text("buyer_wallet"),
  txHash: text("tx_hash"),
  status: txStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
```

---

### `db/schema/payout-requests.ts` — NEW
```ts
import { pgTable, uuid, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { payoutMethodEnum } from "./user-settings";

export const payoutStatusEnum = pgEnum("payout_status", ["pending", "approved", "rejected"]);

export const payoutRequests = pgTable("payout_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  walletAddress: text("wallet_address"),
  payoutMethod: payoutMethodEnum("payout_method").notNull(),
  status: payoutStatusEnum("status").notNull().default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type NewPayoutRequest = typeof payoutRequests.$inferInsert;
```

---

### `db/schema/bplay-purchases.ts` — NEW
```ts
import { pgTable, uuid, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const bplayStatusEnum = pgEnum("bplay_status", [
  "pending_payment", "payment_confirmed", "tokens_transferred", "failed"
]);

export const bplayPurchases = pgTable("bplay_purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  usdcAmount: numeric("usdc_amount", { precision: 12, scale: 2 }).notNull(),
  bplayAmount: numeric("bplay_amount", { precision: 18, scale: 6 }).notNull(),
  exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 }).notNull(), // locked at purchase time
  buyerWallet: text("buyer_wallet").notNull(),
  txHash: text("tx_hash").unique(),
  status: bplayStatusEnum("status").notNull().default("pending_payment"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BplayPurchase = typeof bplayPurchases.$inferSelect;
export type NewBplayPurchase = typeof bplayPurchases.$inferInsert;
```

---

### `db/schema/index.ts` — REWRITE barrel
```ts
export * from "./partner-tiers";
export * from "./users";
export * from "./affiliations";
export * from "./user-settings";
export * from "./user-notifications";
export * from "./exchange-rates";
export * from "./transactions";
export * from "./payout-requests";
export * from "./bplay-purchases";
```

### After all schema files:
```bash
npm run db:generate
npm run db:push
npm run db:seed    # must run seed before any login works
```

---

## Step 3 — Database Queries

### `db/queries/partner-tiers.ts` — NEW
```ts
getAllPartnerTiers() → PartnerTier[]
getPartnerTierById(id) → PartnerTier | null
getPartnerTierByName(name) → PartnerTier | null   // used in seed + auth
updatePartnerTier(id, data) → PartnerTier          // SuperAdmin only
```

### `db/queries/exchange-rates.ts` — NEW
```ts
getCurrentExchangeRate() → ExchangeRate | null     // ORDER BY updated_at DESC LIMIT 1
updateExchangeRate(data, updatedBy) → ExchangeRate // SuperAdmin only — inserts new row
```

### `db/queries/users.ts` — REWRITE
```ts
getUserById(id) → User | null
getUserByEmail(email) → User | null
getUserByReferralCode(code) → User | null
createUser(data: NewUser) → User
updateUser(id, data: Partial<NewUser>) → User
getAllUsers() → (User & { tier: PartnerTier })[]   // JOIN partner_tiers
getUsersByAffiliator(affiliateId) → (User & { tier: PartnerTier })[]  // via affiliations JOIN
```
Note: `incrementReferralClicks` is REMOVED — referral count is derived from the `affiliations` table.

### `db/queries/affiliations.ts` — NEW
```ts
createAffiliation(data: NewAffiliation) → Affiliation
getAffiliationByReferredUser(referredUserId) → Affiliation | null
getAffiliationsByAffiliate(affiliateId) → Affiliation[]
countReferrals(affiliateId) → number
// SELECT COUNT(*) FROM affiliations WHERE affiliate_id = ?
// This replaces referral_clicks on users — total sign-ups via this user's link
```

### `db/queries/user-settings.ts` — NEW
```ts
getSettingsByUser(userId) → UserSettings | null
upsertSettings(userId, data) → UserSettings       // INSERT ... ON CONFLICT DO UPDATE
```

### `db/queries/user-notifications.ts` — NEW
```ts
getNotificationsByUser(userId) → UserNotifications | null
upsertNotifications(userId, data) → UserNotifications
```

### `db/queries/transactions.ts` — NEW
```ts
// Filters type used by both query function and API route
type TransactionFilters = {
  from?: Date;       // createdAt >= from
  to?: Date;         // createdAt <= to
  type?: "SALE" | "PAYOUT" | "REFERRAL";
  status?: "pending" | "confirmed" | "failed";
};

getTransactionsByUser(userId, filters?: TransactionFilters) → Transaction[]
getAllTransactions(filters?: TransactionFilters) → (Transaction & { userName: string })[]
getTeamTransactions(affiliateId, filters?: TransactionFilters) → Transaction[]
  // JOIN affiliations to get all referred users' txns
createTransaction(data: NewTransaction) → Transaction
getDashboardStats(userId) → {
  totalEarnings: number,   // SUM(amount) WHERE type IN ('SALE','REFERRAL') AND status='confirmed'
  pendingAmount: number,   // SUM(amount) WHERE status='pending'
  totalSales: number,      // COUNT WHERE type='SALE' AND status='confirmed'
}
getAvailableBalance(userId) → number
// = SUM(amount WHERE type IN ('SALE','REFERRAL') AND status='confirmed')
// - SUM(amount WHERE type='PAYOUT' AND status='confirmed')
```
> IMPORTANT: Drizzle `sum()` returns `string | null`. Always parse: `parseFloat(result ?? "0")`.

### `app/api/transactions/route.ts` — NEW (date-filtered API endpoint)
```ts
// GET /api/transactions?from=2026-01-01&to=2026-04-30&type=SALE&status=confirmed
// Role-based: Seller sees own, Admin sees team, SuperAdmin sees all
// Returns JSON array of transactions

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const filters: TransactionFilters = {
    from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
    to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
    type: (searchParams.get("type") as TransactionFilters["type"]) ?? undefined,
    status: (searchParams.get("status") as TransactionFilters["status"]) ?? undefined,
  };

  const role = session.user.role;
  const userId = session.user.id;

  const transactions =
    role === "SUPER_ADMIN" ? await getAllTransactions(filters) :
    role === "ADMIN" ? await getTeamTransactions(userId, filters) :
    await getTransactionsByUser(userId, filters);

  return Response.json(transactions);
}
```

The Sales & Referrals page uses this API via TanStack Query with filter state:
```ts
// features/transactions/hooks.ts
export const useTransactions = (filters: TransactionFilters) =>
  useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetch(`/api/transactions?${new URLSearchParams(buildParams(filters))}`).then(r => r.json()),
  });
```

### `db/queries/payout-requests.ts` — NEW
```ts
getPayoutRequestsByUser(userId) → PayoutRequest[]
getAllPayoutRequests() → (PayoutRequest & { userName: string })[]
getPendingPayoutByUser(userId) → PayoutRequest | null
createPayoutRequest(data) → PayoutRequest
approvePayoutRequest(id, reviewerId) → void
// Uses db.transaction() for atomicity:
//   1. UPDATE payout_requests SET status='approved'...
//   2. INSERT INTO transactions (type='PAYOUT', amount=req.amount, status='confirmed')
rejectPayoutRequest(id, reviewerId) → void
```

### `db/queries/bplay-purchases.ts` — NEW
```ts
getBplayPurchasesByUser(userId) → BplayPurchase[]
getAllPendingPurchases() → (BplayPurchase & { userName: string })[]
createBplayPurchase(data) → BplayPurchase
updateBplayPurchaseTxHash(id, txHash) → void   // sets tx_hash + status='payment_confirmed'
getPurchaseByTxHash(txHash) → BplayPurchase | null
approveBplayPurchase(id, approvedBy) → void    // status='tokens_transferred'
rejectBplayPurchase(id) → void                 // status='failed'
getBplayBalance(userId) → number               // SUM(bplay_amount) WHERE status='tokens_transferred'
```

---

## Step 4 — Seed File

### `db/seed.ts`
Seeds all required reference data + demo users. MUST run before any login works.

```ts
// 1. Seed partner_tiers
const tiers = await seedPartnerTiers([
  { name: "Bronze", commissionRate: "5.00", minSalesThreshold: 0, color: "#CD7F32" },
  { name: "Silver", commissionRate: "8.00", minSalesThreshold: 10, color: "#9CA3AF" },
  { name: "Gold", commissionRate: "12.00", minSalesThreshold: 25, color: "#F59E0B" },
]);

// 2. Seed exchange_rates
await seedExchangeRate({
  rate: "6.67",
  usdcContractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  treasuryAddress: "0x0000000000000000000000000000000000000000",
});

// 3. Seed demo users
await seedDemoUsers(tiers);  // uses bcrypt.hash, generates referral codes, creates user_settings + user_notifications rows

// 4. Seed sample transactions for demo seller (to populate dashboard)
await seedSampleTransactions(sellerUserId);
```

Add to `package.json`:
```json
"db:seed": "tsx db/seed.ts"
```

---

## Step 5 — Auth (NextAuth v5)

### `lib/auth.ts` — NextAuth configuration

Demo users are hardcoded credentials that bypass DB. Their `partnerTierId` references the seeded tier IDs — but since we can't know UUIDs at code-write time, store tier name in JWT and look up tier by name when needed server-side.

```ts
// JWT token includes: id, email, name, role, tierName, referralCode
// Session extends to include all of these
```

Demo users:
- `seller@bplay.io / seller123` → role: SELLER, tier: Silver
- `admin@bplay.io / admin123` → role: ADMIN, tier: Gold
- `super@bplay.io / super123` → role: SUPER_ADMIN, tier: Gold

The `authorize()` callback:
1. Checks demo credentials list (password plain-text compare, no bcrypt for demo)
2. Falls back to DB lookup + `bcrypt.compare`
3. Returns `{ id, email, name, role, tierName, referralCode }`

### `types/next-auth.d.ts`
```ts
interface Session {
  user: {
    id: string;
    role: string;
    tierName: string;   // "Bronze" | "Silver" | "Gold"
    referralCode: string;
  } & DefaultSession["user"];
}
```

### `lib/dal.ts`
```ts
verifySession() → session.user (redirects to /login if unauthenticated)
verifyRole(allowed: Role[]) → session.user (calls forbidden() if role not in allowed)
```

### `middleware.ts` (project root)
```ts
// Protects routes by role using req.auth from next-auth
// /dashboard/* → any authenticated user (redirect to /login if not)
// /dashboard/team → ADMIN | SUPER_ADMIN only
// /dashboard/purchases → SUPER_ADMIN only
// /dashboard/exchange-rate → SUPER_ADMIN only
```

---

## Step 6 — Lib Utilities

### `lib/tiers.ts`
Static display config keyed by tier name (for badge colors, labels). Does NOT store commission rates (those come from DB).
```ts
export const TIER_DISPLAY = {
  Bronze: { label: "Bronze Partner", color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" },
  Silver: { label: "Silver Partner", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/30" },
  Gold:   { label: "Gold Partner",   color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
} as const;
export type TierName = keyof typeof TIER_DISPLAY;
```

### `lib/exchange.ts`
```ts
// Fetches current rate from DB (server-side only)
export async function getExchangeRate(): Promise<ExchangeRate> {
  const rate = await getCurrentExchangeRate();
  if (!rate) throw new Error("No exchange rate configured");
  return rate;
}

export const QUICK_BUY_AMOUNTS = [10, 50, 100, 500] as const;
export const usdcToBplay = (usdc: number, rate: number) => usdc * rate;
export const formatUsd = (val: string | number) => `$${parseFloat(String(val)).toFixed(2)}`;
export const formatBplay = (val: string | number) => `${parseFloat(String(val)).toLocaleString()} BPLAY`;
```

### `lib/referral.ts`
Generates unique referral codes and builds referral URLs. (Same as before.)

### `app/globals.css` — add to existing `@theme` block:
```css
--color-bg: #0B0F1A;
--color-card: #121826;
--color-card-border: #1F2937;
--color-primary: #7C5CFF;
--color-primary-hover: #6D4FFF;
--color-accent: #8B5CF6;
--color-success: #22C55E;
--color-warning: #F59E0B;
--color-danger: #EF4444;
--color-muted: #9CA3AF;
--color-foreground: #E5E7EB;
```

---

## Step 7 — UI Component Library (`components/ui/`)

All use `cn()` from `lib/utils.ts`.

| Component | Key details |
|---|---|
| `Button.tsx` | cva: variants=`solid\|outline\|ghost\|danger\|success\|gradient\|link`, sizes=`sm\|md\|lg\|icon`, `loading?` prop shows Spinner + disables |
| `Input.tsx` | `label?`, `error?`, dark border, `ring-primary` focus, red error below |
| `Card.tsx` | `bg-card border border-card-border rounded-xl p-6` |
| `Badge.tsx` | cva: `success\|warning\|danger\|info\|purple\|gray`; `StatusBadge` maps status strings automatically |
| `Modal.tsx` | Wraps Radix Dialog; props: `open`, `onOpenChange`, `title`, `description?` |
| `Toggle.tsx` | Wraps Radix Switch; props: `checked`, `onCheckedChange`, `label` |
| `Select.tsx` | Wraps Radix Select; props: `value`, `onValueChange`, `options`, `label?`, `placeholder?` |
| `DropdownMenu.tsx` | Wraps Radix DropdownMenu; props: `trigger`, `items: {label, onClick, variant?}[]` |
| `Table.tsx` | Generic: `data`, `columns: Column<T>[]`, `keyExtractor`, `emptyMessage?`; client-side pagination (10/page) |
| `Avatar.tsx` | Initials from `name`, 6 color variants by `charCodeAt` |
| `CopyButton.tsx` | Clipboard copy; shows checkmark for 2s on success |
| `Spinner.tsx` | Animated circle; `className?` prop |

> **Radix Select + FormData gotcha:** Radix Select does not submit via native `FormData`. Always pair with `<input type="hidden" name="..." value={state} />`.

---

## Step 8 — Layout Components

### `components/layout/Sidebar.tsx` — Client Component
Uses `usePathname()` for active link highlight. Nav items:
- All roles: Overview, Sales & Referrals, Payouts, Buy BPLAY, Settings
- ADMIN + SUPER_ADMIN: Team
- SUPER_ADMIN only: Purchases, Exchange Rate

### `components/layout/Topbar.tsx` — Client Component
Notifications bell, Avatar (initials), user name, role label, logout dropdown.

### `app/(dashboard)/layout.tsx` — REWRITE
Server Component. Calls `verifySession()` → redirects to `/login` if not authenticated. Renders full sidebar + topbar shell, passes session to client layout components.

---

## Step 9 — Zustand Store

### `stores/ui.store.ts`
```ts
type UIStore = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
};
```

---

## Step 10 — Screen 1: Login (`/login`)

### `app/(auth)/layout.tsx`
Redirect authenticated users to `/dashboard/overview`.

### `app/(auth)/login/page.tsx` — FULL REWRITE
Layout: full-height dark page, BPLAY logo header, centered card area.

Structure:
- Header: BPLAY logo + "Partner Zone" pill
- `<LoginForm />` — client component with email/password, show/hide toggle, `useActionState` with `loginAction`
- `<DemoCredentials />` — 3 clickable cards (Seller 8%, Admin Team Manager, Superadmin Full Access) that auto-fill the form
- "Not a partner yet? Apply to become a partner" link

### `features/auth/actions.ts`
- `loginAction(formData)` → calls `signIn("credentials", ...)`, redirects to `/dashboard/overview` on success, returns `{ error }` on failure
- `logoutAction()` → calls `signOut({ redirectTo: "/login" })`

---

## Step 11 — Screen 2: Dashboard Overview (`/dashboard/overview`)

### `app/(dashboard)/overview/page.tsx` — Server Component
Fetches (all parallel via `Promise.all`):
- `verifySession()` → user session (includes `tierName`)
- `getDashboardStats(user.id)` → `{ totalEarnings, pendingAmount, totalSales }`
- `getBplayBalance(user.id)` → BPLAY token total
- `getTransactionsByUser(user.id)` → latest 5 for Recent Activity
- `getPartnerTierByName(user.tierName)` → `{ commissionRate, color, ... }`
- `countReferrals(user.id)` → number of users who signed up via this user's referral link (from `affiliations` table)
- Builds `referralUrl = buildReferralUrl(user.referralCode, process.env.NEXTAUTH_URL!)`

Renders:
- `<WelcomeBanner name commissionRate tierName />`
- `<StatsRow bplayBalance totalEarnings pendingAmount conversionRate totalSales totalReferrals />`
- `<AffiliateSection referralUrl totalReferrals commissionRate />` — referralUrl is a prop (not computed client-side)
- `<RecentActivity transactions />`

### Stat calculations:
- **BPLAY Balance**: `getBplayBalance()` → BPLAY amount + USD equivalent (bplay * currentRate from DB)
- **Total Earnings**: `SUM(amount WHERE type IN ('SALE','REFERRAL') AND status='confirmed')`
- **Pending Commission**: `SUM(amount WHERE status='pending')`
- **Referral count**: `countReferrals(userId)` → `COUNT(*) FROM affiliations WHERE affiliate_id = userId`
- **Conversion Rate**: `(totalSales / totalReferrals * 100)%` — guard divide-by-zero
- Note: `referral_clicks` column is REMOVED from `users`. The affiliations table is the source of truth for referral counts.

---

## Step 12 — Screen 3: Sales & Referrals (`/dashboard/sales`)

### `app/(dashboard)/sales/page.tsx` — Server Component
Fetches transactions based on role:
- SELLER: `getTransactionsByUser(user.id)`
- ADMIN: `getTeamTransactions(user.id)` — transactions of all users in their affiliate tree
- SUPER_ADMIN: `getAllTransactions()`

Renders `<SalesTable />` (client component — all data fetched from `/api/transactions` via TanStack Query with filter params).

### `SalesTable` client component:
- Local state: `filters: { from?, to?, type?, status? }` → drives `useTransactions(filters)` query
- **FilterBar**: date range pickers (from/to), type dropdown, status dropdown → updates filter state → query re-fetches
- **Table columns**: Type (Sale/Referral/Payout badge), Amount, Buyer wallet (truncated or "–"), Date, Status badge
  > No commission column — commission is not stored on transactions.
- **Export**: client-side CSV from current query results using `URL.createObjectURL(new Blob([csv], { type: "text/csv" }))`.

### API route: `app/api/transactions/route.ts`
`GET /api/transactions?from=&to=&type=&status=` — role-aware, date-filtered, returns JSON. (Full spec in Step 3 queries section.)

---

## Step 13 — Screen 4: Payouts (`/dashboard/payouts`)

### `app/(dashboard)/payouts/page.tsx` — Server Component
Fetches:
- `getAvailableBalance(user.id)` → current balance
- `getPayoutRequestsByUser(user.id)` → history
- If SUPER_ADMIN: `getAllPayoutRequests()` filtered to pending

Renders: `<PayoutStats>`, `<RequestPayoutButton>` (opens modal), `<PayoutHistory>`, and for SuperAdmin: `<PendingPayoutsTable>`.

### `features/payouts/actions.ts`
```ts
requestPayoutAction(formData):
  1. verifySession()
  2. Validate: amount >= 50
  3. Server-side: getAvailableBalance(user.id) — amount must be ≤ balance
  4. Check: getPendingPayoutByUser(user.id) — no existing pending request
  5. Wallet address required if method = USDC (Zod walletAddressSchema)
  6. createPayoutRequest(...)

approvePayoutAction(payoutId):
  1. verifyRole(["SUPER_ADMIN"])
  2. approvePayoutRequest(payoutId, user.id)  // db.transaction() — atomic

rejectPayoutAction(payoutId):
  1. verifyRole(["SUPER_ADMIN"])
  2. rejectPayoutRequest(payoutId, user.id)
```

---

## Step 14 — Screen 5: Settings (`/dashboard/settings`)

### `app/(dashboard)/settings/page.tsx` — Server Component
Fetches:
- `getUserById(user.id)` → for name/email/role
- `getSettingsByUser(user.id)` → payout method, wallet address
- `getNotificationsByUser(user.id)` → toggle states

Renders 3 separate client form components.

### Profile Section (`features/settings/components/ProfileForm.tsx`)
Fields: Full Name (editable), Email (read-only). Submit: `updateProfileAction`.

### Payout Settings Section (`features/settings/components/PayoutSettingsForm.tsx`)
Fields: Preferred Payout Method (Radix Select + hidden input), Wallet Address (Input).
Submit: `updatePayoutSettingsAction` → calls `upsertSettings(userId, data)`.

### Notifications Section (`features/settings/components/NotificationsForm.tsx`)
4 Toggle rows. On toggle change → immediate call to `updateNotificationsAction` (optimistic — toggle state updates instantly).
`updateNotificationsAction` → calls `upsertNotifications(userId, data)`.

### API route for notifications (alternative pattern for fast toggle updates):
`PATCH /api/settings/notifications` → body `{ field: "newSale", value: true }` → updates single field.
This avoids form resubmission for every toggle.

---

## Step 15 — Screen 6: Buy BPLAY (`/dashboard/buy`)

### `app/(dashboard)/buy/page.tsx` — Server Component
Fetches `getExchangeRate()` from DB. Passes `rate`, `treasuryAddress`, `usdcContractAddress` as props to client components. Rate is NOT from env var.

Renders:
1. **Deposit Address card**: treasury address (readonly input) + CopyButton + warning box
2. **Quick Buy card**: ConnectButton + 4 amount buttons (client)
3. **How It Works card**: 3 numbered steps
4. **Exchange Rate footer**: `1 USDC = {rate} BPLAY` — rate fetched from DB

### `features/purchases/components/QuickBuyButtons.tsx` — Client Component
Props: `rate: number`, `treasuryAddress: string`, `usdcContractAddress: string`.
On click:
1. `createBplayPurchaseAction(usdcAmount, buyerWallet)` → server creates purchase record with locked rate
2. `sendTransactionAsync` (wagmi) → ERC-20 USDC transfer calldata to treasury
3. `recordTxHashAction(purchaseId, txHash)` → updates purchase to `payment_confirmed`
4. Opens `<TransactionPendingModal>` — blocks navigation

### `features/purchases/components/TransactionPendingModal.tsx`
`onOpenChange={() => {}}` (noop — blocks overlay/ESC dismiss). Shows spinner, "Do not close this page", etherscan tx link, and a deliberate "I understand, close" button.

### `features/purchases/actions.ts`
```ts
createBplayPurchaseAction(usdcAmount, buyerWallet):
  1. verifySession()
  2. rate = await getExchangeRate()   // fetched from DB — locked into purchase row
  3. bplayAmount = usdcAmount * rate.rate
  4. createBplayPurchase({ userId, usdcAmount, bplayAmount, exchangeRate: rate.rate, buyerWallet })

recordTxHashAction(purchaseId, txHash):
  1. verifySession()
  2. updateBplayPurchaseTxHash(purchaseId, txHash)
```

---

## Step 16 — Screen 7: Team Management (`/dashboard/team`)

### `app/(dashboard)/team/page.tsx` — Server Component
Calls `verifyRole(["ADMIN", "SUPER_ADMIN"])` → `forbidden()` for SELLER.
ADMIN: `getUsersByAffiliator(user.id)` (via affiliations table JOIN).
SUPER_ADMIN: `getAllUsers()`.

Renders `<TeamTable members actorRole />`, `<CreateMemberButton />` (SuperAdmin only).

### Table columns:
Member (Avatar + name + email), Role badge, Commission % (from joined tier), Status (active/inactive badge), Actions (... dropdown for SuperAdmin: Deactivate).

### `features/team/actions.ts`
```ts
createUserAction(formData):
  1. verifyRole(["SUPER_ADMIN"])
  2. Validate: name, email, password (min 8), role
  3. bcrypt.hash(password, 12)
  4. generateUniqueReferralCode()
  5. getPartnerTierByName("Bronze") → get default Bronze tier ID
  6. createUser({ email, passwordHash, name, role, partnerTierId: bronzeTier.id, referralCode })
  7. createAffiliation({ affiliateId: actor.id, referredUserId: newUser.id })
  8. upsertSettings(newUser.id, {})           // create empty settings row
  9. upsertNotifications(newUser.id, {})      // create empty notifications row
  10. revalidatePath("/dashboard/team")

updateUserTierAction(userId, tierName):
  1. verifyRole(["SUPER_ADMIN"])
  2. getPartnerTierByName(tierName)
  3. updateUser(userId, { partnerTierId: tier.id })
```

---

## Step 17 — Screen 8: SuperAdmin Purchases (`/dashboard/purchases`)

### `app/(dashboard)/purchases/page.tsx` — Server Component
Calls `verifyRole(["SUPER_ADMIN"])` → `forbidden()` otherwise.
Fetches `getAllPendingPurchases()`.

### Table columns:
Buyer Wallet (formatted), USDC Paid, BPLAY to Allocate, Exchange Rate, Tx Hash (Etherscan link or "—"), Date, Status, Approve/Reject action buttons.

### Actions:
```ts
approvePurchaseAction(purchaseId):
  1. verifyRole(["SUPER_ADMIN"])
  2. approveBplayPurchase(purchaseId, user.id)   // sets tokens_transferred

rejectPurchaseAction(purchaseId):
  1. verifyRole(["SUPER_ADMIN"])
  2. rejectBplayPurchase(purchaseId)
```

---

## Step 18 — Exchange Rate Management (`/dashboard/exchange-rate`) — SUPER_ADMIN only

### `app/(dashboard)/exchange-rate/page.tsx` — Server Component
Shows current rate card + a form to update it.

### Fields:
- BPLAY rate (number input)
- USDC contract address (text)
- Treasury address (text)

### Action:
```ts
updateExchangeRateAction(formData):
  1. verifyRole(["SUPER_ADMIN"])
  2. Validate all fields with Zod
  3. updateExchangeRate({ rate, usdcContractAddress, treasuryAddress }, user.id)
     // Inserts a new row (audit trail of rate changes preserved)
  4. revalidatePath("/dashboard/exchange-rate")
  5. revalidatePath("/dashboard/buy")
```

---

## Step 19 — Alchemy Webhook

### `app/api/webhooks/alchemy/route.ts`
```ts
POST handler:
  1. Read raw body as text
  2. Verify HMAC-SHA256 signature against ALCHEMY_WEBHOOK_SECRET
  3. Parse JSON payload
  4. Extract txHash from payload.event.activity[0].hash
  5. Idempotency check: getPurchaseByTxHash(txHash) → skip if already recorded
  6. logger.info("New payment detected", { txHash })
  7. Return 200 { ok: true }
  // Note: auto-approval disabled — SuperAdmin approves manually via /dashboard/purchases
```

---

## Step 20 — Loading + Error Boundaries

Create `loading.tsx` (centered Spinner) and `error.tsx` (error message + retry button) for every segment:
- `app/(dashboard)/overview/`
- `app/(dashboard)/sales/`
- `app/(dashboard)/payouts/`
- `app/(dashboard)/settings/`
- `app/(dashboard)/buy/`
- `app/(dashboard)/team/`
- `app/(dashboard)/purchases/`
- `app/(dashboard)/exchange-rate/`

---

## Step 21 — Feature Index Barrels

Each `features/*/index.ts` exports only types, actions, and hooks needed by external modules.

---

## Critical Edge Cases & Guardrails

| Edge Case | Where Enforced | How |
|---|---|---|
| Payout minimum ($50) | `requestPayoutAction` | `amount < 50 → return error` |
| Payout > balance | `requestPayoutAction` | Server-side `getAvailableBalance` (not trusted from client) |
| Duplicate pending payout | `requestPayoutAction` | `getPendingPayoutByUser` check before create |
| Payout approval atomicity | `approvePayoutRequest` query | `db.transaction()` — UPDATE + INSERT in one tx |
| Commission calc accuracy | `getDashboardStats` | `SUM(amount)` from confirmed SALE/REFERRAL txns (no commission column) |
| Self-referral prevention | signup flow | `if (refCode === user.referralCode) return error` |
| Role escalation | `updateUserTierAction` / role actions | Only SUPER_ADMIN callable; user cannot modify own role |
| Webhook idempotency | Alchemy route | `getPurchaseByTxHash` before processing |
| Exchange rate lock | `createBplayPurchaseAction` | Rate fetched from DB at creation, stored in `bplay_purchases.exchange_rate` — not re-read at approval |
| Duplicate tx_hash | Schema | `bplay_purchases.tx_hash` has `.unique()` constraint |
| `sum()` null safety | All stats queries | `parseFloat(result ?? "0")` everywhere |
| Referral count accuracy | Overview stats | `COUNT(*) FROM affiliations WHERE affiliate_id = userId` — no denormalized counter |
| Demo users in DB queries | All queries | Demo user IDs are non-UUID strings → queries return `null` → guard with `if (!user)` or skip |
| Wallet required for USDC | `updatePayoutSettingsAction` | Zod `walletAddressSchema` when method = USDC |
| Radix Select + FormData | All Radix Selects | Pair with `<input type="hidden" name=... value={state} />` |
| Referral URL base | `AffiliateSection` | Computed server-side in page, passed as prop — NOT `window.location.origin` |
| `params` is Promise (Next 16) | Dynamic routes | `const { id } = await params` |
| `forbidden()` needs config | `next.config.ts` | `experimental: { authInterrupts: true }` |
| `upsertSettings`/`upsertNotifications` race | Settings upsert | `ON CONFLICT (user_id) DO UPDATE` — safe for concurrent calls |
| User creation side effects | `createUserAction` | Must create affiliation + settings + notifications rows atomically or check existence before insert |

---

## Implementation Order

```
 0. npm install (Step 0)
 1. Update .env.local, next.config.ts, globals.css (Step 1, 6)
 2. db/schema/partner-tiers.ts
 3. db/schema/users.ts (rewrite)
 4. db/schema/affiliations.ts
 5. db/schema/user-settings.ts
 6. db/schema/user-notifications.ts
 7. db/schema/exchange-rates.ts
 8. db/schema/transactions.ts
 9. db/schema/payout-requests.ts
10. db/schema/bplay-purchases.ts
11. db/schema/index.ts (barrel)
12. npm run db:generate → npm run db:push
13. All db/queries/* files (8 files)
14. lib/auth.ts, types/next-auth.d.ts, app/api/auth/[...nextauth]/route.ts, lib/dal.ts
15. middleware.ts
16. lib/tiers.ts, lib/exchange.ts, lib/referral.ts
17. db/seed.ts → npm run db:seed
18. components/ui/* (all 11 primitives)
19. components/layout/Sidebar.tsx, Topbar.tsx
20. components/wallet/ConnectButton.tsx
21. stores/ui.store.ts
22. app/(auth)/layout.tsx + app/(auth)/login/* + features/auth/*
23. app/(dashboard)/layout.tsx (full shell)
24. app/(dashboard)/page.tsx (redirect)
25. features/dashboard/* + app/(dashboard)/overview/*
26. features/transactions/* + app/(dashboard)/sales/* + app/api/transactions/route.ts
27. features/payouts/* + app/(dashboard)/payouts/*
28. features/settings/* + app/(dashboard)/settings/*
29. features/purchases/* (buy-side) + app/(dashboard)/buy/*
30. features/team/* + app/(dashboard)/team/*
31. features/purchases/* (approval) + app/(dashboard)/purchases/*
32. app/(dashboard)/exchange-rate/*
33. app/api/webhooks/alchemy/route.ts
34. loading.tsx + error.tsx for all dashboard segments
35. Feature index barrels (features/*/index.ts)
36. npx tsc --noEmit (must pass 0 errors)
```

---

## Verification Steps

1. `npm run dev` → no startup errors
2. `npx tsc --noEmit` → 0 errors
3. `/login` → full dark UI renders, demo cards auto-fill form
4. Login as `seller@bplay.io` → redirects to `/dashboard/overview`, shows Silver tier badge, 8% commission
5. Navigate to `/dashboard/team` as Seller → redirected to `/dashboard/overview` (middleware blocks)
6. Login as `super@bplay.io` → Team, Purchases, Exchange Rate all accessible
7. SuperAdmin visits `/dashboard/exchange-rate`, updates rate to 7.00 → Buy page shows new rate
8. SuperAdmin creates a Seller → appears in Team table, affiliation row created in DB
9. SuperAdmin adds SALE transaction for Seller → appears in Seller's Sales table
10. Seller goes to `/dashboard/payouts`, requests $100 payout → SuperAdmin sees pending request
11. SuperAdmin approves → PAYOUT transaction inserted atomically, balance decreases
12. Seller visits `/dashboard/buy`, connects MetaMask → QuickBuy triggers wallet → Pending modal blocks page close
13. SuperAdmin approves BPLAY purchase → BPLAY balance updates on Seller overview
14. Settings: update name saves; toggle notifications updates immediately; payout wallet saves
15. `npm run db:studio` → all 9 tables visible with correct schema
```
