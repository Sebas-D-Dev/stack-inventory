import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';

// Mock function to simulate fetching deals from external sources
// In a real application, this would connect to actual APIs
async function fetchExternalDeals(productName: string, sku: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate some mock deals
  const randomDeals = [
    {
      source: 'Amazon',
      price: parseFloat((Math.random() * 50 + 100).toFixed(2)),
      shipping: parseFloat((Math.random() * 10).toFixed(2)),
      inStock: Math.random() > 0.3,
      externalUrl: `https://amazon.example.com/products/${sku}`,
    },
    {
      source: 'BestBuy',
      price: parseFloat((Math.random() * 60 + 95).toFixed(2)),
      shipping: parseFloat((Math.random() * 15).toFixed(2)),
      inStock: Math.random() > 0.2,
      externalUrl: `https://bestbuy.example.com/products/${sku}`,
    },
    {
      source: 'Walmart',
      price: parseFloat((Math.random() * 40 + 90).toFixed(2)),
      shipping: parseFloat((Math.random() * 8).toFixed(2)),
      inStock: Math.random() > 0.1,
      externalUrl: `https://walmart.example.com/products/${sku}`,
    },
  ];
  
  // Return only some deals randomly
  return randomDeals.filter(() => Math.random() > 0.3);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get productId from URL
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  
  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }
  
  try {
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Get existing deals
    const existingDeals = await prisma.externalDeal.findMany({
      where: { productId },
    });
    
    // If deals exist and were checked in the last 24 hours, return them
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const freshDeals = existingDeals.filter(deal => deal.lastChecked > oneDayAgo);
    
    if (freshDeals.length > 0) {
      return NextResponse.json({ deals: freshDeals, fresh: true });
    }
    
    // Fetch new deals
    const newDeals = await fetchExternalDeals(product.name, product.sku);
    
    // Save new deals to database
    const savedDeals = await Promise.all(
      newDeals.map(deal => 
        prisma.externalDeal.create({
          data: {
            productId,
            source: deal.source,
            externalUrl: deal.externalUrl,
            price: deal.price,
            shipping: deal.shipping,
            inStock: deal.inStock,
          },
        })
      )
    );
    
    // Delete old deals
    if (existingDeals.length > 0) {
      await prisma.externalDeal.deleteMany({
        where: {
          id: {
            in: existingDeals.map(deal => deal.id),
          },
        },
      });
    }
    
    return NextResponse.json({ deals: savedDeals, fresh: false });
  } catch (error) {
    console.error('Error fetching external deals:', error);
    return NextResponse.json({ error: 'Failed to fetch external deals' }, { status: 500 });
  }
}