CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "urls" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"longUrl" text NOT NULL,
	"shortCode" varchar(16) NOT NULL,
	"userId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone,
	CONSTRAINT "urls_shortCode_unique" UNIQUE("shortCode")
);
--> statement-breakpoint
ALTER TABLE "urls" ADD CONSTRAINT "urls_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "urls_user_id_index" ON "urls" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "urls_expires_at_index" ON "urls" USING btree ("expiresAt");
