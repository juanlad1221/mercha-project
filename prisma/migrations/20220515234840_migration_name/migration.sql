/*
  Warnings:

  - You are about to drop the column `address` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `fantacy_name` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `long` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `survey` table. All the data in the column will be lost.
  - Added the required column `imagegroup_id` to the `survey` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_role_id_fkey` ON `user`;

-- AlterTable
ALTER TABLE `survey` DROP COLUMN `address`,
    DROP COLUMN `fantacy_name`,
    DROP COLUMN `lat`,
    DROP COLUMN `long`,
    DROP COLUMN `phone`,
    ADD COLUMN `imagegroup_id` INTEGER NOT NULL,
    MODIFY `mercha_id` INTEGER NULL,
    MODIFY `seller_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop_id` INTEGER NOT NULL,
    `fantacy_name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `lat` INTEGER NULL,
    `long` INTEGER NULL,
    `mercha_id` INTEGER NOT NULL,
    `seller_id` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
