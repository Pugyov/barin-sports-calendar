-- CreateTable
CREATE TABLE `Task` (
    `id` VARCHAR(191) NOT NULL,
    `taskCode` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `phaseRule` VARCHAR(191) NULL,
    `owner` VARCHAR(191) NULL,
    `workLink` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `statusNormalized` VARCHAR(191) NULL DEFAULT 'planned',
    `notes` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `publishDate` DATETIME(3) NULL,
    `rawTypeText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Task_taskCode_key`(`taskCode`),
    INDEX `Task_publishDate_idx`(`publishDate`),
    INDEX `Task_dueDate_idx`(`dueDate`),
    INDEX `Task_startDate_idx`(`startDate`),
    INDEX `Task_statusNormalized_idx`(`statusNormalized`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TypeTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TypeTag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskType` (
    `taskId` VARCHAR(191) NOT NULL,
    `typeTagId` INTEGER NOT NULL,

    INDEX `TaskType_typeTagId_idx`(`typeTagId`),
    PRIMARY KEY (`taskId`, `typeTagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportBatch` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `importedBy` VARCHAR(191) NULL,
    `dryRun` BOOLEAN NOT NULL DEFAULT false,
    `createdCount` INTEGER NOT NULL DEFAULT 0,
    `updatedCount` INTEGER NOT NULL DEFAULT 0,
    `skippedCount` INTEGER NOT NULL DEFAULT 0,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportRowError` (
    `id` VARCHAR(191) NOT NULL,
    `importBatchId` VARCHAR(191) NOT NULL,
    `rowNumber` INTEGER NOT NULL,
    `taskCode` VARCHAR(191) NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ImportRowError_importBatchId_idx`(`importBatchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportBatchTask` (
    `importBatchId` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ImportBatchTask_taskId_idx`(`taskId`),
    PRIMARY KEY (`importBatchId`, `taskId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaskType` ADD CONSTRAINT `TaskType_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskType` ADD CONSTRAINT `TaskType_typeTagId_fkey` FOREIGN KEY (`typeTagId`) REFERENCES `TypeTag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportRowError` ADD CONSTRAINT `ImportRowError_importBatchId_fkey` FOREIGN KEY (`importBatchId`) REFERENCES `ImportBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportBatchTask` ADD CONSTRAINT `ImportBatchTask_importBatchId_fkey` FOREIGN KEY (`importBatchId`) REFERENCES `ImportBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportBatchTask` ADD CONSTRAINT `ImportBatchTask_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

