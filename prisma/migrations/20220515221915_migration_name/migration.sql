/*
  Warnings:

  - You are about to drop the column `id_comercio` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `id_mercha` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `id_seller` on the `survey` table. All the data in the column will be lost.
  - Added the required column `mercha_id` to the `survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_id` to the `survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_id` to the `survey` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_role_id_fkey` ON `user`;

-- AlterTable
ALTER TABLE `survey` DROP COLUMN `id_comercio`,
    DROP COLUMN `id_mercha`,
    DROP COLUMN `id_seller`,
    ADD COLUMN `mercha_id` INTEGER NOT NULL,
    ADD COLUMN `seller_id` INTEGER NOT NULL,
    ADD COLUMN `shop_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
