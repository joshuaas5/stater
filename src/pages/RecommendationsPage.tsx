import React from 'react';
import HotContent from '@/components/financial-advisor/HotContent';
import NavBar from '@/components/navigation/NavBar';

const RecommendationsPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-foreground text-center">Recomendações</h1>
        <div className="w-full max-w-5xl">
          <HotContent />
        </div>
      </main>
      <NavBar />
    </div>
  );
};

export default RecommendationsPage;
