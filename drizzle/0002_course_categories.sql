CREATE TABLE `course_categories` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`label` varchar(120) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `course_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_categories_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `category_id` varchar(64);--> statement-breakpoint
CREATE INDEX `courses_category_idx` ON `courses` (`category_id`);