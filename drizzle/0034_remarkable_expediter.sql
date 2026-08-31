ALTER TABLE `applications` ADD `interviewAt` timestamp;--> statement-breakpoint
ALTER TABLE `applications` ADD `interviewNote` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `interviewResponse` enum('pending','accepted','declined') DEFAULT 'pending' NOT NULL;
