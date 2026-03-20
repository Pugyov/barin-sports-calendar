ALTER TABLE `Task`
    ADD COLUMN `ownerUserId` VARCHAR(191) NULL;

UPDATE `Task` AS `task`
LEFT JOIN `User` AS `emailMatch`
    ON `emailMatch`.`isActive` = TRUE
    AND LOWER(TRIM(`emailMatch`.`email`)) = LOWER(TRIM(`task`.`owner`))
LEFT JOIN (
    SELECT
        MIN(`id`) AS `id`,
        LOWER(TRIM(`name`)) AS `normalizedName`
    FROM `User`
    WHERE `isActive` = TRUE
      AND `name` IS NOT NULL
      AND TRIM(`name`) <> ''
    GROUP BY LOWER(TRIM(`name`))
    HAVING COUNT(*) = 1
) AS `nameMatch`
    ON `nameMatch`.`normalizedName` = LOWER(TRIM(`task`.`owner`))
SET `task`.`ownerUserId` = COALESCE(`emailMatch`.`id`, `nameMatch`.`id`)
WHERE `task`.`owner` IS NOT NULL
  AND TRIM(`task`.`owner`) <> '';

CREATE INDEX `Task_ownerUserId_idx` ON `Task`(`ownerUserId`);

ALTER TABLE `Task`
    ADD CONSTRAINT `Task_ownerUserId_fkey`
        FOREIGN KEY (`ownerUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Task`
    DROP COLUMN `owner`;
