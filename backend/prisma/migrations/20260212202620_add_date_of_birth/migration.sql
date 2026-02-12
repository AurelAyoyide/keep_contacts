-- AlterTable
ALTER TABLE `contact` ADD COLUMN `dateOfBirth` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `exporttoken` MODIFY `format` VARCHAR(191) NOT NULL DEFAULT 'vcf';
