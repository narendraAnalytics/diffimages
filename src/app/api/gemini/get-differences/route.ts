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

    const { original, modified } = await request.json();

    const prompt = `
    List 6-8 distinct differences between these two images.
    Provide id, description (max 15 words), and box_2d [ymin, xmin, ymax, xmax].
    Return JSON.
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
            differences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER }
                  }
                },
                required: ["id", "description", "box_2d"]
              }
            }
          },
          required: ["differences"]
        }
      }
    });

    const json = JSON.parse(response.text || '{\"differences\": []}');
    return NextResponse.json(json.differences || []);
  } catch (error) {
    console.error('Gemini API Error (get-differences):', error);
    return NextResponse.json(
      { error: 'Failed to get differences' },
      { status: 500 }
    );
  }
}
