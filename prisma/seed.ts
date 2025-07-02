import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create 5 users with hashed passwords using upsert to handle existing records
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        email: 'alice@example.com',
        name: 'Alice',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        email: 'bob@example.com',
        name: 'Bob',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'charlie@example.com' },
      update: {},
      create: {
        email: 'charlie@example.com',
        name: 'Charlie',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'diana@example.com' },
      update: {},
      create: {
        email: 'diana@example.com',
        name: 'Diana',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'edward@example.com' },
      update: {},
      create: {
        email: 'edward@example.com',
        name: 'Edward',
        password: await bcrypt.hash('password123', 10),
      },
    }),
  ]);

  const [alice, bob, charlie, diana, edward] = users;

  // Create admin entry in the Admin table - this is how Edward becomes an admin
  await prisma.admin.upsert({
    where: { userId: edward.id },
    update: {},
    create: { userId: edward.id },
  });

  // Create categories using upsert
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });
  const office = await prisma.category.upsert({
    where: { name: 'Office Supplies' },
    update: {},
    create: { name: 'Office Supplies' },
  });
  const hardware = await prisma.category.upsert({
    where: { name: 'Hardware' },
    update: {},
    create: { name: 'Hardware' },
  });

  // Create vendors with conditional creation
  let vendor1 = await prisma.vendor.findFirst({ where: { name: 'TechNova' } });
  if (!vendor1) {
    vendor1 = await prisma.vendor.create({
      data: { name: 'TechNova', website: 'https://technova.example.com' },
    });
  }

  let vendor2 = await prisma.vendor.findFirst({ where: { name: 'OfficePro' } });
  if (!vendor2) {
    vendor2 = await prisma.vendor.create({
      data: { name: 'OfficePro', website: 'https://officepro.example.com' },
    });
  }

  let vendor3 = await prisma.vendor.findFirst({ where: { name: 'Hardware Solutions' } });
  if (!vendor3) {
    vendor3 = await prisma.vendor.create({
      data: { name: 'Hardware Solutions', website: 'https://hwsolutions.example.com' },
    });
  }

  // Create products using upsert to handle existing SKUs
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'TN-ULTRA-001' },
      update: {},
      create: {
        name: '4K Ultra Monitor',
        sku: 'TN-ULTRA-001',
        quantity: 12,
        price: 279.99,
        reorderThreshold: 5,
        categoryId: electronics.id,
        vendorId: vendor1.id,
        userId: edward.id,
        unitOfMeasure: 'EACH',
        location: 'Warehouse A-1',
        barcode: '123456789012',
        leadTime: 7,
        minimumOrderQuantity: 2,
        notes: 'High-quality 4K monitor with HDR support',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TN-MOUSE-101' },
      update: {},
      create: {
        name: 'Wireless Mouse',
        sku: 'TN-MOUSE-101',
        quantity: 45,
        price: 24.99,
        reorderThreshold: 10,
        categoryId: electronics.id,
        vendorId: vendor1.id,
        userId: alice.id,
        unitOfMeasure: 'EACH',
        location: 'Warehouse B-2',
        barcode: '123456789013',
        leadTime: 3,
        minimumOrderQuantity: 5,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'OP-MAT-901' },
      update: {},
      create: {
        name: 'Ergonomic Chair Mat',
        sku: 'OP-MAT-901',
        quantity: 18,
        price: 42.0,
        reorderThreshold: 8,
        categoryId: office.id,
        vendorId: vendor2.id,
        userId: bob.id,
        unitOfMeasure: 'EACH',
        location: 'Warehouse C-3',
        leadTime: 5,
        minimumOrderQuantity: 1,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'HW-HUB-001' },
      update: {},
      create: {
        name: 'USB-C Hub',
        sku: 'HW-HUB-001',
        quantity: 3,
        price: 89.99,
        reorderThreshold: 5,
        categoryId: hardware.id,
        vendorId: vendor3.id,
        userId: charlie.id,
        unitOfMeasure: 'EACH',
        location: 'Warehouse A-2',
        leadTime: 10,
        minimumOrderQuantity: 2,
        notes: 'Multi-port USB-C hub with power delivery',
      },
    }),
  ]);

  // Create blog posts conditionally
  const existingPosts = await prisma.post.findMany();
  const existingTitles = existingPosts.map(post => post.title);

  const postsToCreate = [
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
    {
      title: 'Optimizing Warehouse Operations',
      content: 'Best practices for organizing inventory and reducing picking time.',
      published: true,
      authorId: charlie.id,
    },
  ].filter(post => !existingTitles.includes(post.title));

  if (postsToCreate.length > 0) {
    await prisma.post.createMany({
      data: postsToCreate,
    });
  }

  // Create some inventory movements conditionally
  const existingMovements = await prisma.inventoryMovement.findMany({
    where: {
      reference: {
        in: ['PO-001', 'SO-001', 'PO-002']
      }
    }
  });
  const existingReferences = existingMovements.map(m => m.reference);

  const movementsToCreate = [
    {
      productId: products[0].id,
      quantity: 5,
      type: 'PURCHASE',
      reason: 'Initial stock',
      userId: edward.id,
      reference: 'PO-001',
      cost: 250.0,
    },
    {
      productId: products[1].id,
      quantity: -2,
      type: 'SALE',
      reason: 'Customer order',
      userId: alice.id,
      reference: 'SO-001',
    },
    {
      productId: products[2].id,
      quantity: 10,
      type: 'PURCHASE',
      reason: 'Restocking',
      userId: bob.id,
      reference: 'PO-002',
      cost: 35.0,
    },
  ].filter(movement => !existingReferences.includes(movement.reference));

  if (movementsToCreate.length > 0) {
    await prisma.inventoryMovement.createMany({
      data: movementsToCreate,
    });
  }

  // Create some notifications conditionally
  const existingNotifications = await prisma.notification.findMany({
    where: {
      OR: [
        { message: 'USB-C Hub is below the reorder threshold.' },
        { message: 'Your inventory adjustment has been processed.' }
      ]
    }
  });

  const notificationsToCreate = [
    {
      userId: edward.id,
      message: 'USB-C Hub is below the reorder threshold.',
      type: 'LOW_STOCK',
      relatedId: products[3].id,
    },
    {
      userId: alice.id,
      message: 'Your inventory adjustment has been processed.',
      type: 'INVENTORY_UPDATE',
    },
  ].filter(notification => 
    !existingNotifications.some(existing => existing.message === notification.message)
  );

  if (notificationsToCreate.length > 0) {
    await prisma.notification.createMany({
      data: notificationsToCreate,
    });
  }

  // Create some product tags conditionally
  const existingTags = await prisma.productTag.findMany();
  const existingTagNames = existingTags.map(tag => tag.name);

  const tagsToCreate = [
    {
      name: 'Electronics',
      source: 'MANUAL',
    },
    {
      name: 'Best Seller',
      source: 'AI',
    },
    {
      name: 'New Arrival',
      source: 'MANUAL',
    },
  ].filter(tag => !existingTagNames.includes(tag.name));

  const tags = [];
  for (const tagData of tagsToCreate) {
    const tag = await prisma.productTag.create({
      data: tagData,
    });
    tags.push(tag);
  }

  // Add existing tags to the array
  tags.push(...existingTags.filter(tag => 
    ['Electronics', 'Best Seller', 'New Arrival'].includes(tag.name)
  ));

  // Create product usage history for forecasting conditionally
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const existingUsageHistory = await prisma.productUsageHistory.findMany({
    where: {
      productId: {
        in: [products[0].id, products[1].id]
      }
    }
  });

  const usageHistoryToCreate = [
    {
      productId: products[0].id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      quantity: 2,
    },
    {
      productId: products[0].id,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      quantity: 3,
    },
    {
      productId: products[1].id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      quantity: 5,
    },
    {
      productId: products[1].id,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      quantity: 8,
    },
  ].filter(usage => 
    !existingUsageHistory.some(existing => 
      existing.productId === usage.productId && 
      existing.date.getTime() === usage.date.getTime()
    )
  );

  if (usageHistoryToCreate.length > 0) {
    await prisma.productUsageHistory.createMany({
      data: usageHistoryToCreate,
    });
  }

  // Create a sample purchase order conditionally
  const existingPurchaseOrder = await prisma.purchaseOrder.findFirst({
    where: {
      notes: 'Urgent restock for high-demand items'
    }
  });

  let purchaseOrder = existingPurchaseOrder;
  if (!purchaseOrder) {
    purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        vendorId: vendor1.id,
        status: 'APPROVED',
        totalAmount: 559.98,
        requesterId: alice.id,
        approverId: edward.id,
        notes: 'Urgent restock for high-demand items',
        orderDate: new Date(),
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Create purchase items
    await prisma.purchaseItem.createMany({
      data: [
        {
          purchaseOrderId: purchaseOrder.id,
          productId: products[0].id,
          quantity: 2,
          unitPrice: 279.99,
          totalPrice: 559.98,
        },
      ],
    });
  }

  // Create some external deals conditionally
  const existingDeals = await prisma.externalDeal.findMany({
    where: {
      productId: {
        in: [products[0].id, products[1].id]
      }
    }
  });

  const dealsToCreate = [
    {
      productId: products[0].id,
      source: 'AMAZON',
      externalUrl: 'https://amazon.example.com/monitor',
      price: 269.99,
      shipping: 9.99,
      inStock: true,
    },
    {
      productId: products[1].id,
      source: 'BESTBUY',
      externalUrl: 'https://bestbuy.example.com/mouse',
      price: 22.99,
      shipping: 5.99,
      inStock: true,
    },
  ].filter(deal => 
    !existingDeals.some(existing => 
      existing.productId === deal.productId && existing.source === deal.source
    )
  );

  if (dealsToCreate.length > 0) {
    await prisma.externalDeal.createMany({
      data: dealsToCreate,
    });
  }

  // Create some activity logs conditionally
  const existingLogs = await prisma.activityLog.findMany({
    where: {
      entityId: {
        in: [products[0].id, products[1].id]
      }
    }
  });

  const logsToCreate = [
    {
      userId: edward.id,
      action: 'PRODUCT_CREATED',
      entityType: 'PRODUCT',
      entityId: products[0].id,
      details: JSON.stringify({ productName: '4K Ultra Monitor' }),
    },
    {
      userId: alice.id,
      action: 'INVENTORY_ADJUSTMENT',
      entityType: 'PRODUCT',
      entityId: products[1].id,
      details: JSON.stringify({ quantityChanged: -2, reason: 'Customer order' }),
    },
  ].filter(log => 
    !existingLogs.some(existing => 
      existing.entityId === log.entityId && existing.action === log.action
    )
  );

  if (logsToCreate.length > 0) {
    await prisma.activityLog.createMany({
      data: logsToCreate,
    });
  }

  console.log('🌱 Seed completed successfully!');
  console.log('📊 Data created or verified:');
  console.log(`  - ${users.length} users`);
  console.log(`  - 3 categories`);
  console.log(`  - 3 vendors`);
  console.log(`  - ${products.length} products`);
  console.log(`  - ${postsToCreate.length} new blog posts`);
  console.log(`  - ${movementsToCreate.length} new inventory movements`);
  console.log(`  - ${notificationsToCreate.length} new notifications`);
  console.log(`  - ${tagsToCreate.length} new product tags`);
  console.log(`  - ${usageHistoryToCreate.length} new usage history records`);
  console.log(`  - ${purchaseOrder ? 1 : 0} purchase order`);
  console.log(`  - ${dealsToCreate.length} new external deals`);
  console.log(`  - ${logsToCreate.length} new activity logs`);
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
