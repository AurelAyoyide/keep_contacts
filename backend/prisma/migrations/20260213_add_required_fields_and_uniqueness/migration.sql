-- AddColumn requiredFields to Invitation
ALTER TABLE `invitation` ADD COLUMN `requiredFields` VARCHAR(500) NOT NULL DEFAULT 'firstName,lastName,phone';

-- AlterColumn phone to nullable
ALTER TABLE `contact` MODIFY `phone` VARCHAR(191);

-- AddColumn countryCode to Contact
ALTER TABLE `contact` ADD COLUMN `countryCode` VARCHAR(2) DEFAULT 'BJ';

-- AddIndex on email
CREATE INDEX `contact_email_idx` ON `contact`(`email`);

-- AddUniqueConstraint on (groupId, phone)
ALTER TABLE `contact` ADD CONSTRAINT `unique_phone_per_group` UNIQUE(`groupId`, `phone`);

-- AddUniqueConstraint on (groupId, email)
ALTER TABLE `contact` ADD CONSTRAINT `unique_email_per_group` UNIQUE(`groupId`, `email`);
