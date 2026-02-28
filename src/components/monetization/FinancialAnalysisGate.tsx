// src/components/monetization/FinancialAnalysisGate.tsx
import React from 'react';

interface FinancialAnalysisGateProps {
  children: React.ReactNode;
}

const FinancialAnalysisGate: React.FC<FinancialAnalysisGateProps> = ({ children }) => {
  // DESATIVADO: Ads removidos conforme solicitacao
  // Sempre permitir acesso direto sem necessidade de assistir anuncios
  return <>{children}</>;
};

export default FinancialAnalysisGate;
