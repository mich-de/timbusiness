// Fix: Implement the OptionCard component.
import React from 'react';
import type { Option, OptionIncludes } from '../types';
import { BadgeCheckIcon, ChatBubbleBottomCenterTextIcon, GlobeAltIcon, MapPinIcon, PhoneIcon, WifiIcon } from './Icons';

interface OptionCardProps {
  option: Option;
  isBasePlan?: boolean;
}

const renderIncludes = (includes: OptionIncludes) => {
  const items = [];
  if (includes.calls) items.push({ icon: <PhoneIcon />, label: 'Chiamate', value: includes.calls });
  if (includes.callsOriginated) items.push({ icon: <PhoneIcon />, label: 'Chiamate Originate', value: includes.callsOriginated });
  if (includes.callsReceived) items.push({ icon: <PhoneIcon className="transform -scale-x-100"/>, label: 'Chiamate Ricevute', value: includes.callsReceived });
  if (includes.data) items.push({ icon: <WifiIcon />, label: 'Dati', value: includes.data });
  if (includes.sms) items.push({ icon: <ChatBubbleBottomCenterTextIcon />, label: 'SMS', value: includes.sms });
  if (includes.internationalCalls) items.push({ icon: <GlobeAltIcon />, label: 'Chiamate Internazionali', value: includes.internationalCalls });

  return (
    <ul className="space-y-3 mt-4 text-sm text-tim-gray-700">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <div className="w-5 h-5 text-tim-blue flex-shrink-0 mt-0.5">{item.icon}</div>
          <div className="flex-grow">
            <span className="font-semibold">{item.label}:</span>
            <span className="block text-tim-gray-600">{item.value}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export const OptionCard: React.FC<OptionCardProps> = ({ option, isBasePlan = false }) => {
  return (
    <div className={`flex flex-col rounded-xl overflow-hidden shadow-lg h-full ${isBasePlan ? 'bg-tim-blue/5' : 'bg-white'}`}>
      {option.isRecommended && !isBasePlan && (
        <div className="bg-tim-red text-white text-xs font-bold uppercase tracking-wider text-center py-1.5 flex items-center justify-center gap-1.5">
          <BadgeCheckIcon />
          <span>Consigliato</span>
        </div>
      )}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-tim-blue">{option.name}</h3>
        <p className="text-sm text-tim-gray-600 mt-1 flex-grow">{option.description}</p>
        
        <div className="my-4">
          <span className="text-3xl font-extrabold text-tim-blue">{option.cost}</span>
          <span className="text-tim-gray-500"> / {option.costUnit}</span>
        </div>

        {option.coveredItineraryCountries && option.coveredItineraryCountries.length > 0 && (
          <div className="mb-4 pt-4 border-t border-tim-gray-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-tim-gray-800 mb-2">
                  <div className="w-5 h-5 text-tim-blue"><MapPinIcon /></div>
                  <span>Copertura per il tuo itinerario</span>
              </div>
              <div className="flex flex-wrap gap-2">
                  {option.coveredItineraryCountries.map(country => (
                      <span key={country} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                          {country}
                      </span>
                  ))}
              </div>
          </div>
        )}
        
        <div className="border-t border-tim-gray-200">
          {renderIncludes(option.includes)}
        </div>

        {option.notes && (
          <div className="mt-auto pt-4 border-t border-tim-gray-200">
            <p className="text-xs text-tim-gray-500">{option.notes}</p>
          </div>
        )}
      </div>
      {!isBasePlan && (
        <div className="bg-tim-gray-100 p-4 text-center">
            <a href="#" className="font-bold text-tim-blue hover:underline">Attiva Ora</a>
        </div>
      )}
    </div>
  );
};