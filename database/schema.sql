-- ============================================================
-- Visit & Proposal Management System - MySQL Schema
-- Single file with all CREATE statements
-- ============================================================

-- Create database (optional - comment out if database already exists)
CREATE DATABASE IF NOT EXISTS proposal_management
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE proposal_management;

-- ============================================================
-- Table: Admin (default system owner / admin login)
-- ============================================================
CREATE TABLE IF NOT EXISTS `Admin` (
  `id`        VARCHAR(191) NOT NULL,
  `email`     VARCHAR(191) NOT NULL,
  `password`  VARCHAR(191) NOT NULL,
  `name`      VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admin_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: User (created by Admin, can be assigned visits)
-- ============================================================
CREATE TABLE IF NOT EXISTS `User` (
  `id`        VARCHAR(191) NOT NULL,
  `email`     VARCHAR(191) NOT NULL,
  `password`  VARCHAR(191) NOT NULL,
  `name`      VARCHAR(191) NOT NULL,
  `role`      VARCHAR(191) NOT NULL DEFAULT 'user',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: Client (name, address, phone, email, map location)
-- ============================================================
CREATE TABLE IF NOT EXISTS `Client` (
  `id`          VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `address`     VARCHAR(191) NULL,
  `phone`       VARCHAR(191) NULL,
  `email`       VARCHAR(191) NULL,
  `mapLocation` VARCHAR(191) NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: Visit (assigned visits with status updates)
-- ============================================================
CREATE TABLE IF NOT EXISTS `Visit` (
  `id`            VARCHAR(191) NOT NULL,
  `scheduledDate` DATETIME(3) NOT NULL,
  `status`        VARCHAR(191) NOT NULL DEFAULT 'pending',
  `meetingNotes`  TEXT NULL,
  `followUpDate`   DATETIME(3) NULL,
  `createdAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `userId`        VARCHAR(191) NOT NULL,
  `clientId`      VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Visit_userId_fkey` (`userId`),
  KEY `Visit_clientId_fkey` (`clientId`),
  CONSTRAINT `Visit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Visit_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: Proposal (proposal tracking and response status)
-- ============================================================
CREATE TABLE IF NOT EXISTS `Proposal` (
  `id`             VARCHAR(191) NOT NULL,
  `proposalDate`   DATETIME(3) NOT NULL,
  `responseStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `notes`          TEXT NULL,
  `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `visitId`        VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Proposal_visitId_key` (`visitId`),
  CONSTRAINT `Proposal_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `Visit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- End of schema
-- ============================================================
