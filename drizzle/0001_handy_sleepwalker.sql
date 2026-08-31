CREATE TABLE `applicationStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`seekerUserId` int NOT NULL,
	`employerUserId` int NOT NULL,
	`previousStatus` varchar(64) NOT NULL,
	`nextStatus` varchar(64) NOT NULL,
	`note` text,
	`interviewAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applicationStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vacancyId` int NOT NULL,
	`employerUserId` int NOT NULL,
	`seekerUserId` int NOT NULL,
	`seekerEmail` varchar(320),
	`coverNote` text,
	`cvDocumentId` int,
	`status` enum('applied','reviewing','shortlisted','interview','offered','hired','rejected') NOT NULL DEFAULT 'applied',
	`interviewAt` timestamp,
	`interviewNote` text,
	`interviewResponse` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNormalized` varchar(320) NOT NULL,
	`passwordHash` varchar(600) NOT NULL,
	`emailVerifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `authCredentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `authCredentials_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `authCredentials_emailNormalized_unique` UNIQUE(`emailNormalized`)
);
--> statement-breakpoint
CREATE TABLE `authEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(64) NOT NULL,
	`success` boolean NOT NULL,
	`requestId` varchar(120),
	`ipHash` varchar(128),
	`userAgentHash` varchar(128),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authRateLimits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subjectKey` varchar(320) NOT NULL,
	`attemptCount` int NOT NULL DEFAULT 0,
	`windowStartedAt` timestamp NOT NULL DEFAULT (now()),
	`blockedUntil` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `authRateLimits_id` PRIMARY KEY(`id`),
	CONSTRAINT `authRateLimits_subjectKey_unique` UNIQUE(`subjectKey`)
);
--> statement-breakpoint
CREATE TABLE `authSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`userId` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `authSessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `authTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('email_verification','password_reset') NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `authTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `employerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(180) NOT NULL,
	`registrationNumber` varchar(120),
	`industry` varchar(120),
	`location` varchar(120),
	`email` varchar(320),
	`phone` varchar(40),
	`profileImageKey` varchar(500),
	`profileImageUrl` varchar(600),
	`profileImageMimeType` varchar(120),
	`profileImageSize` int,
	`verified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `employerProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `employerSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employerUserId` int NOT NULL,
	`plan` enum('starter','business','enterprise') NOT NULL,
	`status` enum('pending','active','paused','expired','cancelled','rejected') NOT NULL DEFAULT 'pending',
	`maxVacancies` int NOT NULL,
	`maxCandidates` int NOT NULL,
	`paymentReference` varchar(160),
	`paymentAmountTzs` int,
	`rejectionReason` text,
	`startedAt` timestamp,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employerSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `moderationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vacancyId` int NOT NULL,
	`adminUserId` int NOT NULL,
	`action` varchar(64) NOT NULL,
	`reason` text,
	`previousStatus` varchar(64) NOT NULL,
	`nextStatus` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`applicationId` int,
	`vacancyId` int,
	`emailStatus` enum('not_attempted','sent','skipped','failed') NOT NULL DEFAULT 'not_attempted',
	`emailSentAt` timestamp,
	`emailError` text,
	`smsStatus` enum('not_attempted','sent','skipped','failed') NOT NULL DEFAULT 'not_attempted',
	`smsSentAt` timestamp,
	`smsError` text,
	`readAt` timestamp,
	`archivedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vacancyId` int NOT NULL,
	`employerUserId` int NOT NULL,
	`method` varchar(64) NOT NULL,
	`provider` varchar(80) NOT NULL,
	`amountTzs` int NOT NULL,
	`providerReference` varchar(160),
	`callbackEventId` varchar(200),
	`callbackReceivedAt` timestamp,
	`callbackPayloadHash` varchar(64),
	`state` enum('initiated','pending','successful','failed','cancelled','refunded') NOT NULL DEFAULT 'initiated',
	`evidenceNote` text,
	`adminNote` text,
	`receiptKey` varchar(255),
	`receiptUrl` varchar(500),
	`receiptName` varchar(180),
	`receiptMimeType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_callback_event_unique` UNIQUE(`callbackEventId`)
);
--> statement-breakpoint
CREATE TABLE `platformSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(120) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedByAdminUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `platformSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `savedVacancies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seekerUserId` int NOT NULL,
	`vacancyId` int NOT NULL,
	`folder` varchar(80) NOT NULL DEFAULT 'Unsorted',
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedVacancies_id` PRIMARY KEY(`id`),
	CONSTRAINT `savedVacancies_seeker_vacancy_unique` UNIQUE(`seekerUserId`,`vacancyId`)
);
--> statement-breakpoint
CREATE TABLE `seekerAccessEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seekerUserId` int NOT NULL,
	`employerUserId` int NOT NULL,
	`vacancyId` int,
	`documentId` int,
	`accessType` enum('profile','cv') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seekerAccessEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seekerCertifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seekerUserId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`issuer` varchar(180),
	`issueDate` varchar(30),
	`expiryDate` varchar(30),
	`credentialId` varchar(120),
	`credentialUrl` varchar(500),
	`attachmentName` varchar(180),
	`attachmentMimeType` varchar(120),
	`attachmentSize` int,
	`attachmentStorageKey` varchar(500),
	`attachmentStorageUrl` varchar(600),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seekerCertifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seekerDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seekerUserId` int NOT NULL,
	`documentType` enum('cv') NOT NULL DEFAULT 'cv',
	`fileName` varchar(180) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`fileSize` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seekerDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seekerEducation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seekerUserId` int NOT NULL,
	`institution` varchar(180) NOT NULL,
	`qualification` varchar(180) NOT NULL,
	`fieldOfStudy` varchar(180),
	`startYear` int,
	`endYear` int,
	`currentlyStudying` boolean NOT NULL DEFAULT false,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seekerEducation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seekerExperience` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seekerUserId` int NOT NULL,
	`employer` varchar(180) NOT NULL,
	`jobTitle` varchar(180) NOT NULL,
	`location` varchar(120),
	`startDate` varchar(30) NOT NULL,
	`endDate` varchar(30),
	`currentRole` boolean NOT NULL DEFAULT false,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seekerExperience_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seekerNotificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seekerUserId` int NOT NULL,
	`emailReviewing` int NOT NULL DEFAULT 1,
	`emailShortlisted` int NOT NULL DEFAULT 1,
	`emailInterview` int NOT NULL DEFAULT 1,
	`emailOffered` int NOT NULL DEFAULT 1,
	`emailHired` int NOT NULL DEFAULT 1,
	`emailRejected` int NOT NULL DEFAULT 1,
	`inAppReviewing` int NOT NULL DEFAULT 1,
	`inAppShortlisted` int NOT NULL DEFAULT 1,
	`inAppInterview` int NOT NULL DEFAULT 1,
	`inAppOffered` int NOT NULL DEFAULT 1,
	`inAppHired` int NOT NULL DEFAULT 1,
	`inAppRejected` int NOT NULL DEFAULT 1,
	`vacancyAlertsEnabled` int NOT NULL DEFAULT 1,
	`emailVacancyAlerts` int NOT NULL DEFAULT 1,
	`inAppVacancyAlerts` int NOT NULL DEFAULT 1,
	`vacancyAlertKeywordsEnabled` int NOT NULL DEFAULT 1,
	`vacancyAlertRegionsEnabled` int NOT NULL DEFAULT 1,
	`vacancyAlertCategoriesEnabled` int NOT NULL DEFAULT 1,
	`vacancyAlertKeywords` text,
	`vacancyAlertRegions` text,
	`vacancyAlertCategories` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seekerNotificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `seekerNotificationPreferences_seekerUserId_unique` UNIQUE(`seekerUserId`)
);
--> statement-breakpoint
CREATE TABLE `seekerSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seekerUserId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`level` varchar(40),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seekerSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketReference` varchar(40) NOT NULL,
	`requesterUserId` int,
	`requesterName` varchar(180) NOT NULL,
	`requesterEmail` varchar(320) NOT NULL,
	`message` text NOT NULL,
	`attachmentKey` varchar(500),
	`attachmentUrl` varchar(600),
	`attachmentName` varchar(180),
	`attachmentMimeType` varchar(120),
	`attachmentSize` int,
	`status` enum('open','in_progress','resolved') NOT NULL DEFAULT 'open',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`adminNote` text,
	`userReply` text,
	`userReplyAt` timestamp,
	`userReplyAttachmentKey` varchar(500),
	`userReplyAttachmentUrl` varchar(600),
	`userReplyAttachmentName` varchar(180),
	`userReplyAttachmentMimeType` varchar(120),
	`userReplyAttachmentSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `supportTickets_ticketReference_unique` UNIQUE(`ticketReference`)
);
--> statement-breakpoint
CREATE TABLE `vacancies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employerUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`company` varchar(180) NOT NULL,
	`category` varchar(120) NOT NULL,
	`location` varchar(120) NOT NULL,
	`contractType` varchar(40) NOT NULL DEFAULT 'Full-time',
	`salary` varchar(120),
	`description` text NOT NULL,
	`deadline` timestamp NOT NULL,
	`status` enum('draft','submitted','payment_pending','paid_pending_review','approved','live','changes_requested','rejected','expired','withdrawn') NOT NULL DEFAULT 'draft',
	`employerVerified` int NOT NULL DEFAULT 0,
	`paymentRequired` boolean NOT NULL DEFAULT true,
	`urgent` int NOT NULL DEFAULT 0,
	`isTest` int NOT NULL DEFAULT 0,
	`sourceName` varchar(180),
	`sourceType` varchar(40),
	`sourceUrl` varchar(700),
	`externalApplicationUrl` varchar(900),
	`employerAuthorized` int NOT NULL DEFAULT 1,
	`publicationStatus` varchar(40) NOT NULL DEFAULT 'standard',
	`testBatchId` varchar(100),
	`importedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vacancies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vacancyViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vacancyId` int NOT NULL,
	`viewerUserId` int,
	`viewerKey` varchar(180) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vacancyViews_id` PRIMARY KEY(`id`),
	CONSTRAINT `vacancy_views_unique_viewer_idx` UNIQUE(`vacancyId`,`viewerKey`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(40);--> statement-breakpoint
ALTER TABLE `users` ADD `accountType` enum('seeker','employer') DEFAULT 'seeker' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `accountTypeLocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isBlocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoKey` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoUrl` varchar(600);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoMimeType` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoSize` int;--> statement-breakpoint
CREATE INDEX `auth_events_user_created_idx` ON `authEvents` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `auth_sessions_user_expiry_idx` ON `authSessions` (`userId`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `auth_tokens_user_purpose_idx` ON `authTokens` (`userId`,`purpose`);--> statement-breakpoint
CREATE INDEX `interview_sessions_application_idx` ON `interviewSessions` (`applicationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `interview_sessions_employer_idx` ON `interviewSessions` (`employerUserId`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `interview_sessions_seeker_idx` ON `interviewSessions` (`seekerUserId`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `seeker_access_events_seeker_idx` ON `seekerAccessEvents` (`seekerUserId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `seeker_access_events_employer_idx` ON `seekerAccessEvents` (`employerUserId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `vacancies_test_batch_idx` ON `vacancies` (`isTest`,`testBatchId`);
