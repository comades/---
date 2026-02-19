import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Game } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const gameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The title of the game" },
    description: { type: Type.STRING, description: "A short catchy description" },
    coverImageKeyword: { type: Type.STRING, description: "A single english keyword for the cover image (e.g., 'castle', 'cyberpunk', 'forest')" },
    startSceneId: { type: Type.STRING, description: "The ID of the first scene (must match one scene id)" },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING, description: "Scene title" },
          text: { type: Type.STRING, description: "The narrative text for this scene (approx 50-100 words)" },
          imageKeyword: { type: Type.STRING, description: "Visual keyword for this scene" },
          isEnding: { type: Type.BOOLEAN, description: "True if this is a game over or victory scene" },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Button text for the choice" },
                nextSceneId: { type: Type.STRING, description: "ID of the scene this choice leads to" }
              }
            }
          }
        },
        required: ["id", "text", "choices"]
      }
    }
  },
  required: ["title", "description", "scenes", "startSceneId"]
};

export const generateGameFromIdea = async (idea: string): Promise<Game> => {
  const prompt = `
    Create a short interactive fiction game / text adventure based on this idea: "${idea}".
    The game should have at least 5 scenes and at most 8 scenes.
    Ensure there is a clear start, some branching paths, and at least 2 distinct endings.
    The language of the content MUST be Traditional Chinese (Taiwan).
    Ensure the 'nextSceneId' in choices always refers to a valid 'id' in the scenes array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: gameSchema,
        systemInstruction: "You are an expert game designer for mobile interactive fiction. You create engaging, concise stories with interesting choices."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const rawGame = JSON.parse(text);
    
    // Enrich with local IDs and default values if missing
    return {
      ...rawGame,
      id: crypto.randomUUID(),
      author: 'AI Creator',
    };

  } catch (error) {
    console.error("Failed to generate game:", error);
    throw error;
  }
};