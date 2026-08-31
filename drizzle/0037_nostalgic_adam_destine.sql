CREATE TABLE `interviewSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`vacancyId` int NOT NULL,
	`employerUserId` int NOT NULL,
	`seekerUserId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`note` text,
	`provider` varchar(64) NOT NULL DEFAULT 'pending',
	`roomName` varchar(180),
	`joinUrl` varchar(500),
	`accessTokenHash` varchar(128) NOT NULL,
	`accessTokenExpiresAt` timestamp NOT NULL,
	`status` enum('scheduled','accepted','declined','cancelled','completed','expired') NOT NULL DEFAULT 'scheduled',
	`emailStatus` enum('not_attempted','sent','skipped','failed') NOT NULL DEFAULT 'not_attempted',
	`smsStatus` enum('not_attempted','sent','skipped','failed') NOT NULL DEFAULT 'not_attempted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interviewSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `interview_sessions_application_idx` ON `interviewSessions` (`applicationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `interview_sessions_employer_idx` ON `interviewSessions` (`employerUserId`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `interview_sessions_seeker_idx` ON `interviewSessions` (`seekerUserId`,`scheduledAt`);
