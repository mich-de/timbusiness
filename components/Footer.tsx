
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-12 py-6 border-t border-tim-gray-200">
      <div className="container mx-auto px-4 md:px-8 text-center text-tim-gray-500 text-sm">
        <p>
          Questo strumento è un consulente non ufficiale basato sulla documentazione fornita.
        </p>
        <p className="mt-1">
          Tutti i prezzi indicati sono IVA esclusa, salvo diversa specificazione. Verificare sempre i dettagli sul sito ufficiale TIM Business.
        </p>
      </div>
    </footer>
  );
};
