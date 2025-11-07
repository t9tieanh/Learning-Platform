/*
  Warnings:

  - Added the required column `customer_email` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_name` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `customer_email` VARCHAR(191) NOT NULL,
    ADD COLUMN `customer_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL;
