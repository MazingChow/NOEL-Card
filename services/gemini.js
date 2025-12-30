
import { GoogleGenAI, Type } from "@google/genai";

export async function generateNewYearFortune() {
  // Ultra-safe check for browser environment
  let apiKey = '';
  try {
    apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
  } catch (e) {
    apiKey = '';
  }
  
  if (!apiKey) {
    console.log("No API key available, using high-quality local fortunes.");
    return "";
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a poetic, short, and inspiring New Year's fortune in Chinese (simplified). It should be about hope, winter, or light. Max 30 characters.",
      config: {
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fortune: { type: Type.STRING }
          },
          required: ["fortune"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.fortune;
  } catch (error) {
    console.error("Gemini failed, using fallback", error);
    return ""; 
  }
}
