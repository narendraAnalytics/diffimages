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

    const { image, userGuess, previousFound } = await request.json();

    const prompt = `
    This image contains several intentional logical errors/anomalies.
    The user guessed that "${userGuess}" is wrong with the image.
    Previously found errors: ${JSON.stringify(previousFound)}.

    1. Identify all intentional errors in the image.
    2. Check if the user's guess accurately identifies one of these errors.
    3. Return correct=true if they found a new error.
    4. Return alreadyFound=true if they found one that was already listed.
    5. If wrong, give a very subtle hint.
    Return JSON.
  `;

    const response = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: image } },
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

    const data = JSON.parse(response.text || '{\"correct\": false, \"explanation\": \"Error\"}');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gemini API Error (check-wrong):', error);
    return NextResponse.json(
      { error: 'Failed to check wrong' },
      { status: 500 }
    );
  }
}
