import React, { useState } from 'react';
import type { ItineraryItem } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { OptionCard } from './components/OptionCard';
import { parseItineraryFromText } from './services/geminiService';
import { findRecommendedOptions, RecommendedOptions } from './services/optionService';
import { AllOptions } from './components/AllOptions';

function App() {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [recommended, setRecommended] = useState<RecommendedOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParseItinerary = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setRecommended(null);
    try {
      const parsed = await parseItineraryFromText(text);
      setItinerary(parsed);
      
      if (parsed.length > 0) {
        const options = findRecommendedOptions(parsed);
        setRecommended(options);
      } else {
        setRecommended(null);
      }

    } catch (e) {
      console.error(e);
      setError('Spiacenti, si è verificato un errore durante l\'analisi del testo. Prova a riformulare la richiesta o aggiungi manualmente i paesi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItineraryChange = (newItinerary: ItineraryItem[]) => {
    setItinerary(newItinerary);
    if (newItinerary.length > 0) {
      const options = findRecommendedOptions(newItinerary);
      setRecommended(options);
    } else {
      setRecommended(null);
    }
  }

  const hasResults = recommended && (recommended.baseOption || recommended.recommended.length > 0);

  return (
    <div className="bg-tim-gray-100 min-h-screen font-sans text-tim-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Section 1: Itinerary Planner */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-tim-blue">1. Inserisci il tuo Itinerario</h2>
            <p className="text-tim-gray-600 mt-1">
                Descrivi il tuo viaggio o aggiungi manually le destinazioni. Il nostro assistente AI capirà dove stai andando.
            </p>
            <div className="mt-6">
              <ItineraryPlanner
                itinerary={itinerary}
                onItineraryChange={handleItineraryChange}
                onParse={handleParseItinerary}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </section>

          {/* Section 2: Results */}
          {isLoading && (
             <div className="text-center py-12">
                <svg className="animate-spin mx-auto h-10 w-10 text-tim-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-tim-blue">Analisi dell'itinerario in corso...</p>
             </div>
          )}

          {hasResults && (
            <section className="mt-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-tim-blue mb-4">2. Opzioni Consigliate per Te</h2>
              <div className="space-y-6">
                  {recommended.baseOption && (
                    <OptionCard option={recommended.baseOption} isBasePlan={true} />
                  )}
                  {recommended.recommended.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recommended.recommended.map(option => (
                        <OptionCard key={option.id} option={option} />
                      ))}
                    </div>
                  )}
              </div>
            </section>
          )}

          {recommended && recommended.special.length > 0 && (
            <section className="mt-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-tim-blue mb-4">Opzioni Speciali</h2>
               <p className="text-tim-gray-600 mb-4 -mt-2">Queste opzioni hanno tariffe a consumo e non sono incluse nei piani standard. Sono utili per viaggi in nave o in aereo.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {recommended.special.map(option => (
                    <OptionCard key={option.id} option={option} />
                  ))}
              </div>
            </section>
          )}
          
          <AllOptions />

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
