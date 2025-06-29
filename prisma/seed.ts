import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create 5 users with hashed passwords
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        name: 'Diana',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'edward@example.com',
        name: 'Edward',
        password: await bcrypt.hash('password123', 10),
        role: 'ADMIN',
      },
    }),
  ]);

  const [alice, bob, charlie, diana, edward] = users;

  // Create categories
  const electronics = await prisma.category.create({ data: { name: 'Electronics' } });
  const office = await prisma.category.create({ data: { name: 'Office Supplies' } });

  // Create vendors
  const vendor1 = await prisma.vendor.create({
    data: { name: 'TechNova', website: 'https://technova.example.com' },
  });
  const vendor2 = await prisma.vendor.create({
    data: { name: 'OfficePro', website: 'https://officepro.example.com' },
  });

  // Create products
  await prisma.product.createMany({
    data: [
      {
        name: '4K Ultra Monitor',
        sku: 'TN-ULTRA-001',
        quantity: 12,
        price: 279.99,
        reorderThreshold: 5,
        categoryId: electronics.id,
        vendorId: vendor1.id,
        userId: edward.id,
      },
      {
        name: 'Wireless Mouse',
        sku: 'TN-MOUSE-101',
        quantity: 45,
        price: 24.99,
        reorderThreshold: 10,
        categoryId: electronics.id,
        vendorId: vendor1.id,
        userId: alice.id,
      },
      {
        name: 'Ergonomic Chair Mat',
        sku: 'OP-MAT-901',
        quantity: 18,
        price: 42.0,
        reorderThreshold: 8,
        categoryId: office.id,
        vendorId: vendor2.id,
        userId: bob.id,
      },
    ],
  });

  // Create blog posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Using AI for Inventory Forecasting',
        content: 'AI can help determine optimal reorder dates based on trends and seasonality.',
        published: true,
        authorId: edward.id,
      },
      {
        title: 'How We Designed the Product Deal Engine',
        content: 'Here\'s a breakdown of how Stack Inventory fetches real-time vendor deals.',
        published: true,
        authorId: diana.id,
      },
      {
        title: 'Integrating Prisma with NextAuth',
        content: 'Tips on linking session management to user roles and product permissions.',
        published: false,
        authorId: alice.id,
      },
    ],
  });

  console.log('🌱 Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
