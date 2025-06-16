// SOLUÇÃO RÁPIDA: Força a atualização do Dashboard
// Adicione este código no final do src/pages/Dashboard.tsx

// No useEffect principal, adicionar:
useEffect(() => {
  // Atualizar a cada 2 segundos para garantir sincronização
  const interval = setInterval(() => {
    const allTransactions = getTransactions();
    setTransactions(allTransactions.slice(0, 20)); // Mostrar últimas 20
  }, 2000);

  return () => clearInterval(interval);
}, []);

// Ou alternativa mais simples:
// Adicionar um botão "Atualizar" no Dashboard
const handleRefresh = () => {
  const allTransactions = getTransactions();
  setTransactions(allTransactions);
  toast({
    title: "Lista atualizada",
    description: `${allTransactions.length} transações carregadas`
  });
};
