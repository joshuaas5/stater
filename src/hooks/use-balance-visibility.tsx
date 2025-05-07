
import { useState, useEffect } from 'react';

export const useBalanceVisibility = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  
  // Carrega o estado salvo no localStorage quando o componente monta
  useEffect(() => {
    const savedVisibility = localStorage.getItem('balanceVisibility');
    if (savedVisibility !== null) {
      setIsBalanceVisible(savedVisibility === 'true');
    }
  }, []);
  
  // Salva o estado no localStorage quando ele muda
  const toggleBalanceVisibility = () => {
    const newValue = !isBalanceVisible;
    setIsBalanceVisible(newValue);
    localStorage.setItem('balanceVisibility', String(newValue));
  };
  
  return { isBalanceVisible, toggleBalanceVisibility };
};
