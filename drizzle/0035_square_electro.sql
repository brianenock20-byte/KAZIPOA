ALTER TABLE `notifications` ADD `smsStatus` enum('not_attempted','sent','skipped','failed') DEFAULT 'not_attempted' NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `smsSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `notifications` ADD `smsError` text;
