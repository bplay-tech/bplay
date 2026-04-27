-- Rename enum value SELLER -> USER in user_role enum
ALTER TYPE "public"."user_role" RENAME VALUE 'SELLER' TO 'USER';--> statement-breakpoint

-- Update default value on users.role column
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
