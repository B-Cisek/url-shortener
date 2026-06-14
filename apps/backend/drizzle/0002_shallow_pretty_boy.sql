CREATE TABLE "click_analytics_hourly" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"url_id" uuid NOT NULL,
	"hour" timestamp with time zone NOT NULL,
	"country_code" varchar(7) NOT NULL,
	"device_type" varchar(16) NOT NULL,
	"referrer_domain" varchar(253) NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_click_events" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "click_analytics_hourly" ADD CONSTRAINT "click_analytics_hourly_url_id_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "click_analytics_hourly_dimensions_unique" ON "click_analytics_hourly" USING btree ("url_id","hour","country_code","device_type","referrer_domain");--> statement-breakpoint
CREATE INDEX "click_analytics_hourly_url_hour_index" ON "click_analytics_hourly" USING btree ("url_id","hour");--> statement-breakpoint
CREATE INDEX "processed_click_events_processed_at_index" ON "processed_click_events" USING btree ("processed_at");
