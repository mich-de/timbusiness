import React, { useState, useMemo } from 'react';
import type { ItineraryItem } from '../types';
import { ALL_COUNTRIES } from '../constants';
import { CalendarIcon, GlobeIcon, TrashIcon } from './Icons';

interface ItineraryPlannerProps {
  itinerary: ItineraryItem[];
  onItineraryChange: (itinerary: ItineraryItem[]) => void;
  onParse: (text: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const exampleText = 'Viaggio di lavoro in Cina, Filippine e Indonesia.';

const toYYYYMMDD = (d: string) => d ? d.split('/').reverse().join('-') : '';
const fromYYYYMMDD = (d: string) => d ? d.split('-').reverse().join('/') : '';

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ itinerary, onItineraryChange, onParse, isLoading, error }) => {
  const [text, setText] = useState(exampleText);
  const [visibleDates, setVisibleDates] = useState<Set<number>>(new Set());
  
  const sortedCountries = useMemo(() => 
    [...ALL_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const countryCodeMap = useMemo(() => 
    new Map(ALL_COUNTRIES.map(c => [c.name, c.code])),
    []
  );

  const handleAddItem = () => {
    const newItem: ItineraryItem = {
      id: Date.now(),
      country: '',
      startDate: '',
      endDate: '',
    };
    onItineraryChange([...itinerary, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    onItineraryChange(itinerary.filter(item => item.id !== id));
  };
  
  const handleItemChange = (id: number, field: keyof Omit<ItineraryItem, 'id'>, value: string) => {
    const updatedItinerary = itinerary.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onItineraryChange(updatedItinerary);
  };

  const handleClearDates = (id: number) => {
    const updatedItinerary = itinerary.map(item =>
      item.id === id ? { ...item, startDate: '', endDate: '' } : item
    );
    onItineraryChange(updatedItinerary);
  };
  
  const toggleDateVisibility = (id: number) => {
    const newVisibleDates = new Set(visibleDates);
    if (newVisibleDates.has(id)) {
      newVisibleDates.delete(id);
      handleClearDates(id);
    } else {
      newVisibleDates.add(id);
    }
    setVisibleDates(newVisibleDates);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full p-3 border border-tim-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tim-blue"
        placeholder="Esempio: Viaggio in Cina e Stati Uniti. Oppure: Dal 10/11 al 20/11 in Brasile."
      />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <button
        onClick={() => onParse(text)}
        disabled={isLoading}
        className="mt-4 w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tim-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-tim-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : 'Analizza Itinerario'}
      </button>

      <div className="mt-6 space-y-4">
        {itinerary.map((item) => {
          const countryCode = item.country ? countryCodeMap.get(item.country) : null;
          const areDatesVisible = visibleDates.has(item.id);
          return (
            <div key={item.id} className="p-4 border rounded-lg bg-tim-gray-100/50">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Country */}
                <div className="flex-grow min-w-[200px]">
                   <label htmlFor={`country-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">Paese</label>
                   <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        {countryCode ? (
                            <img 
                              src={`https://flagcdn.com/w20/${countryCode}.png`}
                              width="20"
                              alt={item.country}
                              className="h-auto rounded-sm"
                            />
                        ) : (
                          <span className="text-tim-gray-500 sm:text-sm h-5 w-5"><GlobeIcon/></span>
                        )}
                      </div>
                      <select
                        id={`country-${item.id}`}
                        value={item.country}
                        onChange={(e) => handleItemChange(item.id, 'country', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tim-blue"
                      >
                          <option value="">Seleziona Paese</option>
                          {sortedCountries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                   </div>
                </div>

                {/* Dates Section */}
                {areDatesVisible && (
                    <>
                      {/* Start Date */}
                      <div className="flex-shrink-0">
                          <label htmlFor={`start-date-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">Data Inizio</label>
                          <input
                              id={`start-date-${item.id}`}
                              type="date"
                              value={toYYYYMMDD(item.startDate)}
                              onChange={(e) => handleItemChange(item.id, 'startDate', fromYYYYMMDD(e.target.value))}
                              className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tim-blue"
                          />
                      </div>
                      {/* End Date */}
                      <div className="flex-shrink-0">
                           <label htmlFor={`end-date-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">Data Fine</label>
                           <input
                              id={`end-date-${item.id}`}
                              type="date"
                              value={toYYYYMMDD(item.endDate)}
                              onChange={(e) => handleItemChange(item.id, 'endDate', fromYYYYMMDD(e.target.value))}
                              className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tim-blue"
                          />
                      </div>
                    </>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 h-10">
                    <button
                        onClick={() => toggleDateVisibility(item.id)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-tim-blue hover:bg-tim-blue/10 rounded-md transition-colors"
                        aria-label={areDatesVisible ? "Rimuovi date" : "Aggiungi date"}
                    >
                        <CalendarIcon className="w-4 h-4" />
                        <span>{areDatesVisible ? 'Rimuovi date' : 'Aggiungi date'}</span>
                    </button>
                    <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-tim-gray-500 hover:text-tim-red transition-colors rounded-md hover:bg-red-100"
                        aria-label="Remove item"
                    >
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
              </div>
            </div>
          );
        })}
         <div className="mt-4">
             <button
                onClick={handleAddItem}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-tim-gray-300 text-sm font-medium rounded-lg text-tim-blue hover:border-tim-blue hover:bg-tim-blue/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tim-blue"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Aggiungi destinazione</span>
             </button>
         </div>
      </div>
    </div>
  );
};