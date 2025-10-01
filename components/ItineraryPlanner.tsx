import React, { useState } from 'react';
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

const exampleText = `26/10/2025 – 09/11/2025 : Cina
09/11/2025 – 19/11/2025: Filippine
19/11/2025 – 28/11/2025: Indonesia`;

const toYYYYMMDD = (d: string) => d ? d.split('/').reverse().join('-') : '';
const fromYYYYMMDD = (d: string) => d ? d.split('-').reverse().join('/') : '';

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ itinerary, onItineraryChange, onParse, isLoading, error }) => {
  const [text, setText] = useState(exampleText);
  
  const sortedCountries = [...ALL_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

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

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full p-3 border border-tim-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tim-blue"
        placeholder="Esempio: 26/10/2025 – 09/11/2025: Cina..."
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
        {itinerary.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr,auto,auto,auto] gap-4 items-center p-4 border rounded-lg bg-tim-gray-100/50">
            {/* Country */}
            <div className="relative">
               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                 <span className="text-tim-gray-500 sm:text-sm h-5 w-5"><GlobeIcon/></span>
               </div>
               <select
                 value={item.country}
                 onChange={(e) => handleItemChange(item.id, 'country', e.target.value)}
                 className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tim-blue"
               >
                  <option value="">Seleziona Paese</option>
                  {sortedCountries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
               </select>
            </div>
            {/* Start Date */}
            <div className="relative">
                <input
                    type="date"
                    value={toYYYYMMDD(item.startDate)}
                    onChange={(e) => handleItemChange(item.id, 'startDate', fromYYYYMMDD(e.target.value))}
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tim-blue"
                />
            </div>
            {/* End Date */}
            <div className="relative">
                 <input
                    type="date"
                    value={toYYYYMMDD(item.endDate)}
                    onChange={(e) => handleItemChange(item.id, 'endDate', fromYYYYMMDD(e.target.value))}
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tim-blue"
                />
            </div>
            {/* Actions */}
             <button
                onClick={() => handleRemoveItem(item.id)}
                className="w-6 h-6 text-tim-gray-500 hover:text-tim-red transition-colors justify-self-end md:justify-self-center"
                aria-label="Remove item"
            >
                <TrashIcon />
            </button>
          </div>
        ))}
         <button
            onClick={handleAddItem}
            className="w-full text-sm font-semibold text-tim-blue hover:text-tim-red py-2"
         >
            + Aggiungi destinazione manualmente
         </button>
      </div>
    </div>
  );
};