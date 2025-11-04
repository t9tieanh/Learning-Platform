import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create some discounts
  const discountPercent = await prisma.discount.create({
    data: {
      name: 'Welcome 10% Off',
      code: 'WELCOME10',
      value: 10,
      type: 'Percent',
      minOrderValue: 0,
      maxDiscount: 100000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  const discountAmount = await prisma.discount.create({
    data: {
      name: 'Holiday 50K',
      code: 'HOLIDAY50K',
      value: 50000,
      type: 'Amount',
      minOrderValue: 200000,
      maxDiscount: 50000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    },
  });

  // Create a few carts for sample users (user_id is a string in this schema)
  const carts = [];
  for (let i = 1; i <= 3; i++) {
    const cart = await prisma.cart.create({ data: { user_id: `user-${i}` } });
    carts.push(cart);
  }

  // Create cart items
  await prisma.cart_Item.createMany({
    data: [
      { cart_id: carts[0].id, course_id: 'course-101', price: 199000 },
      { cart_id: carts[0].id, course_id: 'course-102', price: 299000 },
      { cart_id: carts[1].id, course_id: 'course-103', price: 499000 },
      { cart_id: carts[2].id, course_id: 'course-104', price: 149000 },
    ],
  });

  // Create an order for user-1 using discountPercent
  const order1 = await prisma.order.create({
    data: {
      user_id: 'user-1',
      status: 'PLACED',
      discount_id: discountPercent.id,
    },
  });

  // Add items to order1
  await prisma.order_Item.createMany({
    data: [
      { order_id: order1.id, course_id: 'course-101', price: 199000 },
      { order_id: order1.id, course_id: 'course-102', price: 299000 },
    ],
  });

  // Create payment for order1
  await prisma.payment.create({
    data: {
      order_id: order1.id,
      amount: 498000,
      method: 'CARD',
      status: 'PAID',
    },
  });

  // Create another order without discount
  const order2 = await prisma.order.create({
    data: {
      user_id: 'user-2',
      status: 'PENDING',
    },
  });

  await prisma.order_Item.create({
    data: { order_id: order2.id, course_id: 'course-103', price: 499000 } },
  );

  // Create order with amount discount
  const order3 = await prisma.order.create({
    data: {
      user_id: 'user-3',
      status: 'PLACED',
      discount_id: discountAmount.id,
    },
  });

  await prisma.order_Item.create({
    data: { order_id: order3.id, course_id: 'course-104', price: 149000 } },
  );

  await prisma.payment.create({
    data: {
      order_id: order3.id,
      amount: 99000, // after discount example
      method: 'CASH',
      status: 'PAID',
    },
  });

  console.log('✅ Seed completed:');
  console.log(`- Discounts: 2`);
  console.log(`- Carts: ${carts.length}`);
  console.log(`- Cart items: created via createMany`);
  console.log(`- Orders: 3`);
  console.log(`- Payments: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
