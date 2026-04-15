import Logger from './logger';
import prismaService from '~/service/utils/prisma.service';
import { DEFAULT_VIP_PACKAGE } from '~/config/vip.config';

export const checkAndSeedData = async () => {
    try {
        // 1. Check and seed default VIP Package
        const vipCount = await prismaService.vipPackage.count();
        if (vipCount === 0) {
            await prismaService.vipPackage.create({
                data: DEFAULT_VIP_PACKAGE
            });
            Logger.info(`Seeded default VIP Package (${DEFAULT_VIP_PACKAGE.price} VND)`);
        } else {
            Logger.info(`Found ${vipCount} VIP Package(s) in database`);
        }

        // 2. Check and seed default Discounts
        const discountCount = await prismaService.discount.count();
        if (discountCount === 0) {
            const now = new Date();
            const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

            await prismaService.discount.createMany({
                data: [
                    {
                        name: 'Welcome 10% Off',
                        code: 'WELCOME10',
                        value: 10,
                        type: 'Percent',
                        minOrderValue: 0,
                        maxDiscount: 100000,
                        startDate: now,
                        endDate: endOfYear,
                    },
                    {
                        name: 'Fixed 5K Off',
                        code: 'FIX5K',
                        value: 5000,
                        type: 'Amount',
                        minOrderValue: 0,
                        maxDiscount: null,
                        startDate: now,
                        endDate: endOfYear,
                    },
                    {
                        name: 'Siêu Sale 50%',
                        code: 'SUPER50',
                        value: 50,
                        type: 'Percent',
                        minOrderValue: 0,
                        maxDiscount: 20000,
                        startDate: now,
                        endDate: endOfYear,
                    }
                ]
            });
            Logger.info('Seeded default Discounts (valid until end of year)');
        } else {
            Logger.info(`Found ${discountCount} Discount(s) in database`);
        }
    } catch (error) {
        Logger.error(`Seeding failed: ${error}`);
        throw error;
    }
}
