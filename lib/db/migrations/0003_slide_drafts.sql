CREATE TABLE `slide_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`talk_id` text NOT NULL,
	`section_id` text,
	`position` integer NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`points` text DEFAULT '[]' NOT NULL,
	`visual` text DEFAULT '' NOT NULL,
	`script` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `slide_drafts_talk_id_idx` ON `slide_drafts` (`talk_id`);