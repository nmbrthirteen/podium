CREATE TABLE `briefs` (
	`talk_id` text PRIMARY KEY NOT NULL,
	`goal` text DEFAULT '' NOT NULL,
	`audience` text DEFAULT '' NOT NULL,
	`big_idea` text DEFAULT '' NOT NULL,
	`opening_line` text DEFAULT '' NOT NULL,
	`closing_line` text DEFAULT '' NOT NULL,
	`recovery_line` text DEFAULT '' NOT NULL,
	`back_pocket_question` text DEFAULT '' NOT NULL,
	`field_sources` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coach_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`task` text NOT NULL,
	`input_hash` text NOT NULL,
	`provider` text NOT NULL,
	`output` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coach_cache_task_input` ON `coach_cache` (`task`,`input_hash`);--> statement-breakpoint
CREATE TABLE `decks` (
	`id` text PRIMARY KEY NOT NULL,
	`talk_id` text NOT NULL,
	`file_name` text NOT NULL,
	`kind` text NOT NULL,
	`slide_count` integer NOT NULL,
	`path` text NOT NULL,
	`uploaded_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plan_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`talk_id` text NOT NULL,
	`day` text NOT NULL,
	`position` integer NOT NULL,
	`kind` text NOT NULL,
	`section_id` text,
	`minutes` integer NOT NULL,
	`completed_run_id` text
);
--> statement-breakpoint
CREATE TABLE `points` (
	`id` text PRIMARY KEY NOT NULL,
	`talk_id` text NOT NULL,
	`position` integer NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`example` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`talk_id` text NOT NULL,
	`source` text NOT NULL,
	`question` text NOT NULL,
	`answer` text DEFAULT '' NOT NULL,
	`example` text DEFAULT '' NOT NULL,
	`relevance` text DEFAULT '' NOT NULL,
	`surprised` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`talk_id` text NOT NULL,
	`session_id` text,
	`kind` text NOT NULL,
	`section_id` text,
	`started_at` text NOT NULL,
	`ended_at` text,
	`section_timings` text DEFAULT '[]' NOT NULL,
	`prediction` text DEFAULT '' NOT NULL,
	`observation` text DEFAULT '' NOT NULL,
	`recording_path` text,
	`excelled` text DEFAULT '' NOT NULL,
	`work_on` text DEFAULT '' NOT NULL,
	`challenge` text DEFAULT '' NOT NULL,
	`listener_feedback` text DEFAULT '' NOT NULL,
	`debriefed_at` text
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` text PRIMARY KEY NOT NULL,
	`talk_id` text NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`minutes` real NOT NULL,
	`keywords` text DEFAULT '[]' NOT NULL,
	`verbatim` text DEFAULT '' NOT NULL,
	`slide_numbers` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` text PRIMARY KEY NOT NULL,
	`deck_id` text NOT NULL,
	`number` integer NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`word_count` integer DEFAULT 0 NOT NULL,
	`thumbnail_path` text
);
--> statement-breakpoint
CREATE TABLE `talk_debriefs` (
	`talk_id` text PRIMARY KEY NOT NULL,
	`excelled` text DEFAULT '' NOT NULL,
	`work_on` text DEFAULT '' NOT NULL,
	`challenge` text DEFAULT '' NOT NULL,
	`confidence` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `talks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`depth` text NOT NULL,
	`stakes` text DEFAULT 'normal' NOT NULL,
	`starts_at` text NOT NULL,
	`length_minutes` integer NOT NULL,
	`nervousness` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
