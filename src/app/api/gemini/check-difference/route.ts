import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { auth } from '@clerk/nextjs/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
const VISION_MODEL = 'gemini-3-flash-preview';

export async function POST(request: NextRequest) {
  try {
    // Protect the API route
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { original, modified, userGuess, previousFound } = await request.json();

    const prompt = `
    I have two images with 6 to 8 complex differences.
    The user guessed: "${userGuess}".
    Previously found differences: ${JSON.stringify(previousFound)}.
    Check if the user's guess describes an actual difference.
    Return JSON format.
  `;

    const response = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: {
        parts: [
          { text: "Image 1 (Original):" },
          { inlineData: { mimeType: 'image/png', data: original } },
          { text: "Image 2 (Modified):" },
          { inlineData: { mimeType: 'image/png', data: modified } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correct: { type: Type.BOOLEAN },
            alreadyFound: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING }
          },
          required: ["correct", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text || '{\"correct\": false, \"explanation\": \"Error parsing response\"}');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gemini API Error (check-difference):', error);
    return NextResponse.json(
      { error: 'Failed to check difference' },
      { status: 500 }
    );
  }
}
