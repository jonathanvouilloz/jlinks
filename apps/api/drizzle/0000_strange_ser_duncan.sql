CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`logo_url` text,
	`profile_image_url` text,
	`primary_color` text DEFAULT '#000000',
	`secondary_color` text DEFAULT '#ffffff',
	`background_type` text DEFAULT 'solid',
	`background_value` text DEFAULT '#ffffff',
	`font_title` text DEFAULT 'Inter',
	`font_text` text DEFAULT 'Inter',
	`layout_type` text DEFAULT 'list',
	`bio` text,
	`meta_title` text,
	`meta_description` text,
	`is_published` integer DEFAULT false,
	`has_draft_changes` integer DEFAULT false,
	`vcard_enabled` integer DEFAULT false,
	`vcard_name` text,
	`vcard_email` text,
	`vcard_phone` text,
	`vcard_company` text,
	`vcard_website` text,
	`plan` text DEFAULT 'pro',
	`plan_expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`published_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_slug_unique` ON `clients` (`slug`);--> statement-breakpoint
CREATE TABLE `link_clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`clicked_at` text DEFAULT CURRENT_TIMESTAMP,
	`referrer` text,
	`user_agent` text,
	`country` text,
	`source` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`icon` text,
	`thumbnail_url` text,
	`social_preset` text,
	`custom_bg_color` text,
	`custom_text_color` text,
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`is_draft` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`viewed_at` text DEFAULT CURRENT_TIMESTAMP,
	`referrer` text,
	`user_agent` text,
	`country` text,
	`source` text,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`client_id` text,
	`role` text DEFAULT 'client',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);