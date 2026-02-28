// src/components/monetization/FinancialAdvisorGate.tsx
import React from 'react';

interface FinancialAdvisorGateProps {
  children: React.ReactNode;
  onAccessGranted?: () => void;
}

const FinancialAdvisorGate: React.FC<FinancialAdvisorGateProps> = ({ 
  children, 
  onAccessGranted 
}) => {
  // SEMPRE permitir visualização da Stater IA
  // A verificação de mensagens será feita apenas no momento do ENVIO
  // Usuário pode VER quantas vezes quiser, mas não pode ENVIAR mais mensagens quando acabarem as 3
  
  // TODO: PLACEHOLDER PARA PAYWALL
  // Aqui vai ser implementado o componente de paywall quando necessário
  // Por enquanto sempre permite acesso para visualização
  
  return <>{children}</>;
};

export default FinancialAdvisorGate;
