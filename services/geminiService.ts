import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Game, GameStats } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const getAI = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      if (settings.apiKeys && settings.apiKeys.GEMINI_API_KEY) {
        return new GoogleGenAI({ apiKey: settings.apiKeys.GEMINI_API_KEY });
      }
    }
  } catch (e) {
    console.warn("Failed to fetch API key from settings, falling back to env", e);
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
};

const reflectionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A poetic title for the player's journey" },
    narrative: { type: Type.STRING, description: "A reflective narrative paragraph (3-5 sentences)" }
  },
  required: ["title", "narrative"]
};

export const generateJourneyReflection = async (
  gameTitle: string,
  archetypes: string[],
  stats: GameStats
): Promise<{ title: string; narrative: string }> => {
  const prompt = `
    Based on the following player exploration data for the game "${gameTitle}", generate a poetic reflection centered on the concept of "City Fire" (城市之火).
    
    In this world, every city contains hidden stories and cultural memories. Players are explorers who uncover these stories to "light a city fire," symbolizing the revival of cultural memory.
    
    Player Archetype: ${archetypes.join(', ')}
    
    Stats Context:
    - Interactions: ${stats.interactionCount}
    - Hints Used: ${stats.hintCount}
    - Puzzle Failures: ${stats.puzzleFailures}
    - Exploration Rate: ${Math.round((stats.visitedSceneCount / stats.totalSceneCount) * 100)}%
    
    Requirements:
    1. A poetic title (max 12 chars) describing the player's style as a fire-lighter.
    2. A reflective narrative paragraph (3-5 sentences) describing how the player's exploration helped "light the city fire" and revive the city's hidden memories.
    3. Tone: reflective, cultural, slightly poetic, observational, warm. Avoid competitive language.
    4. Language: Traditional Chinese (Taiwan).
  `;

  try {
    const ai = await getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reflectionSchema,
        systemInstruction: "You are a poetic observer of urban exploration. You describe journeys with warmth and depth."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);

  } catch (error: any) {
    if (error.status === 429) {
        console.warn("Rate limit exceeded for Gemini API");
    } else {
        console.error("Failed to generate reflection:", error);
    }
    // Fallback
    return {
      title: "靜謐的旅人",
      narrative: "你輕輕走過這座城市，留下了屬於自己的足跡。或許未曾翻閱每一頁故事，但你眼中的風景，已足夠動人。"
    };
  }
};

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

export const verifyARImage = async (base64Image: string, targetHint: string): Promise<{ isMatch: boolean; feedback: string }> => {
  try {
    const ai = await getAI();
    
    const match = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid base64 image format");
    const mimeType = match[1];
    const base64Data = match[2];

    const prompt = `
      Please analyze this image and determine if it contains or matches the following target: "${targetHint}".
      Respond in JSON format with two fields:
      1. isMatch: boolean (true if the image clearly matches the target, false otherwise)
      2. feedback: string (A short, encouraging explanation in Traditional Chinese (Taiwan) of why it matches or doesn't match, max 2 sentences)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMatch: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isMatch", "feedback"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);

  } catch (error) {
    console.error("Failed to verify AR image:", error);
    return { isMatch: false, feedback: "影像辨識失敗，請稍後再試。" };
  }
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
    const ai = await getAI();
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

export const generateShareImage = async (gameTitle: string, archetype: string, litCount: number): Promise<string> => {
  const prompt = `
    Create a highly artistic, cinematic, and atmospheric digital painting for a game called "${gameTitle}".
    The theme is "City Fire" (城市之火) - lighting up the cultural memory of a city.
    The player's archetype is "${archetype}".
    The image should feature a single glowing matchstick or a small flame in a dark, mysterious, and beautiful urban setting (like an old street or a futuristic city).
    The flame should be warm and bright, casting long shadows and illuminating hidden details of the city.
    Style: Ethereal, cinematic lighting, rich textures, slightly mysterious but hopeful.
    No text in the image.
  `;

  try {
    const ai = await getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data in response");
  } catch (error) {
    console.error("Failed to generate share image:", error);
    // Fallback to a nice placeholder
    return `https://picsum.photos/seed/cityfire/800/800`;
  }
};

export const getCityCoordinates = async (cityName: string): Promise<{ lat: number, lng: number }> => {
  const prompt = `
    Find the real-world geographic coordinates (latitude and longitude) for the city: "${cityName}".
    Respond ONLY in JSON format with "lat" and "lng" fields.
    If it's a fictional city, provide coordinates that would place it in a reasonable geographic context or return { "lat": 0, "lng": 0 }.
  `;

  try {
    const ai = await getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER }
          },
          required: ["lat", "lng"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error: any) {
    if (error.status === 429) {
        console.warn("Rate limit exceeded for Gemini API");
    } else {
        console.error("Failed to get city coordinates:", error);
    }
    return { lat: 0, lng: 0 };
  }
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  const prompt = `
    Translate the following text to ${targetLang}. 
    Maintain the original tone and context. 
    If the target language is "zh-TW", use Traditional Chinese (Taiwan).
    If the target language is "zh-CN", use Simplified Chinese.
    If the target language is "en", use English.
    
    Text: "${text}"
  `;

  try {
    const ai = await getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional translator specializing in game localization and UI text."
      }
    });

    return response.text || text;
  } catch (error) {
    console.error("Failed to translate text:", error);
    return text;
  }
};

export const generateQuiz = async (topic: string, type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE' | 'SORT'): Promise<any> => {
  const typeDesc = {
    'SINGLE': 'a single-choice question with 4 options and 1 correct answer index (0-3)',
    'MULTI': 'a multiple-choice question with 4-5 options and an array of correct answer indices',
    'TRUE_FALSE': 'a true/false question with 2 options ("正確", "錯誤") and 1 correct answer index (0 or 1)',
    'SORT': 'a sorting question where the options are items to be ordered, and the correct answer is an array of indices representing the correct sequence'
  };

  const prompt = `
    Generate a daily quiz question about the following topic: "${topic}".
    The question type should be: ${type} (${typeDesc[type]}).
    The content MUST be in Traditional Chinese (Taiwan).
    The topic is related to "Civilization", "History", "Culture", or "Urban Exploration".
    
    Respond ONLY in JSON format with the following fields:
    - question: string
    - options: string[]
    - correctAnswer: number | number[] (depending on the type)
    - explanation: string (a short interesting fact related to the answer)
    - category: string (a short category name like "歷史", "文化", "地理")
  `;

  try {
    const ai = await getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "For SINGLE/TRUE_FALSE, this should be a single number in an array. For MULTI/SORT, it's an array of numbers." },
            explanation: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation", "category"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const result = JSON.parse(text);
    
    // Normalize correctAnswer based on type
    if (type === 'SINGLE' || type === 'TRUE_FALSE') {
      if (Array.isArray(result.correctAnswer)) {
        result.correctAnswer = result.correctAnswer[0];
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to generate quiz:", error);
    throw error;
  }
};
