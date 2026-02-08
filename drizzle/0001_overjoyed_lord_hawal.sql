CREATE TABLE `bundles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`productIds` json,
	`discount` decimal(5,2),
	`featured` int DEFAULT 0,
	`active` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bundles_id` PRIMARY KEY(`id`),
	CONSTRAINT `bundles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `emailLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`emailType` enum('welcome','order_confirmation','product_delivery','download_link','receipt','support') NOT NULL,
	`orderId` int,
	`subject` varchar(255),
	`status` enum('pending','sent','failed','bounced') DEFAULT 'pending',
	`sentAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`bundleId` int,
	`productName` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`quantity` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`customerEmail` varchar(320),
	`customerName` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_stripeSessionId_unique` UNIQUE(`stripeSessionId`),
	CONSTRAINT `orders_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `productPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`orderId` int NOT NULL,
	`downloadToken` varchar(255),
	`downloadCount` int DEFAULT 0,
	`lastDownloadedAt` timestamp,
	`expiresAt` timestamp,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productPurchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `productPurchases_downloadToken_unique` UNIQUE(`downloadToken`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`longDescription` text,
	`price` decimal(10,2) NOT NULL,
	`category` enum('cto','growth','pm','workflows','prompts') NOT NULL,
	`fileUrl` varchar(512),
	`fileKey` varchar(512),
	`image` varchar(512),
	`featured` int DEFAULT 0,
	`active` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
