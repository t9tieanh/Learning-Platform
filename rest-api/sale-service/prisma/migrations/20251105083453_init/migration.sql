/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Cart_user_id_key` ON `Cart`(`user_id`);
