import { GoogleGenAI } from "@google/genai";

/**
 * Generates an edited image based on an input image and a text prompt.
 * using gemini-3-pro-image-preview.
 */
export const generateSofaRestoration = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    // Instantiate the client here to ensure it uses the latest API key from process.env
    // This is required because the user might select a key dynamically via the UI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Ensure base64 string doesn't have the header prefix
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Act as a professional furniture restoration expert. The user has provided an image of a sofa. 
            Perform the following task: ${prompt}. 
            Ensure the output is a high-quality, photorealistic image of the sofa maintaining the same perspective and lighting where possible, but with the requested repairs or modifications applied. Focus on texture details (fabric, leather).`,
          },
        ],
      },
      // Config for image editing/generation
      config: {
        imageConfig: {
          aspectRatio: "1:1", // Defaulting to 1:1, or could follow input if supported dynamically
        }
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated from Gemini.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};