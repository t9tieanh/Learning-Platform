/*
  Warnings:

  - You are about to alter the column `status` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('Unconfirmed', 'Pending', 'Completed') NOT NULL DEFAULT 'Unconfirmed';
