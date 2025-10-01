import { GoogleGenAI, Type } from "@google/genai";
import type { ItineraryItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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

function normalizeCountryName(name: string): string {
  const lowerCaseName = name.trim().toLowerCase();
  // First, check for an exact match in aliases
  if (countryAliases[lowerCaseName]) {
    return countryAliases[lowerCaseName];
  }
  // Return the original name (with original casing) if no alias is found
  return name;
}


export async function parseItineraryFromText(text: string): Promise<ItineraryItem[]> {
  const model = "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model: model,
    contents: `Extract the travel itinerary from the following text. Identify each destination country and the start and end dates for the stay in that country. The current year is 2025. Return the data as a JSON array of objects. Each object must have "country", "startDate", and "endDate" fields. Format dates as DD/MM/YYYY.
    
Text: "${text}"`,
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
              description: "The start date of the stay in DD/MM/YYYY format."
            },
            endDate: {
              type: Type.STRING,
              description: "The end date of the stay in DD/MM/YYYY format."
            }
          },
          required: ["country", "startDate", "endDate"]
        }
      }
    }
  });
  
  const responseText = response.text.trim();
  const parsedJson = JSON.parse(responseText);

  // Add a unique ID to each item and normalize the country name
  return parsedJson.map((item: Omit<ItineraryItem, 'id'>, index: number) => ({
    ...item,
    country: normalizeCountryName(item.country),
    id: Date.now() + index
  }));
}