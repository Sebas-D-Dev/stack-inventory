import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { generateText } from '@/lib/google-ai';
import prisma from '@/lib/prisma';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history }: { message: string; history: Message[] } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get some basic inventory data for context
    const [totalProducts, lowStockProducts, categories] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: {
          quantity: {
            lte: prisma.product.fields.minimumOrderQuantity
          }
        }
      }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        }
      })
    ]);

    // Build context for the AI
    const inventoryContext = `
Current Inventory Status:
- Total Products: ${totalProducts}
- Low Stock Items: ${lowStockProducts}
- Categories: ${categories.map(c => `${c.name} (${c._count.products} products)`).join(', ')}

Recent conversation history:
${history.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}
`;

    const prompt = `
You are an intelligent inventory management assistant. You have access to the following inventory information:

${inventoryContext}

User question: ${message}

Please provide a helpful, specific response about inventory management. If the user asks about specific products, categories, or inventory operations, provide relevant guidance. Keep responses concise but informative.

If you need specific product details that aren't provided in the context, suggest how the user can find that information in the system.
`;

    const response = await generateText(prompt);

    return NextResponse.json({ 
      response,
      success: true 
    });

  } catch (error) {
    console.error('Inventory Assistant Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process your request' 
    }, { status: 500 });
  }
}
