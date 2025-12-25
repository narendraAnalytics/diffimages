import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@clerk/nextjs/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export async function POST(request: NextRequest) {
  try {
    // Protect the API route
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject } = await request.json();

    // Generate base image
    const basePrompt = `Generate a highly detailed illustration of ${subject}. Modern vector art style. Clean, multiple elements, clear background. NO text, NO watermarks.`;

    const baseResponse = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: basePrompt,
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    let baseImageBase64 = '';
    for (const part of baseResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        baseImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!baseImageBase64) {
      throw new Error("Failed to generate base image");
    }

    // Generate modified image
    const modificationPrompt = `Edit this image to introduce 6 to 8 clever differences. Avoid simple color swaps. Add/remove objects, change shapes, alter expressions, change textures. Range from medium to challenging. NO text.`;

    const modResponse = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: baseImageBase64 } },
          { text: modificationPrompt }
        ]
      }
    });

    let modImageBase64 = '';
    for (const part of modResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        modImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!modImageBase64) {
      throw new Error("Failed to generate modified image");
    }

    return NextResponse.json({
      original: baseImageBase64,
      modified: modImageBase64
    });
  } catch (error) {
    console.error('Gemini API Error (generate-diff):', error);
    return NextResponse.json(
      { error: 'Failed to generate game' },
      { status: 500 }
    );
  }
}
