ALTER TABLE "partner_tiers" RENAME COLUMN "min_sales_threshold" TO "min_turnover_usd";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cumulated_commissions" NUMERIC(12,2) NOT NULL DEFAULT 0;
--> statement-breakpoint
UPDATE "partner_tiers" SET "min_turnover_usd" = 0 WHERE "name" = 'Bronze';
--> statement-breakpoint
UPDATE "partner_tiers" SET "min_turnover_usd" = 50000 WHERE "name" = 'Silver';
--> statement-breakpoint
UPDATE "partner_tiers" SET "min_turnover_usd" = 120000 WHERE "name" = 'Gold';
--> statement-breakpoint
UPDATE "partner_tiers" SET "min_turnover_usd" = 300000 WHERE "name" = 'Platinum';
--> statement-breakpoint
INSERT INTO "partner_tiers" ("name", "commission_rate", "min_turnover_usd", "color")
VALUES ('Diamond', 20.00, 600000, '#B9F2FF')
ON CONFLICT ("name") DO UPDATE SET
  "commission_rate" = EXCLUDED."commission_rate",
  "min_turnover_usd" = EXCLUDED."min_turnover_usd",
  "color" = EXCLUDED."color";
