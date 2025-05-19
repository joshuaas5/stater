import React from 'react';
import HotContent from '@/components/financial-advisor/HotContent';
import NavBar from '@/components/navigation/NavBar';

const RecommendationsPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Recomendações</h1>
        <HotContent />
      </main>
    </div>
  );
};

export default RecommendationsPage;
