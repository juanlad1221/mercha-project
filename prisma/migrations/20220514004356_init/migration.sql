/*
  Warnings:

  - You are about to drop the column `image` on the `images` table. All the data in the column will be lost.
  - Added the required column `url` to the `Images` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_role_id_fkey` ON `user`;

-- AlterTable
ALTER TABLE `images` DROP COLUMN `image`,
    ADD COLUMN `url` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
