ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id_document_type" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id_number" text;
