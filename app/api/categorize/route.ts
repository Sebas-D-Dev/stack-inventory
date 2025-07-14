import { generateText } from '@/lib/google-ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productName, description } = await request.json();
    
    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    
    const prompt = `
      You are an inventory categorization assistant.
      Based on the following product information, suggest the most appropriate category.
      
      Product Name: ${productName}
      Description: ${description || 'N/A'}
      
      Respond with ONLY a valid JSON object containing:
      {
        "suggestedCategory": "The best category match",
        "confidence": 0.85,
        "tags": ["tag1", "tag2", "tag3"]
      }
      
      Make sure the confidence is a number between 0-1 and tags is an array of up to 3 relevant tags.
    `;
    
    const response = await generateText(prompt);
    
    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(response);
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response
      return NextResponse.json({
        suggestedCategory: "General",
        confidence: 0.5,
        tags: ["uncategorized"]
      });
    }
  } catch (error) {
    console.error('AI Categorization Error:', error);
    return NextResponse.json({ 
      error: 'Failed to categorize product' 
    }, { status: 500 });
  }
}