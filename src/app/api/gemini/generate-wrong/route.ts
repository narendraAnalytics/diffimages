import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@clerk/nextjs/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export async function POST(request: NextRequest) {
  try {
    // Protect the API route
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject } = await request.json();

    const prompt = `Generate a single, high-quality, professional illustration of ${subject}.
    The image MUST contain 5 to 7 intentional 'logical errors' or 'surreal glitches'.
    Examples of errors: a clock with 13 numbers, a person wearing two different shoes, a shadow pointing the wrong way, gravity-defying liquids, an animal with extra limbs, or a tree with fruit from a different species.
    The errors should be subtle and integrated naturally into the artistic style.
    NO text labels, NO watermarks. Style: Modern digital painting.`;

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    let imageBase64 = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data || '';
        break;
      }
    }

    if (!imageBase64) {
      throw new Error("Failed to generate image");
    }

    return NextResponse.json({ image: imageBase64 });
  } catch (error) {
    console.error('Gemini API Error (generate-wrong):', error);
    return NextResponse.json(
      { error: 'Failed to generate game' },
      { status: 500 }
    );
  }
}
