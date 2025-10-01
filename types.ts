// Fix: Define all necessary types for the application.
export interface ItineraryItem {
  id: number;
  country: string;
  startDate: string;
  endDate: string;
}

export type CoverageCategory = 'EU' | 'USA' | 'TOP16' | 'ExtraUE_World' | 'Excluded_MondoNew';

export interface OptionCoverage {
  type: 'countries' | 'category' | 'special';
  countries?: string[];
  category?: CoverageCategory;
}

export interface OptionIncludes {
  calls?: string;
  callsOriginated?: string;
  callsReceived?: string;
  data?: string;
  sms?: string;
  internationalCalls?: string;
}

export interface Option {
  id: string;
  name: string;
  type: 'base' | 'monthly' | 'weekly' | 'daily' | 'special';
  cost: string;
  costUnit: 'mese' | 'settimana' | 'giorno' | 'consumo';
  description: string;
  includes: OptionIncludes;
  coverage: OptionCoverage;
  notes?: string;
  isRecommended?: boolean;
  coveredItineraryCountries?: string[];
}

export interface Country {
  name: string;
  category: CoverageCategory;
  code: string;
}