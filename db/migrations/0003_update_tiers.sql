-- Update commission rates for existing tiers
UPDATE "partner_tiers" SET "commission_rate" = '9.00' WHERE "name" = 'Bronze';
--> statement-breakpoint
UPDATE "partner_tiers" SET "commission_rate" = '11.00' WHERE "name" = 'Silver';
--> statement-breakpoint
UPDATE "partner_tiers" SET "commission_rate" = '13.50' WHERE "name" = 'Gold';
--> statement-breakpoint
-- Insert Platinum tier
INSERT INTO "partner_tiers" ("name", "commission_rate", "min_sales_threshold", "color")
VALUES ('Platinum', '17.00', 50, '#67E8F9')
ON CONFLICT ("name") DO UPDATE SET "commission_rate" = '17.00', "color" = '#67E8F9';
