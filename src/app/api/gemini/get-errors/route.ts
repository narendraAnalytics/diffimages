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

    const { image } = await request.json();

    const prompt = `
    Analyze this image and list all the intentional 'logical errors' or 'anomalies'.
    For each error:
    1. 'id' (integer)
    2. 'description' (short)
    3. 'box_2d' [ymin, xmin, ymax, xmax] (0-1000)
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
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  box_2d: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                },
                required: ["id", "description", "box_2d"]
              }
            }
          },
          required: ["errors"]
        }
      }
    });

    const json = JSON.parse(response.text || '{\"errors\": []}');
    return NextResponse.json(json.errors || []);
  } catch (error) {
    console.error('Gemini API Error (get-errors):', error);
    return NextResponse.json(
      { error: 'Failed to get errors' },
      { status: 500 }
    );
  }
}
