
import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Transaction } from '@/types';
import { getTransactions, isLoggedIn, getCurrentUser } from '@/utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  PiggyBank,
  Lightbulb
} from 'lucide-react';

const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [advisorInsights, setAdvisorInsights] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    const userData = getCurrentUser();
    setUser(userData);
    
    const userTransactions = getTransactions();
    setTransactions(userTransactions);
    
    // Generate financial insights based on transactions
    generateInsights(userTransactions);
  }, [navigate]);
  
  const generateInsights = (transactions: Transaction[]) => {
    const insights: string[] = [];
    
    // Calculate some basic financial metrics
    const income = transactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    
    // Generate insights based on financial situation
    if (savingsRate < 20) {
      insights.push("Sua taxa de economia está abaixo do recomendado de 20%. Tente reduzir despesas não essenciais para aumentar sua poupança.");
    } else {
      insights.push("Parabéns! Sua taxa de economia está acima de 20%, um excelente indicador de saúde financeira.");
    }
    
    // Check category distribution
    const categories: { [key: string]: number } = {};
    let totalExpenses = 0;
    
    transactions.filter(t => t.type === 'expense').forEach(transaction => {
      const category = transaction.category || 'Outros';
      categories[category] = (categories[category] || 0) + transaction.amount;
      totalExpenses += transaction.amount;
    });
    
    const housingExpenses = categories['Moradia'] || categories['Aluguel'] || 0;
    const housingRate = totalExpenses > 0 ? (housingExpenses / totalExpenses) * 100 : 0;
    
    if (housingRate > 30) {
      insights.push("Seus gastos com moradia estão acima de 30% do total de despesas. Especialistas recomendam manter esses gastos abaixo de 30% da sua renda.");
    }
    
    // Check for emergency fund
    if (savings < income * 6) {
      insights.push("É recomendado ter um fundo de emergência equivalente a 3-6 meses de despesas. Continue economizando para atingir essa meta.");
    } else {
      insights.push("Seu fundo de emergência parece adequado. Considere investir o excedente para fazer seu dinheiro trabalhar para você.");
    }
    
    // Random financial wisdom
    const generalAdvice = [
      "Adote a regra 50/30/20: destine 50% da renda para necessidades, 30% para desejos e 20% para poupança e investimentos.",
      "Automatize suas economias configurando transferências automáticas para sua conta de investimentos no dia do pagamento.",
      "Revise seus serviços recorrentes anualmente para identificar assinaturas desnecessárias ou oportunidades de negociação.",
      "Utilize a técnica de esperar 24 horas antes de fazer uma compra não planejada para evitar compras por impulso.",
      "Priorize o pagamento de dívidas de alto juros, como cartão de crédito, antes de investir em outros ativos.",
      "Diversifique seus investimentos para reduzir riscos e maximizar retornos no longo prazo.",
      "Estabeleça metas financeiras específicas e mensuráveis para aumentar sua motivação para economizar."
    ];
    
    // Add some general financial advice
    insights.push(generalAdvice[Math.floor(Math.random() * generalAdvice.length)]);
    insights.push(generalAdvice[Math.floor(Math.random() * generalAdvice.length)]);
    
    setAdvisorInsights(insights);
  };
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Consultor Financeiro" />
      
      <div className="p-4 space-y-6">
        <div className="bg-galileo-card p-4 rounded-lg shadow text-center">
          <Avatar className="h-20 w-20 mx-auto mb-4 bg-galileo-accent">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="text-2xl">CF</AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-semibold text-galileo-text">Olá, {user?.username || 'Usuário'}!</h2>
          <p className="text-galileo-secondaryText mt-2">
            Sou seu assistente financeiro pessoal. Analisei seus dados e tenho algumas dicas para melhorar sua saúde financeira.
          </p>
        </div>
        
        <div className="bg-galileo-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-galileo-text mb-4 flex items-center">
            <Lightbulb className="mr-2 text-yellow-500" size={24} />
            Insights Personalizados
          </h2>
          
          <div className="space-y-4">
            {advisorInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 py-2 border-b border-galileo-border last:border-0">
                {index % 2 === 0 ? (
                  <CheckCircle2 className="text-galileo-positive shrink-0 mt-1" size={20} />
                ) : (
                  <AlertCircle className="text-amber-500 shrink-0 mt-1" size={20} />
                )}
                <p className="text-galileo-text">{insight}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-galileo-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-galileo-text mb-4 flex items-center">
            <Calculator className="mr-2 text-blue-500" size={24} />
            Dicas Práticas para Sua Situação
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 py-2 border-b border-galileo-border">
              <PiggyBank className="text-green-500 shrink-0 mt-1" size={20} />
              <div>
                <p className="text-galileo-text font-medium">Regra 50/30/20</p>
                <p className="text-galileo-secondaryText">
                  Destine 50% da sua renda para necessidades, 30% para desejos e 20% para poupança e investimentos.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 py-2 border-b border-galileo-border">
              <TrendingUp className="text-galileo-positive shrink-0 mt-1" size={20} />
              <div>
                <p className="text-galileo-text font-medium">Fundo de Emergência</p>
                <p className="text-galileo-secondaryText">
                  Reserve de 3 a 6 meses de despesas para emergências em uma conta de alta liquidez.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 py-2">
              <AlertCircle className="text-galileo-negative shrink-0 mt-1" size={20} />
              <div>
                <p className="text-galileo-text font-medium">Evite Dívidas de Alto Juros</p>
                <p className="text-galileo-secondaryText">
                  Priorize o pagamento de dívidas com juros altos, como cartão de crédito, para economizar no longo prazo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <NavBar />
    </div>
  );
};

export default FinancialAdvisorPage;
