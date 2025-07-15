import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { generateText } from '@/lib/google-ai';
import { buildComprehensiveAIContext } from '@/lib/ai-context-builder';

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

    // Build comprehensive context for the AI
    const userRole = session.user.role || 'USER';
    const contextualPrompt = await buildComprehensiveAIContext(userRole, message);

    const prompt = `
${contextualPrompt}

CONVERSATION HISTORY:
${history.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}

USER QUESTION: ${message}

INSTRUCTIONS:
- Provide specific, actionable responses based on the current inventory context
- Use role-appropriate information and suggestions based on user's role (${userRole})
- Reference specific products, categories, or vendors when relevant
- Consider external factors (season, market trends) in recommendations
- If asking about low stock, prioritize the most critical items first
- For reorder suggestions, consider vendor relationships and order history
- When discussing categories, include performance metrics and insights
- If data is missing for a specific request, suggest specific actions the user can take
- Keep responses conversational but professional and informative
- Always prioritize accuracy and data-driven insights over speculation
- Suggest specific next steps or actions when appropriate

RESPONSE:`;

    const response = await generateText(prompt);
    
    return NextResponse.json({ 
      response, 
      success: true,
      timestamp: new Date().toISOString(),
      userRole: userRole
    });
    
  } catch (error) {
    console.error('Error in inventory assistant:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
