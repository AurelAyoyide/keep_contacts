-- AlterColumn firstName and lastName to be nullable
ALTER TABLE `contact` MODIFY `firstName` VARCHAR(191);
ALTER TABLE `contact` MODIFY `lastName` VARCHAR(191);

-- AddColumn nickname
ALTER TABLE `contact` ADD COLUMN `nickname` VARCHAR(191);

-- AddColumn professional fields
ALTER TABLE `contact` ADD COLUMN `organization` VARCHAR(191);
ALTER TABLE `contact` ADD COLUMN `jobTitle` VARCHAR(191);

-- AddColumn location fields
ALTER TABLE `contact` ADD COLUMN `address` VARCHAR(500);
ALTER TABLE `contact` ADD COLUMN `city` VARCHAR(191);
ALTER TABLE `contact` ADD COLUMN `country` VARCHAR(191);
