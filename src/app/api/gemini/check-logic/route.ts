import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { auth } from '@clerk/nextjs/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
const LOGIC_MODEL = 'gemini-3-flash-preview';

export async function POST(request: NextRequest) {
  try {
    // Protect the API route
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, userGuess } = await request.json();

    const prompt = `
    Question: "${question}"
    User's Answer: "${userGuess}"

    Evaluate if the user's answer is logically correct or sufficiently identifies the solution to the question.
    Be reasonable with semantic variations.
    IMPORTANT: DO NOT USE ANY MARKDOWN FORMATTING (like **bolding**) in the explanation. Provide clean, raw text only.
    Return JSON with correct (boolean) and explanation (string).
  `;

    const response = await ai.models.generateContent({
      model: LOGIC_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correct: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING }
          },
          required: ["correct", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text || '{\"correct\": false, \"explanation\": \"Verification failed.\"}');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gemini API Error (check-logic):', error);
    return NextResponse.json(
      { error: 'Failed to check logic answer' },
      { status: 500 }
    );
  }
}
