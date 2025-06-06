// src/pages/FinancialAnalysisPage.tsx
import React from 'react';
import FinancialHealthScoreCard from '@/components/personal_analysis/FinancialHealthScoreCard';
import BookOfTheWeek from '@/components/personal_analysis/BookOfTheWeek';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinancialAnalysisPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Button 
        variant="outline" 
        className="mb-6 flex items-center"
        onClick={() => navigate(-1)} // Navega para a página anterior
      >
        <ArrowLeft size={18} className="mr-2" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-semibold mb-6 text-foreground">Sua Análise Financeira Detalhada</h1>
          <FinancialHealthScoreCard />
        </div>
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-foreground mt-1">Dica da Semana</h2>
          <BookOfTheWeek />
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalysisPage;
