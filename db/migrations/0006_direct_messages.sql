CREATE TABLE "direct_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "from_user_id" uuid NOT NULL,
  "to_user_id" uuid NOT NULL,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "attachment_url" text,
  "attachment_name" text,
  "is_read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "direct_messages"
  ADD CONSTRAINT "direct_messages_from_user_id_users_id_fk"
  FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "direct_messages"
  ADD CONSTRAINT "direct_messages_to_user_id_users_id_fk"
  FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "system_messages" ADD COLUMN "attachment_url" text;
--> statement-breakpoint
ALTER TABLE "system_messages" ADD COLUMN "attachment_name" text;
