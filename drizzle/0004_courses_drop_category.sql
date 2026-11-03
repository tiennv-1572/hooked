ALTER TABLE `courses` MODIFY COLUMN `category_id` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` DROP COLUMN `category`;