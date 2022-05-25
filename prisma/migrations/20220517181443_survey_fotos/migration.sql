/*
  Warnings:

  - You are about to drop the `categoriesonposts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `User_role_id_fkey` ON `user`;

-- DropTable
DROP TABLE `categoriesonposts`;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `post`;

-- CreateTable
CREATE TABLE `Fotos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SurveyOnFotos` (
    `surveyId` INTEGER NOT NULL,
    `fotosId` INTEGER NOT NULL,

    PRIMARY KEY (`surveyId`, `fotosId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyOnFotos` ADD CONSTRAINT `SurveyOnFotos_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `survey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyOnFotos` ADD CONSTRAINT `SurveyOnFotos_fotosId_fkey` FOREIGN KEY (`fotosId`) REFERENCES `Fotos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
