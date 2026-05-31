-- AlterTable
ALTER TABLE `orders` ADD COLUMN `payos_order_code` BIGINT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `orders_payos_order_code_key` ON `orders`(`payos_order_code`);
