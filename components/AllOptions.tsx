import React, { useState } from 'react';
import { ALL_OPTIONS } from '../constants';
import { OptionCard } from './OptionCard';
import { BookOpenIcon, ChevronDownIcon } from './Icons';

export const AllOptions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Exclude special 'a consumo' plans as they are not typical add-ons to browse
  const browsableOptions = ALL_OPTIONS.filter(option => option.type !== 'special');

  return (
    <div className="bg-white rounded-xl shadow-lg mt-8 overflow-hidden">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-tim-blue"
            aria-expanded={isOpen}
            aria-controls="all-options-grid"
        >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-tim-red flex-shrink-0"><BookOpenIcon /></div>
              <div>
                  <h2 className="text-2xl font-bold text-tim-blue">Catalogo Piani e Opzioni</h2>
                  <p className="text-tim-gray-600 mt-1">
                      Esplora tutte le opzioni di roaming disponibili.
                  </p>
              </div>
            </div>
            <ChevronDownIcon className={`w-6 h-6 text-tim-blue transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      
        {isOpen && (
            <div id="all-options-grid" className="p-6 md:p-8 pt-0 animate-fade-in">
              <div className="border-t border-tim-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {browsableOptions.map(option => (
                    <OptionCard key={option.id} option={option} />
                  ))}
                </div>
              </div>
            </div>
        )}
    </div>
  );
};