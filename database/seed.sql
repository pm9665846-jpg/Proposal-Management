-- ============================================================
-- Visit & Proposal Management System - Default / Seed Data
-- Run this AFTER schema.sql (tables must exist)
-- ============================================================

USE proposal_management;

-- ============================================================
-- Default Admin (system owner)
-- Login: admin@example.com / admin123
-- ============================================================
INSERT INTO `Admin` (`id`, `email`, `password`, `name`, `createdAt`, `updatedAt`)
VALUES (
  'clradmin000000000000001',
  'admin@example.com',
  '$2a$12$NZwgN8i/T4b3NoQZkpOAyu.OTv8EH/6bHp5sWgLCIjhr9fpZCdfk2',
  'System Admin',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- ============================================================
-- Default Users (created by Admin)
-- Login: john@example.com / user123  and  jane@example.com / user123
-- ============================================================
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`)
VALUES
  (
    'clruser1000000000000001',
    'john@example.com',
    '$2a$12$MtuhBPnZAxH..4tZxLAfAesxfm2mANBKubtLSj/TCzT8NmmaAJi.a',
    'John Doe',
    'user',
    NOW(3),
    NOW(3)
  ),
  (
    'clruser2000000000000002',
    'jane@example.com',
    '$2a$12$MtuhBPnZAxH..4tZxLAfAesxfm2mANBKubtLSj/TCzT8NmmaAJi.a',
    'Jane Smith',
    'user',
    NOW(3),
    NOW(3)
  )
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- ============================================================
-- Sample Clients (optional)
-- ============================================================
INSERT INTO `Client` (`id`, `name`, `address`, `phone`, `email`, `mapLocation`, `createdAt`, `updatedAt`)
VALUES
  (
    'clrclient10000000000001',
    'Acme Corp',
    '123 Business Ave, City',
    '+1 555-0100',
    'contact@acme.example.com',
    'https://maps.google.com/?q=123+Business+Ave',
    NOW(3),
    NOW(3)
  ),
  (
    'clrclient20000000000002',
    'Tech Solutions Ltd',
    '456 Innovation Rd',
    '+1 555-0200',
    'info@techsolutions.example.com',
    NULL,
    NOW(3),
    NOW(3)
  )
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- ============================================================
-- Sample Visits (optional - depends on User and Client IDs above)
-- ============================================================
INSERT INTO `Visit` (`id`, `scheduledDate`, `status`, `meetingNotes`, `followUpDate`, `createdAt`, `updatedAt`, `userId`, `clientId`)
VALUES
  (
    'clrvisit100000000000001',
    DATE_ADD(NOW(3), INTERVAL 2 DAY),
    'pending',
    NULL,
    NULL,
    NOW(3),
    NOW(3),
    'clruser1000000000000001',
    'clrclient10000000000001'
  ),
  (
    'clrvisit200000000000002',
    DATE_SUB(NOW(3), INTERVAL 1 DAY),
    'completed',
    'Discussed Q2 requirements. Follow-up next week.',
    DATE_ADD(NOW(3), INTERVAL 7 DAY),
    NOW(3),
    NOW(3),
    'clruser2000000000000002',
    'clrclient20000000000002'
  )
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- ============================================================
-- Sample Proposal (optional - one per visit)
-- ============================================================
INSERT INTO `Proposal` (`id`, `proposalDate`, `responseStatus`, `notes`, `createdAt`, `updatedAt`, `visitId`)
VALUES (
  'clrproposal000000000001',
  NOW(3),
  'pending',
  'Proposal sent. Awaiting response.',
  NOW(3),
  NOW(3),
  'clrvisit200000000000002'
)
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- ============================================================
-- Default login credentials (from above):
--   Admin: admin@example.com / admin123
--   User:  john@example.com / user123
--   User:  jane@example.com / user123
-- ============================================================
