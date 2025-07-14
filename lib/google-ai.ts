import { GoogleGenAI } from "@google/genai";

// Initialize Google AI client
let googleAI: GoogleGenAI | null = null;

export function getGoogleAI(): GoogleGenAI {
  if (!googleAI) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is not set");
    }
    googleAI = new GoogleGenAI({ apiKey });
  }
  return googleAI;
}

export async function generateText(prompt: string, model: string = "gemini-1.5-flash"): Promise<string> {
  try {
    const genAI = getGoogleAI();
    
    const result = await genAI.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }]
    });
    
    // Extract text from the response
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text;
  } catch (error) {
    console.error("Error generating text with Google AI:", error);
    throw error;
  }
}

export async function* generateTextStream(prompt: string, model: string = "gemini-1.5-flash"): AsyncGenerator<string, void, unknown> {
  try {
    const genAI = getGoogleAI();
    
    const stream = await genAI.models.generateContentStream({
      model,
      contents: [{ parts: [{ text: prompt }] }]
    });
    
    for await (const chunk of stream) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error streaming text with Google AI:", error);
    throw error;
  }
}

export type { GoogleGenAI };
