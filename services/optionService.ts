import { ALL_COUNTRIES, ALL_OPTIONS } from '../constants';
import type { ItineraryItem, Option, Country, CoverageCategory } from '../types';

// A map for quick country detail lookups
const countryDetailsMap = new Map<string, Country>(
  ALL_COUNTRIES.map(c => [c.name, c])
);

// Define which categories are covered by broader categories
const categoryCoverage: Record<string, CoverageCategory[]> = {
  EU: ['EU'],
  USA: ['USA'],
  TOP16: ['TOP16'],
  // Roaming Mondo New also covers TOP16 and USA. Executive Class 2.0 uses ExtraUE_World.
  ExtraUE_World: ['ExtraUE_World', 'TOP16', 'USA'], 
  Excluded_MondoNew: ['Excluded_MondoNew'],
};

/**
 * Checks if a given roaming option covers a specific country.
 * @param option The roaming option to check.
 * @param countryName The name of the country.
 * @returns True if the option covers the country, false otherwise.
 */
function optionCoversCountry(option: Option, countryName: string): boolean {
  const country = countryDetailsMap.get(countryName);
  if (!country) {
    return false; // Country not in our list
  }

  const { coverage } = option;

  if (coverage.type === 'category' && coverage.category) {
    const coveredCategories = categoryCoverage[coverage.category] || [coverage.category];
    return coveredCategories.includes(country.category);
  }

  if (coverage.type === 'countries' && coverage.countries) {
    return coverage.countries.includes(countryName);
  }
  
  // 'special' type options like "TIM in Nave" are not handled by country.
  return false;
}

export interface RecommendedOptions {
  baseOption: Option | null;
  recommended: Option[];
  special: Option[];
}

/**
 * Finds the best roaming options for a given itinerary.
 * @param itinerary A list of travel destinations.
 * @returns An object with a base EU plan and a list of recommended options.
 */
export function findRecommendedOptions(itinerary: ItineraryItem[]): RecommendedOptions {
  const uniqueCountryNames = [...new Set(itinerary.map(item => item.country).filter(Boolean))];
  
  if (uniqueCountryNames.length === 0) {
    return { baseOption: null, recommended: [], special: [] };
  }

  const countryObjects = uniqueCountryNames.map(name => countryDetailsMap.get(name)).filter((c): c is Country => !!c);
  
  const euCountriesInItinerary = countryObjects.filter(c => c.category === 'EU');
  const hasEuCountry = euCountriesInItinerary.length > 0;
  const nonEuCountries = countryObjects.filter(c => c.category !== 'EU');

  let baseOption: Option | null = null;
  if (hasEuCountry) {
    baseOption = {
      id: 'roaming-eu',
      name: 'Roaming in Unione Europea',
      type: 'base',
      cost: 'Incluso',
      costUnit: 'mese',
      description: 'Utilizzi i minuti, SMS e una parte dei Giga della tua offerta nazionale nei paesi UE, senza costi aggiuntivi.',
      includes: {
        calls: 'Come in Italia',
        data: 'Parte dei Giga nazionali',
        sms: 'Come in Italia',
      },
      coverage: { type: 'category', category: 'EU' },
      isRecommended: true,
      coveredItineraryCountries: euCountriesInItinerary.map(c => c.name),
    };
  }

  const recommended: Option[] = [];
  if (nonEuCountries.length > 0) {
    for (const option of ALL_OPTIONS) {
      // Exclude base and special options from general recommendations
      if (option.type === 'base' || option.type === 'special') {
        continue;
      }

      const coveredItineraryCountries = nonEuCountries
        .filter(c => optionCoversCountry(option, c.name))
        .map(c => c.name);

      if (coveredItineraryCountries.length > 0) {
        recommended.push({ ...option, coveredItineraryCountries });
      }
    }
  }

  // Always include special options for user information
  const special = ALL_OPTIONS.filter(o => o.type === 'special');

  // Sort recommended options to show the ones marked as "isRecommended" first.
  recommended.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));

  return { baseOption, recommended, special };
}
