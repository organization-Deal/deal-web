CREATE TABLE IF NOT EXISTS `investment_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`project` text NOT NULL,
	`share_bps` integer NOT NULL,
	`amount_satang` integer NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`consent_version` text NOT NULL,
	`status` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `investment_requests_owner_created` ON `investment_requests` (`owner`,`created`);