-- Move all SUPER_ADMIN users from Gold tier to Platinum tier
UPDATE "users"
SET "partner_tier_id" = (
  SELECT "id" FROM "partner_tiers" WHERE "name" = 'Platinum'
)
WHERE "role" = 'SUPER_ADMIN'
  AND "partner_tier_id" = (
    SELECT "id" FROM "partner_tiers" WHERE "name" = 'Gold'
  );
