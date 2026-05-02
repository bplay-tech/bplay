CREATE TABLE "system_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "created_by" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_reads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "message_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "read_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "message_reads_message_user_unique" UNIQUE("message_id", "user_id")
);
--> statement-breakpoint
ALTER TABLE "system_messages"
  ADD CONSTRAINT "system_messages_created_by_users_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "message_reads"
  ADD CONSTRAINT "message_reads_message_id_system_messages_id_fk"
  FOREIGN KEY ("message_id") REFERENCES "public"."system_messages"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "message_reads"
  ADD CONSTRAINT "message_reads_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
