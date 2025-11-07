import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create discounts useful for testing an order of 56_000
  // 1) 10% off (WELCOME10) -> 56_000 -> 50_400
  // 2) Fixed 5_000 off (FIX5K) -> 51_000
  // 3) 50% off but capped at 10_000 (MAX50_10K) -> cap applies -> 46_000
  // 4) Big amount that shouldn't apply for small orders (BIG50K) minOrderValue high

  const now = new Date();
  const in30d = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  const discountWelcome10 = await prisma.discount.create({
    data: {
      name: 'Welcome 10% Off',
      code: 'WELCOME10',
      value: 10,
      type: 'Percent',
      minOrderValue: 0,
      maxDiscount: 100000,
      startDate: now,
      endDate: in30d,
    },
  });

  const discountFix5k = await prisma.discount.create({
    data: {
      name: 'Fixed 5K Off',
      code: 'FIX5K',
      value: 5000,
      type: 'Amount',
      minOrderValue: 0,
      maxDiscount: null,
      startDate: now,
      endDate: in30d,
    },
  });

  const discountMax50k = await prisma.discount.create({
    data: {
      name: '50% Off (cap 10K)',
      code: 'MAX50_10K',
      value: 50,
      type: 'Percent',
      minOrderValue: 0,
      maxDiscount: 10000,
      startDate: now,
      endDate: in30d,
    },
  });

  const discountBig50k = await prisma.discount.create({
    data: {
      name: 'Big 50K Off (min 200K)',
      code: 'BIG50K',
      value: 50000,
      type: 'Amount',
      minOrderValue: 200000,
      maxDiscount: 50000,
      startDate: now,
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    },
  });

  // Create a few carts for sample users
  const carts = [];
  for (let i = 1; i <= 3; i++) {
    const cart = await prisma.cart.create({ data: { user_id: `user-${i}` } });
    carts.push(cart);
  }

  // Create cart items (note price fields exist on Cart_Item in your schema?)
  await prisma.cart_Item.createMany({
    data: [
      { cart_id: carts[0].id, course_id: 'course-101' },
      { cart_id: carts[0].id, course_id: 'course-102' },
      { cart_id: carts[1].id, course_id: 'course-103' },
      { cart_id: carts[2].id, course_id: 'course-104' },
    ],
  });

  // Create orders
  // Order A: user-1, no discount, with two items summing to 56_000 (for testing)
  // We'll use courses with prices 56_000 total in Order Items
  const orderA = await prisma.order.create({
    data: {
      user_id: 'user-1',
      status: 'Unconfirmed',
      customer_name: 'User One',
      customer_email: 'user1@example.com',
      total: 56000,
    },
  });

  await prisma.order_Item.createMany({
    data: [
      { order_id: orderA.id, course_id: 'course-201', price: 30000 },
      { order_id: orderA.id, course_id: 'course-202', price: 26000 },
    ],
  });

  // Order B: apply percent 10% (WELCOME10) -> 56_000 -> 50_400
  const orderB = await prisma.order.create({
    data: {
      user_id: 'user-2',
      status: 'Unconfirmed',
      customer_name: 'User Two',
      customer_email: 'user2@example.com',
      total: 56000,
      discount_id: discountWelcome10.id,
    },
  });

  await prisma.order_Item.createMany({
    data: [{ order_id: orderB.id, course_id: 'course-203', price: 56000 }],
  });

  // Order C: apply fixed 5k (FIX5K) -> 56_000 -> 51_000
  const orderC = await prisma.order.create({
    data: {
      user_id: 'user-3',
      status: 'Unconfirmed',
      customer_name: 'User Three',
      customer_email: 'user3@example.com',
      total: 56000,
      discount_id: discountFix5k.id,
    },
  });

  await prisma.order_Item.createMany({
    data: [{ order_id: orderC.id, course_id: 'course-204', price: 56000 }],
  });

  // Order D: apply capped percent MAX50_10K -> 56_000 raw deduction=28_000 cap=10_000 => 46_000
  const orderD = await prisma.order.create({
    data: {
      user_id: 'user-4',
      status: 'Unconfirmed',
      customer_name: 'User Four',
      customer_email: 'user4@example.com',
      total: 56000,
      discount_id: discountMax50k.id,
    },
  });

  await prisma.order_Item.createMany({
    data: [{ order_id: orderD.id, course_id: 'course-205', price: 56000 }],
  });

  console.log('✅ Seed completed:');
  console.log(`- Discounts: 4`);
  console.log(`- Carts: ${carts.length}`);
  console.log(`- Orders created: 4`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
