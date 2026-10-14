ALTER TABLE "sessions" ADD COLUMN "refresh_token_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "previous_refresh_token_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "refresh_rotated_at" timestamp;