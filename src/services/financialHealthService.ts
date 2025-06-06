// src/services/financialHealthService.ts

import { Transaction, Bill as Debt } from '@/types'; // Ajustado para o caminho correto e usando Bill as Debt
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

// TODO: Definir interfaces para os dados de entrada e saída, se necessário

/**
 * Calcula a Renda Mensal Líquida com base nas transações de um período.
 * @param transactions - Lista de transações.
 * @param referenceDate - A data de referência para buscar o último mês completo.
 * @returns A Renda Mensal Líquida.
 */
const calculateNetMonthlyIncome = (transactions: Transaction[], referenceDate: Date): number => {
  const lastMonthStart = startOfMonth(subMonths(referenceDate, 1));
  const lastMonthEnd = endOfMonth(subMonths(referenceDate, 1));

  return transactions
    .filter(t => {
      const transactionDate = typeof t.date === 'string' ? parseISO(t.date) : t.date;
      return (
        t.type === 'income' &&
        isWithinInterval(transactionDate, { start: lastMonthStart, end: lastMonthEnd })
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calcula as Despesas Mensais Totais com base nas transações de um período.
 * @param transactions - Lista de transações.
 * @param referenceDate - A data de referência para buscar o último mês completo.
 * @returns As Despesas Mensais Totais.
 */
const calculateTotalMonthlyExpenses = (transactions: Transaction[], referenceDate: Date): number => {
  const lastMonthStart = startOfMonth(subMonths(referenceDate, 1));
  const lastMonthEnd = endOfMonth(subMonths(referenceDate, 1));

  return transactions
    .filter(t => {
      const transactionDate = typeof t.date === 'string' ? parseISO(t.date) : t.date;
      return (
        t.type === 'expense' &&
        isWithinInterval(transactionDate, { start: lastMonthStart, end: lastMonthEnd })
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calcula o Valor que o usuário consegue guardar por mês.
 * @param netMonthlyIncome - Renda Mensal Líquida.
 * @param totalMonthlyExpenses - Despesas Mensais Totais.
 * @returns O valor guardado por mês.
 */
const calculateMonthlySavingsAmount = (netMonthlyIncome: number, totalMonthlyExpenses: number): number => {
  return netMonthlyIncome - totalMonthlyExpenses;
};

/**
 * Calcula a Dívida Total.
 * @param debts - Lista de dívidas.
 * @returns A Dívida Total.
 */
const calculateTotalDebt = (debts: Debt[]): number => {
  return debts
    .filter(debt => !debt.isPaid) // Considera apenas dívidas não pagas
    .reduce((sum, debt) => sum + debt.amount, 0);
};

/**
 * Calcula o Saldo Atual Total com base em todas as transações.
 * @param transactions - Lista de todas as transações.
 * @returns O Saldo Atual Total.
 */
const calculateCurrentTotalBalance = (transactions: Transaction[]): number => {
  let balance = 0;
  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      balance += transaction.amount;
    } else {
      balance -= transaction.amount;
    }
  }
  return balance;
};

// Funções para calcular as pontuações parciais (Poupança, Endividamento, Liquidez)

const calculateSavingsScore = (monthlySavingsAmount: number, netMonthlyIncome: number): number => {
  if (netMonthlyIncome <= 0) return 0; // Evita divisão por zero e poupança negativa não faz sentido aqui
  const savingsCapacity = (monthlySavingsAmount / netMonthlyIncome) * 100;

  if (savingsCapacity >= 20) return 10;
  if (savingsCapacity >= 10) return 5;
  return 0;
};

const calculateDebtScore = (totalDebt: number, netMonthlyIncome: number): number => {
  if (netMonthlyIncome <= 0) {
    // Se não há renda, qualquer dívida é problemática, a menos que a dívida seja zero.
    return totalDebt > 0 ? 0 : 10; 
  }
  const dti = totalDebt / netMonthlyIncome;

  if (dti <= 0.2) return 10;
  if (dti <= 0.4) return 5;
  return 0;
};

const calculateLiquidityScore = (currentTotalBalance: number, totalMonthlyExpenses: number): number => {
  if (totalMonthlyExpenses <= 0) {
    // Se não há despesas, qualquer saldo positivo é boa liquidez.
    // Se o saldo também for zero ou negativo, a liquidez é baixa.
    return currentTotalBalance > 0 ? 10 : 0;
  }
  const ilgAdapted = currentTotalBalance / totalMonthlyExpenses;

  if (ilgAdapted >= 3) return 10;
  if (ilgAdapted >= 1) return 5;
  return 0;
};

/**
 * Calcula a Nota de Saúde Financeira final.
 * @param transactions - Lista de todas as transações do usuário.
 * @param debts - Lista de todas as dívidas do usuário.
 * @returns Um objeto com a pontuação final e as pontuações parciais.
 */
export const calculateFinancialHealthScore = (transactions: Transaction[], debts: Debt[]) => {
  const currentDate = new Date();

  const netMonthlyIncome = calculateNetMonthlyIncome(transactions, currentDate);
  const totalMonthlyExpenses = calculateTotalMonthlyExpenses(transactions, currentDate);
  const monthlySavingsAmount = calculateMonthlySavingsAmount(netMonthlyIncome, totalMonthlyExpenses);
  const totalDebt = calculateTotalDebt(debts);
  const currentTotalBalance = calculateCurrentTotalBalance(transactions);

  const savingsScore = calculateSavingsScore(monthlySavingsAmount, netMonthlyIncome);
  const debtScore = calculateDebtScore(totalDebt, netMonthlyIncome);
  const liquidityScore = calculateLiquidityScore(currentTotalBalance, totalMonthlyExpenses);

  // Aplicar pesos e calcular a nota final
  // Pesos: Poupança (3), Endividamento (4), Liquidez (3)
  const totalWeight = 3 + 4 + 3;
  const finalScore = (savingsScore * 3 + debtScore * 4 + liquidityScore * 3) / totalWeight;


  return {
    finalScore: parseFloat(finalScore.toFixed(1)), // Arredondar para 1 casa decimal
    savingsScore,
    debtScore,
    liquidityScore,
    // Poderíamos retornar os valores base também para exibição/detalhes
    netMonthlyIncome,
    totalMonthlyExpenses,
    monthlySavingsAmount,
    totalDebt,
    currentTotalBalance
  };
};

// Exemplo de como os tipos podem ser (ajustar conforme sua estrutura real em @/types/finance)
// export interface Transaction {
//   id: string;
//   title: string;
//   amount: number;
//   type: 'income' | 'expense';
//   date: string | Date;
//   category: string;
//   isRecurring?: boolean;
//   // ... outros campos
// }

// export interface Debt {
//   id: string;
//   name: string;
//   totalAmount: number;
//   remainingAmount: number;
//   // ... outros campos
// }
