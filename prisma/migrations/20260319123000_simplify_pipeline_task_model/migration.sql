-- Drop legacy task type foreign keys so the join table can be retired.
ALTER TABLE `TaskType` DROP FOREIGN KEY `TaskType_taskId_fkey`;
ALTER TABLE `TaskType` DROP FOREIGN KEY `TaskType_typeTagId_fkey`;

-- Rename existing task type tables to reuse the populated catalog data.
RENAME TABLE `TaskType` TO `_TaskTypeLegacy`;
RENAME TABLE `TypeTag` TO `TaskType`;

-- Remove obsolete catalog metadata and add the new single-type relation.
ALTER TABLE `TaskType`
    DROP COLUMN `color`;

ALTER TABLE `Task`
    ADD COLUMN `taskTypeId` INTEGER NULL;

-- Ensure the fallback task type exists for migration.
INSERT INTO `TaskType` (`name`, `createdAt`, `updatedAt`)
SELECT 'Other', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
WHERE NOT EXISTS (
    SELECT 1 FROM `TaskType` WHERE `name` = 'Other'
);

-- Convert legacy free-text statuses into the new fixed workflow.
UPDATE `Task`
SET `status` = CASE
    WHEN `status` IS NULL OR TRIM(`status`) = '' THEN 'PLANNED'
    WHEN LOWER(TRIM(`status`)) IN ('done', 'article completed') THEN 'DONE'
    WHEN LOWER(TRIM(`status`)) LIKE '%progress%' THEN 'IN_PROGRESS'
    WHEN LOWER(TRIM(`status`)) LIKE '%block%' THEN 'BLOCKED'
    ELSE 'PLANNED'
END;

-- Collapse many-to-many task types into a single catalog reference, using the
-- alphabetically first legacy type or the Other fallback when none exists.
UPDATE `Task` AS `task`
LEFT JOIN (
    SELECT
        `legacy`.`taskId` AS `taskId`,
        MIN(`catalog`.`name`) AS `selectedName`
    FROM `_TaskTypeLegacy` AS `legacy`
    INNER JOIN `TaskType` AS `catalog` ON `catalog`.`id` = `legacy`.`typeTagId`
    GROUP BY `legacy`.`taskId`
) AS `selection` ON `selection`.`taskId` = `task`.`id`
INNER JOIN `TaskType` AS `resolved`
    ON `resolved`.`name` = COALESCE(`selection`.`selectedName`, 'Other')
SET `task`.`taskTypeId` = `resolved`.`id`;

-- Finalize the new task schema.
ALTER TABLE `Task`
    DROP INDEX `Task_taskCode_key`,
    DROP INDEX `Task_statusNormalized_idx`,
    DROP COLUMN `taskCode`,
    DROP COLUMN `statusNormalized`,
    DROP COLUMN `rawTypeText`,
    MODIFY `status` ENUM('PLANNED', 'IN_PROGRESS', 'DONE', 'BLOCKED') NOT NULL DEFAULT 'PLANNED',
    MODIFY `taskTypeId` INTEGER NOT NULL;

CREATE INDEX `Task_taskTypeId_idx` ON `Task`(`taskTypeId`);
CREATE INDEX `Task_status_idx` ON `Task`(`status`);

ALTER TABLE `Task`
    ADD CONSTRAINT `Task_taskTypeId_fkey`
        FOREIGN KEY (`taskTypeId`) REFERENCES `TaskType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Retire the legacy join table after data has been migrated.
DROP TABLE `_TaskTypeLegacy`;
