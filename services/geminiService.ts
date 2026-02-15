
import { GoogleGenAI, Type } from "@google/genai";
import { SelectedSlot } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generates a narrative based on the 4 selected word concepts.
 */
export async function generateNarrative(slots: SelectedSlot[]) {
  const word1 = slots[0].word?.label || ''; // Starter
  const word2 = slots[1].word?.label || ''; // Initial State
  const word3 = slots[2].word?.label || ''; // Outcome
  const word4 = slots[3].word?.label || ''; // Pre-result

  const prompt = `
    Create a short, cinematic, abstract story based on these four components:
    1. Initial State of two entities: "${word2}"
    2. The Catalyst/Starter of change: "${word1}"
    3. The Pre-result phase: "${word4}"
    4. The Final Outcome: "${word3}"

    Follow this structure exactly: "The [Entity A] and [Entity B] were in a state of ${word2}. Then [Entity A] ${word1} [Entity B], leading to ${word4} and finally achieving ${word3}."
    Make it poetic but keep it under 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "A story is unfolding...";
  } catch (error) {
    console.error("Narrative generation failed", error);
    return "The entities shifted through their phases in silence.";
  }
}

/**
 * Generates an image representation of a hand gesture for a given word.
 */
export async function generateGestureVisual(word: string) {
  const prompt = `A clean, artistic, high-contrast 3D render of a hand gesture representing the concept "${word}". 
    The style should be minimalist, on a deep dark background, with glowing ethereal outlines or soft studio lighting. 
    Focus only on the hands. For "${word}", the hands should be ${getGesturePrompt(word)}.`;

  try {
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

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error(`Visual generation failed for ${word}`, error);
  }
  return `https://picsum.photos/400/400?random=${Math.random()}`;
}

function getGesturePrompt(word: string): string {
  const prompts: Record<string, string> = {
    "Overcome": "one hand pushing down another hand that is trying to rise",
    "Expansion": "two hands starting close together and moving outwards horizontally to show growth",
    "Silence": "one hand firmly but gently covering an open mouth",
    "Forcing to set": "one hand forcefully pushing down on a human-like figure into a sitting position",
    "Merge": "two hands interlocking fingers tightly",
    "Divide": "two hands pulling apart a single thread",
  };
  return prompts[word] || `expressing the motion of ${word} through fingers and palms`;
}
