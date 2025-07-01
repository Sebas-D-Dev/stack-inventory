import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/auth';

// This would ideally use an AI API like OpenAI
// For demo purposes, we're using a simple keyword matching approach
function categorizeTags(productName: string, description?: string): string[] {
  const text = (productName + ' ' + (description || '')).toLowerCase();
  const tags: string[] = [];
  
  // Simple keyword matching
  const tagMapping: Record<string, string[]> = {
    'electronics': ['monitor', 'computer', 'laptop', 'phone', 'wireless', 'mouse', 'keyboard'],
    'office': ['chair', 'desk', 'paper', 'pen', 'stapler', 'mat'],
    'consumable': ['ink', 'toner', 'paper', 'battery'],
    'high-value': ['ultra', '4k', 'premium', 'pro', 'professional'],
    'fragile': ['glass', 'monitor', 'screen', 'ceramic'],
  };
  
  // Check for each tag category
  for (const [tag, keywords] of Object.entries(tagMapping)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag);
    }
  }
  
  return tags;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    const { productId } = data;
    
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { tags: true },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Generate tags
    const suggestedTags = categorizeTags(product.name, product.notes ?? undefined);
    
    // Create tags that don't exist yet
    const existingTags = product.tags.map(tag => tag.name);
    const newTags = suggestedTags.filter(tag => !existingTags.includes(tag));
    
    for (const tagName of newTags) {
      // Check if tag exists in database
      let tag = await prisma.productTag.findFirst({
        where: { name: tagName },
      });
      
      // Create if it doesn't exist
      if (!tag) {
        tag = await prisma.productTag.create({
          data: {
            name: tagName,
            source: 'AI',
          },
        });
      }
      
      // Connect tag to product
      await prisma.product.update({
        where: { id: productId },
        data: {
          tags: {
            connect: { id: tag.id },
          },
        },
      });
    }
    
    // Create an AI insight
    await prisma.aIInsight.create({
      data: {
        entityType: 'PRODUCT',
        entityId: productId,
        insightType: 'CATEGORIZATION',
        content: `Auto-tagged with: ${suggestedTags.join(', ')}`,
        confidence: 0.75,
        applied: true,
      },
    });
    
    // Get updated product with tags
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { tags: true },
    });
    
    return NextResponse.json({ 
      product: updatedProduct,
      suggestedTags,
      newTags,
    });
  } catch (error) {
    console.error('Error categorizing product:', error);
    return NextResponse.json({ error: 'Failed to categorize product' }, { status: 500 });
  }
}