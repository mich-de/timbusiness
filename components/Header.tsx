
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-tim-blue shadow-md">
      <div className="container mx-auto px-4 py-6 md:px-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          TIM Business <span className="text-tim-red">Roaming Advisor</span>
        </h1>
        <p className="text-white opacity-90 mt-1">La tua guida per scegliere l'opzione migliore in viaggio.</p>
      </div>
    </header>
  );
};
