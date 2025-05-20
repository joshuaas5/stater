import React from 'react';
import HotContent from '@/components/financial-advisor/HotContent';
import NavBar from '@/components/navigation/NavBar';

const RecommendationsPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-2 md:px-4 py-4 md:py-8 flex flex-col items-center">
        {/* Removido o cabeçalho duplicado */}
        <div className="w-full">
          <HotContent />
        </div>
      </main>
      <NavBar />
    </div>
  );
};

export default RecommendationsPage;
