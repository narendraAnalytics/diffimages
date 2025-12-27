CREATE TABLE "game_differences" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"difference_id" integer NOT NULL,
	"description" text NOT NULL,
	"box_2d" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"game_mode" varchar(10) NOT NULL,
	"subject" text,
	"score" integer DEFAULT 0 NOT NULL,
	"total_possible" integer,
	"found_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp NOT NULL,
	"time_remaining" integer NOT NULL,
	"completion_status" varchar(20) NOT NULL,
	"original_image" text,
	"modified_image" text,
	"single_image" text,
	"logic_question" text,
	"logic_solution" text,
	"logic_title" text
);
--> statement-breakpoint
CREATE TABLE "user_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"answer_text" text NOT NULL,
	"points_awarded" integer NOT NULL,
	"found_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_differences" ADD CONSTRAINT "game_differences_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "game_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "game_sessions" USING btree ("created_at");