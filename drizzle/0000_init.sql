CREATE TABLE `activity` (
	`id` varchar(64) NOT NULL,
	`action` varchar(16) NOT NULL,
	`target` varchar(64) NOT NULL,
	`target_id` varchar(64),
	`label` text NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaborations` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `collaborations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(32) NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT 'draft',
	`sort_order` int NOT NULL DEFAULT 0,
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(255),
	`course_id` varchar(64) NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT 'new',
	`source` varchar(120) NOT NULL DEFAULT '',
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` varchar(64) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`name` varchar(255) NOT NULL,
	`folder` varchar(191) NOT NULL,
	`mime` varchar(64) NOT NULL,
	`size` int NOT NULL DEFAULT 0,
	`width` int NOT NULL DEFAULT 0,
	`height` int NOT NULL DEFAULT 0,
	`source` varchar(16) NOT NULL DEFAULT 'seed',
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`show_on_home` boolean NOT NULL DEFAULT true,
	`show_on_partners_page` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT 'draft',
	`published_at` datetime(3),
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `posts_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `project_categories` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`label` varchar(120) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `project_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `project_categories_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `project_category_links` (
	`project_id` varchar(64) NOT NULL,
	`category_id` varchar(64) NOT NULL,
	CONSTRAINT `project_category_links_uq` UNIQUE(`project_id`,`category_id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT 'draft',
	`sort_order` int NOT NULL DEFAULT 0,
	`event_date` datetime,
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `singletons` (
	`key` varchar(64) NOT NULL,
	`doc` json NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `singletons_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(32) NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`status` varchar(16) NOT NULL DEFAULT 'draft',
	`sort_order` int NOT NULL DEFAULT 0,
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(64) NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(16) NOT NULL,
	`status` varchar(16) NOT NULL,
	`password_hash` varchar(255),
	`last_active_at` datetime(3),
	`doc` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `activity_created_idx` ON `activity` (`created_at`);--> statement-breakpoint
CREATE INDEX `activity_target_idx` ON `activity` (`target`);--> statement-breakpoint
CREATE INDEX `collaborations_order_idx` ON `collaborations` (`sort_order`);--> statement-breakpoint
CREATE INDEX `courses_status_order_idx` ON `courses` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `leads_course_idx` ON `leads` (`course_id`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_created_idx` ON `leads` (`created_at`);--> statement-breakpoint
CREATE INDEX `media_folder_idx` ON `media` (`folder`);--> statement-breakpoint
CREATE INDEX `media_created_idx` ON `media` (`created_at`);--> statement-breakpoint
CREATE INDEX `partners_order_idx` ON `partners` (`sort_order`);--> statement-breakpoint
CREATE INDEX `posts_status_published_idx` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `project_category_links_category_idx` ON `project_category_links` (`category_id`);--> statement-breakpoint
CREATE INDEX `projects_status_order_idx` ON `projects` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `students_status_order_idx` ON `students` (`status`,`sort_order`);