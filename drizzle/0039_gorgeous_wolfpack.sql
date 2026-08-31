ALTER TABLE `payments` ADD `callbackEventId` varchar(200);--> statement-breakpoint
ALTER TABLE `payments` ADD `callbackReceivedAt` timestamp;--> statement-breakpoint
ALTER TABLE `payments` ADD `callbackPayloadHash` varchar(64);--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_callback_event_unique` UNIQUE(`callbackEventId`);
