
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import TransactionItem from '@/components/transactions/TransactionItem';
import { Transaction } from '@/types';
import { getTransactions, isLoggedIn } from '@/utils/localStorage';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    // Carregar as transações do usuário
    const userTransactions = getTransactions();
    setTransactions(userTransactions);
  }, [navigate]);
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery('');
    }
  };
  
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      transaction.title.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query) ||
      transaction.amount.toString().includes(query)
    );
  });
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader 
        title="Transações" 
        showSearch={true}
        onSearch={toggleSearch}
      />
      
      {isSearchOpen && (
        <div className="px-4 py-2 bg-galileo-background">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar transações..."
            className="w-full p-2 bg-galileo-accent border border-galileo-border rounded-lg text-galileo-text"
            autoFocus
          />
        </div>
      )}
      
      <div className="mt-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-galileo-secondaryText">
            <p>Nenhuma transação encontrada</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-galileo-text underline"
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        )}
      </div>
      
      <NavBar />
    </div>
  );
};

export default Transactions;
