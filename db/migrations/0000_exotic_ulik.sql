CREATE TYPE "public"."bplay_status" AS ENUM('pending_payment', 'payment_confirmed', 'tokens_transferred', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SELLER', 'ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."payout_method" AS ENUM('USDC', 'BANK_TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."tx_status" AS ENUM('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('SALE', 'PAYOUT', 'REFERRAL');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "affiliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"referred_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliations_referred_user_id_unique" UNIQUE("referred_user_id")
);
--> statement-breakpoint
CREATE TABLE "bplay_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"usdc_amount" numeric(12, 2) NOT NULL,
	"bplay_amount" numeric(18, 6) NOT NULL,
	"exchange_rate" numeric(12, 6) NOT NULL,
	"buyer_wallet" text NOT NULL,
	"tx_hash" text,
	"status" "bplay_status" DEFAULT 'pending_payment' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bplay_purchases_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rate" numeric(12, 6) NOT NULL,
	"usdc_contract_address" text NOT NULL,
	"treasury_address" text NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"min_sales_threshold" integer DEFAULT 0 NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_tiers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'SELLER' NOT NULL,
	"partner_tier_id" uuid NOT NULL,
	"referral_code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_address" text,
	"preferred_payout_method" "payout_method" DEFAULT 'USDC' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"new_sale" boolean DEFAULT true NOT NULL,
	"weekly_report" boolean DEFAULT true NOT NULL,
	"payout_confirm" boolean DEFAULT true NOT NULL,
	"team_activity" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_notifications_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "tx_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"buyer_wallet" text,
	"tx_hash" text,
	"status" "tx_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"wallet_address" text,
	"payout_method" "payout_method" NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliations" ADD CONSTRAINT "affiliations_affiliate_id_users_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliations" ADD CONSTRAINT "affiliations_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bplay_purchases" ADD CONSTRAINT "bplay_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bplay_purchases" ADD CONSTRAINT "bplay_purchases_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_partner_tier_id_partner_tiers_id_fk" FOREIGN KEY ("partner_tier_id") REFERENCES "public"."partner_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;