import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Google API key is available
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Google API key not configured',
        available: false 
      }, { status: 500 });
    }

    // Basic validation that the key looks correct
    if (!apiKey.startsWith('AI')) {
      return NextResponse.json({ 
        error: 'Invalid Google API key format',
        available: false 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      available: true,
      provider: 'Google Gemini'
    });
    
  } catch {
    return NextResponse.json({ 
      error: 'Failed to check AI service status',
      available: false 
    }, { status: 500 });
  }
}
