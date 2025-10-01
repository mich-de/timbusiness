import { GoogleGenAI, Type } from "@google/genai";
import type { ItineraryItem } from '../types';
import { ALL_COUNTRIES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// This map will store lowercase versions of all country names and aliases,
// mapping them to the canonical, properly-cased country name.
const countryNormalizationMap = new Map<string, string>();

// 1. Populate with canonical names from ALL_COUNTRIES
ALL_COUNTRIES.forEach(country => {
  countryNormalizationMap.set(country.name.toLowerCase(), country.name);
});

// 2. Add common aliases
const countryAliases: { [key: string]: string } = {
  'uae': 'Emirati Arabi Uniti',
  'united arab emirates': 'Emirati Arabi Uniti',
  'usa': 'Stati Uniti',
  'stati uniti d\'america': 'Stati Uniti',
  'united states': 'Stati Uniti',
  'united states of america': 'Stati Uniti',
  'uk': 'Regno Unito',
  'great britain': 'Regno Unito',
  'united kingdom': 'Regno Unito',
  'england': 'Regno Unito',
  'scotland': 'Regno Unito',
  'wales': 'Regno Unito',
  'northern ireland': 'Regno Unito',
};

for (const alias in countryAliases) {
  // The value is the canonical name, which we know is in ALL_COUNTRIES
  countryNormalizationMap.set(alias.toLowerCase(), countryAliases[alias]);
}

/**
 * Normalizes a country name to its canonical form.
 * For example, "grecia", "Grecia", or "GRECIA" will all become "Grecia".
 * Handles common aliases as well (e.g., "USA" -> "Stati Uniti").
 * @param name The country name to normalize.
 * @returns The canonical country name or the original name if no match is found.
 */
function normalizeCountryName(name: string): string {
  const lowerCaseName = name.trim().toLowerCase();
  return countryNormalizationMap.get(lowerCaseName) || name;
}


export async function parseItineraryFromText(text: string): Promise<ItineraryItem[]> {
  const model = "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model: model,
    contents: `You are an itinerary parser. Your task is to analyze the user's travel description and extract a list of all mentioned countries. The user might list countries in various ways. Pay close attention to lists of countries within a single sentence.

Here are some examples of how to parse the text:
- For input "Cina, Filippine, Indonesia", you must extract "Cina", "Filippine", and "Indonesia".
- For input "Viaggio di lavoro in Cina, Filippine e Indonesia.", you must extract "Cina", "Filippine", and "Indonesia".
- For input "Vado in Brasile dal 10/11 al 20/11 e poi negli Stati Uniti", you must extract "Brasile" (with dates) and "Stati Uniti".

If dates are provided, extract them in DD/MM/YYYY format. The current year is 2025.
Always return the result as a JSON array matching the provided schema.

Now, analyze the following text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            country: {
              type: Type.STRING,
              description: "The destination country."
            },
            startDate: {
              type: Type.STRING,
              description: "The start date of the stay in DD/MM/YYYY format. Optional."
            },
            endDate: {
              type: Type.STRING,
              description: "The end date of the stay in DD/MM/YYYY format. Optional."
            }
          },
          required: ["country"]
        }
      }
    }
  });

  const jsonStr = response.text.trim();
  // We expect an array of objects that might not have startDate or endDate
  const parsedItems = JSON.parse(jsonStr) as { country: string; startDate?: string; endDate?: string }[];

  if (!Array.isArray(parsedItems)) {
    throw new Error("Invalid itinerary format received from AI.");
  }

  // Normalize country names and add a unique ID, ensuring dates are always strings.
  const processedItinerary: ItineraryItem[] = parsedItems
    .map((item, index) => {
      // Basic validation: country is mandatory.
      if (!item.country) {
          return null;
      }
      return {
          id: Date.now() + index, // Create a unique ID
          country: normalizeCountryName(item.country),
          startDate: item.startDate || '', // Default to empty string if not present
          endDate: item.endDate || '', // Default to empty string if not present
      };
    })
    .filter((item): item is ItineraryItem => item !== null); // Filter out any null entries

  return processedItinerary;
}