import React, { useState, useMemo, useCallback } from 'react';
import { OptionCard } from './components/OptionCard';
import { Header } from './components/Header';
import { getOptionsForItinerary } from './services/optionService';
import { ALL_COUNTRIES, ALL_OPTIONS } from './constants';
import type { Option, ItineraryItem } from './types';
import { Footer } from './components/Footer';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { parseItineraryFromText } from './services/geminiService';
import { SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [recommendedOptions, setRecommendedOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = useMemo<Option>(() => ({
      id: 'base-plan',
      name: '5G Power Unlimited Ricaricabile',
      type: 'base',
      cost: '35€',
      costUnit: 'mese',
      description: "Il tuo piano base attuale, ideale per l'Italia e l'Europa.",
      includes: {
        calls: 'Nazionali e Roaming UE Illimitate',
        data: '100 GB in Roaming Europa',
        sms: '1000 SMS/mese',
        internationalCalls: '1000 minuti/mese (con limiti verso 20 paesi)',
      },
      coverage: { type: 'countries', countries: ALL_COUNTRIES.filter(c => c.category === 'EU').map(c => c.name) },
      notes: 'I servizi 5G sono inclusi.'
  }), []);

  const handleParseItinerary = async (text: string) => {
    if (!text.trim()) {
      setError("Inserisci i dettagli del tuo viaggio.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const parsedItems = await parseItineraryFromText(text);
      setItinerary(parsedItems);
      const options = getOptionsForItinerary(parsedItems);
      setRecommendedOptions(options);
    } catch (e) {
      console.error(e);
      setError("Impossibile analizzare l'itinerario. Assicurati che il testo contenga destinazioni e date chiare.");
      setItinerary([]);
      setRecommendedOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItineraryChange = (updatedItinerary: ItineraryItem[]) => {
    setItinerary(updatedItinerary);
    if(updatedItinerary.length > 0) {
        const options = getOptionsForItinerary(updatedItinerary);
        setRecommendedOptions(options);
    } else {
        setRecommendedOptions([]);
    }
  };

  return (
    <div className="min-h-screen bg-tim-gray-100 font-sans text-tim-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-tim-blue mb-2">Il Tuo Piano Attuale</h2>
          <p className="text-tim-gray-600 mb-4">
            Le opzioni consigliate di seguito sono aggiuntive al tuo piano base.
          </p>
          <div className="w-full max-w-md mx-auto">
             <OptionCard option={currentPlan} isBasePlan={true}/>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 text-tim-red"><SparklesIcon/></div>
             <h2 className="text-2xl font-bold text-tim-blue">Pianificatore di Viaggio AI</h2>
           </div>
          <p className="text-tim-gray-600 mb-6">
            Incolla i dettagli del tuo viaggio (email, appunti, etc.) e lascia che l'IA trovi le migliori opzioni per te.
          </p>
          <ItineraryPlanner
            itinerary={itinerary}
            onItineraryChange={handleItineraryChange}
            onParse={handleParseItinerary}
            isLoading={isLoading}
            error={error}
          />

          <div className="mt-8">
            {itinerary.length > 0 && recommendedOptions.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-tim-blue mb-4">Opzioni Consigliate per il Tuo Itinerario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedOptions.map(option => (
                    <OptionCard key={option.id} option={option} />
                  ))}
                </div>
              </>
            )}
            {itinerary.length > 0 && recommendedOptions.length === 0 && (
              <div className="text-center py-10 px-6 bg-tim-gray-100 rounded-lg">
                <h3 className="text-xl font-semibold text-tim-blue">Nessuna opzione aggiuntiva necessaria</h3>
                <p className="text-tim-gray-600 mt-2">
                  Le destinazioni del tuo itinerario sono coperte dal tuo piano base "5G Power Unlimited".
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;