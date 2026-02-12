-- AlterTable
ALTER TABLE `invitation` ADD COLUMN `allowDownload` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `organization` ADD COLUMN `tagEnabled` BOOLEAN NOT NULL DEFAULT true;
