import type { ItineraryItem, Option, CoverageCategory } from '../types';
import { ALL_COUNTRIES, ALL_OPTIONS } from '../constants';

export function getOptionsForItinerary(itinerary: ItineraryItem[]): Option[] {
  if (!itinerary || itinerary.length === 0) {
    return [];
  }

  const uniqueCountries = [...new Set(itinerary.map(item => item.country).filter(Boolean))];
  const countryToCategoryMap = new Map<string, CoverageCategory>();
  ALL_COUNTRIES.forEach(c => countryToCategoryMap.set(c.name.toLowerCase(), c.category));
  
  const nonEuCountries = uniqueCountries.filter(countryName => {
    const category = countryToCategoryMap.get(countryName.toLowerCase());
    return category && category !== 'EU';
  });

  if (nonEuCountries.length === 0) {
    return []; // All destinations are in EU, covered by base plan
  }

  const matchedOptions: Option[] = [];

  ALL_OPTIONS.forEach(baseOption => {
    const option: Option = JSON.parse(JSON.stringify(baseOption)); // Deep copy
    const coveredCountries: string[] = [];

    if (option.coverage.type === 'category' && option.coverage.category) {
      const optionCategory = option.coverage.category;

      nonEuCountries.forEach(countryName => {
        const countryCategory = countryToCategoryMap.get(countryName.toLowerCase());
        
        if (!countryCategory) return;

        // An option covers a country if categories match, or if the option is a broad category that includes the specific one.
        if (countryCategory === optionCategory) {
          coveredCountries.push(countryName);
        } else if (optionCategory === 'ExtraUE_World' && (countryCategory === 'TOP16' || countryCategory === 'USA')) {
          coveredCountries.push(countryName);
        }
      });
    }

    if (coveredCountries.length > 0) {
      option.coveredItineraryCountries = [...new Set(coveredCountries)]; // Ensure unique
      
      // A plan is recommended only if it covers ALL non-EU countries in the itinerary.
      const isFullMatch = nonEuCountries.every(c => option.coveredItineraryCountries!.includes(c));
      
      option.isRecommended = isFullMatch;
      
      matchedOptions.push(option);
    }
  });

  // Sort the results:
  // 1. Recommended options first.
  // 2. Then by type: monthly > weekly > daily.
  // 3. Then by number of covered countries.
  matchedOptions.sort((a, b) => {
    // Primary sort: Recommended flag
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;

    // Secondary sort: Plan type priority
    const typePriority = { 'monthly': 1, 'weekly': 2, 'daily': 3, 'special': 4, 'base': 5 };
    const priorityA = typePriority[a.type] || 99;
    const priorityB = typePriority[b.type] || 99;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Tertiary sort: number of covered countries (more is better)
    const coveredA = a.coveredItineraryCountries?.length || 0;
    const coveredB = b.coveredItineraryCountries?.length || 0;
    if (coveredA !== coveredB) {
      return coveredB - coveredA; // Descending order
    }
    
    return 0;
  });

  return matchedOptions;
}
