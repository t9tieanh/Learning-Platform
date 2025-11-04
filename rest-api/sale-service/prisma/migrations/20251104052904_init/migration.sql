-- CreateTable
CREATE TABLE `Cart` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart_Item` (
    `id` VARCHAR(191) NOT NULL,
    `cart_id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `discount_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order_Item` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Payment_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Discount` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `type` ENUM('Percent', 'Amount') NOT NULL,
    `minOrderValue` DOUBLE NULL,
    `maxDiscount` DOUBLE NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Discount_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cart_Item` ADD CONSTRAINT `Cart_Item_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `Cart`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `Discount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order_Item` ADD CONSTRAINT `Order_Item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
