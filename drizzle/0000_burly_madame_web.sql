CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`project` text NOT NULL,
	`units` integer NOT NULL,
	`amount` integer NOT NULL,
	`state` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	`document` text NOT NULL,
	`digest` text NOT NULL,
	`signer` text,
	`signed_at` text,
	`payment_ref` text,
	`history` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `applications_owner_project` ON `applications` (`owner`,`project`);