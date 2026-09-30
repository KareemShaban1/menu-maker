-- AlterTable User: role + isActive
ALTER TABLE `User` ADD COLUMN `role` ENUM('user', 'super_admin') NOT NULL DEFAULT 'user';
ALTER TABLE `User` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable PlanConfig
CREATE TABLE `PlanConfig` (
    `id` VARCHAR(191) NOT NULL,
    `key` ENUM('free', 'restaurant', 'business') NOT NULL,
    `nameEn` VARCHAR(80) NOT NULL,
    `nameAr` VARCHAR(80) NOT NULL,
    `priceMonthly` INTEGER NOT NULL DEFAULT 0,
    `maxMenus` INTEGER NULL,
    `featuresEn` JSON NOT NULL,
    `featuresAr` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlanConfig_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Subscription
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `plan` ENUM('free', 'restaurant', 'business') NOT NULL,
    `status` ENUM('active', 'trial', 'past_due', 'canceled', 'expired') NOT NULL DEFAULT 'active',
    `startsAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endsAt` DATETIME(3) NULL,
    `notes` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Subscription_userId_idx`(`userId`),
    INDEX `Subscription_status_idx`(`status`),
    INDEX `Subscription_plan_idx`(`plan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable MenuTemplate
CREATE TABLE `MenuTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `category` VARCHAR(32) NOT NULL,
    `localId` INTEGER NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `nameAr` VARCHAR(120) NULL,
    `style` VARCHAR(120) NOT NULL,
    `styleAr` VARCHAR(120) NULL,
    `layoutKey` VARCHAR(64) NOT NULL,
    `gradient` TEXT NOT NULL,
    `accentColor` VARCHAR(32) NOT NULL,
    `iconKey` VARCHAR(64) NOT NULL,
    `pattern` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MenuTemplate_category_isActive_idx`(`category`, `isActive`),
    UNIQUE INDEX `MenuTemplate_category_localId_key`(`category`, `localId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
