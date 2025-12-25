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

    const { subject } = await request.json();

    const prompt = `Generate a unique, challenging logical puzzle or situational IQ test.
    Topic: ${subject || 'random logical thinking'}.
    The puzzle should have a clear, definitive solution.
    Provide a title, the question text, and the detailed solution/explanation.
    IMPORTANT: DO NOT USE ANY MARKDOWN FORMATTING (like **bolding**) in the question or solution. Provide clean, raw text only.
    Return JSON.`;

    const response = await ai.models.generateContent({
      model: LOGIC_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            question: { type: Type.STRING },
            solution: { type: Type.STRING }
          },
          required: ["title", "question", "solution"]
        }
      }
    });

    const data = JSON.parse(response.text || '{\"title\": \"Logic Test\", \"question\": \"Error generating question.\", \"solution\": \"No solution available.\"}');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gemini API Error (generate-logic):', error);
    return NextResponse.json(
      { error: 'Failed to generate game' },
      { status: 500 }
    );
  }
}
