import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { ProductData, CategoryData } from '../types';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { entityType, entityId, insightType } = await request.json();
    
    if (!entityType || !entityId || !insightType) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get the relevant entity data based on type
    let entityData;
    switch (entityType) {
      case 'PRODUCT':
        entityData = await prisma.product.findUnique({
          where: { id: entityId },
          include: { 
            category: true,
            vendor: true,
            inventoryMovements: {
              take: 10,
              orderBy: { createdAt: 'desc' }
            },
            usageHistory: {
              take: 10,
              orderBy: { date: 'desc' }
            }
          }
        });
        break;
      case 'CATEGORY':
        entityData = await prisma.category.findUnique({
          where: { id: entityId },
          include: {
            products: true
          }
        });
        break;
      default:
        return NextResponse.json({ 
          error: 'Unsupported entity type' 
        }, { status: 400 });
    }

    if (!entityData) {
      return NextResponse.json({ 
        error: 'Entity not found' 
      }, { status: 404 });
    }

    // Create prompt based on entity type and insight type
    let prompt = '';
    if (entityType === 'PRODUCT' && insightType === 'RECOMMENDATION') {
      const productData = entityData as ProductData;
      prompt = `Based on the following product data, provide inventory management recommendations:
      
Product: ${productData.name}
SKU: ${productData.sku}
Current Quantity: ${productData.quantity}
Category: ${productData.category?.name || 'Unknown'}
Price: $${productData.price}
Lead Time: ${productData.leadTime || 'Unknown'} days
Minimum Order Quantity: ${productData.minimumOrderQuantity || 'Unknown'}

Provide concise, actionable insights about:
1. Reordering recommendations
2. Potential stock issues
3. Optimization suggestions
`;
    } else if (entityType === 'PRODUCT' && insightType === 'TREND') {
      const productData = entityData as ProductData;
      const usageData = productData.usageHistory?.map(h => `${h.date.toISOString().split('T')[0]}: ${h.quantity} units`).join('\n') || 'No usage history available';
      
      prompt = `Analyze the following product usage history and identify trends:
      
Product: ${productData.name}
SKU: ${productData.sku}
Current Quantity: ${productData.quantity}
      
Usage History:
${usageData}

Provide insights about:
1. Usage patterns
2. Potential seasonal trends
3. Forecasting recommendations
`;
    } else if (entityType === 'CATEGORY') {
      const categoryData = entityData as CategoryData;
      prompt = `Analyze the following category data and provide insights:
      
Category: ${categoryData.name}
Number of Products: ${categoryData.products?.length || 0}

Provide insights about:
1. Category performance
2. Product recommendations
3. Optimization opportunities
`;
    }
    
    // Generate the AI response using the modern AI SDK (non-streaming)
    const { text } = await generateText({
      model: google('gemini-pro'),
      prompt,
    });
    
    // Save the insight to the database
    const insight = await prisma.aIInsight.create({
      data: {
        entityType,
        entityId,
        insightType,
        content: text,
        confidence: 0.85, // You might want to derive this from the AI response
        applied: false,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      insight 
    });
    
  } catch (error) {
    console.error('Error generating and saving AI insight:', error);
    return NextResponse.json({ 
      error: 'Failed to generate and save insight' 
    }, { status: 500 });
  }
}