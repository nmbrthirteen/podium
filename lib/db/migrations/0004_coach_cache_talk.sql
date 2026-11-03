DROP INDEX `coach_cache_task_input`;--> statement-breakpoint
ALTER TABLE `coach_cache` ADD `talk_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `coach_cache_task_input` ON `coach_cache` (`task`,`input_hash`,`talk_id`);