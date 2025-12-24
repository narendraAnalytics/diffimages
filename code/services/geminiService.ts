import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client using the correct named parameter and direct environment variable access.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Image Generation Models ---
const IMAGE_MODEL = 'gemini-2.5-flash-image';
// Using gemini-3-flash-preview for general vision tasks
const VISION_MODEL = 'gemini-3-flash-preview';
// Using gemini-3-pro-preview for complex reasoning (IQ/Logic)
const LOGIC_MODEL = 'gemini-3-pro-preview';

export interface Difference {
  id: number;
  description: string;
  box_2d: [number, number, number, number]; // ymin, xmin, ymax, xmax (0-1000)
}

// --- Spot the Difference Mode ---
export const generateDiffGame = async (promptSubject: string) => {
  try {
    const basePrompt = `Generate a highly detailed illustration of ${promptSubject}. Modern vector art style. Clean, multiple elements, clear background. NO text, NO watermarks.`;
    
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
    if (!baseImageBase64) throw new Error("Failed to generate base image");

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
    if (!modImageBase64) throw new Error("Failed to generate modified image");

    return { original: baseImageBase64, modified: modImageBase64 };
  } catch (error) {
    console.error("Game Gen Error:", error);
    throw error;
  }
};

// --- What's Wrong Mode ---
export const generateWrongGame = async (promptSubject: string) => {
    try {
        const prompt = `Generate a single, high-quality, professional illustration of ${promptSubject}. 
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
                imageBase64 = part.inlineData.data;
                break;
            }
        }
        if (!imageBase64) throw new Error("Failed to generate image");

        return { image: imageBase64 };
    } catch (error) {
        console.error("Wrong Game Gen Error:", error);
        throw error;
    }
};

// --- Logic IQ Mode ---
export const generateLogicGame = async (promptSubject: string) => {
    try {
        const prompt = `Generate a unique, challenging logical puzzle or situational IQ test. 
        Topic: ${promptSubject || 'random logical thinking'}.
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
        return JSON.parse(response.text || '{"title": "Logic Test", "question": "Error generating question.", "solution": "No solution available."}');
    } catch (error) {
        console.error("Logic Game Gen Error:", error);
        throw error;
    }
};

export const checkLogicAnswer = async (question: string, userGuess: string): Promise<{ correct: boolean; explanation: string }> => {
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
    return JSON.parse(response.text || '{"correct": false, "explanation": "Verification failed."}');
};

export const checkWrongness = async (
    image: string, 
    userGuess: string, 
    previousFound: string[]
): Promise<{ correct: boolean; explanation: string; alreadyFound?: boolean }> => {
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
    return JSON.parse(response.text || '{"correct": false, "explanation": "Error"}');
};

export const getWrongErrors = async (image: string): Promise<Difference[]> => {
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
    const json = JSON.parse(response.text || '{"errors": []}');
    return json.errors || [];
};

// --- General Shared Helpers ---
export const checkDifference = async (
  original: string, 
  modified: string, 
  userGuess: string,
  previousFound: string[]
): Promise<{ correct: boolean; explanation: string; alreadyFound?: boolean }> => {
    
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

  return JSON.parse(response.text || '{"correct": false, "explanation": "Error parsing response"}');
};

export const getDifference = async (original: string, modified: string): Promise<Difference[]> => {
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
    
    const json = JSON.parse(response.text || '{"differences": []}');
    return json.differences || [];
};