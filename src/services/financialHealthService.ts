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

// Nota de poupança: 100% baseada no patrimônio acumulado
const calculateSavingsScore = (netMonthlyIncome: number, currentTotalBalance: number): number => {
  if (netMonthlyIncome <= 0) {
    // Nova lógica para quando a renda mensal é zero ou negativa
    if (currentTotalBalance >= 30000) return 100; // Acima de 30k = Excelente
    if (currentTotalBalance >= 15000) return 75;  // Entre 15k e 30k = Bom
    if (currentTotalBalance >= 5000) return 50;   // Entre 5k e 15k = Regular
    if (currentTotalBalance > 0) return 25;       // Algum saldo positivo = Ruim, mas não zero
    return 0; // Sem saldo e sem renda = Zero
  }

  // Lógica original para quando há renda mensal positiva
  const patrimonioMultiplo = currentTotalBalance / netMonthlyIncome;
  if (patrimonioMultiplo <= 0) return 0; // Se o saldo for negativo ou zero, mesmo com renda.
  if (patrimonioMultiplo >= 12) return 100; // Acumulou 12x a renda mensal = Excelente
  return parseFloat(((patrimonioMultiplo / 12) * 100).toFixed(1));
};

// Nota de contas em dia: 100 se nenhuma vencida, decresce conforme número/valor de contas vencidas
const calculateBillsOnTimeScore = (debts: Debt[]): number => {
  const now = new Date();
  const overdue = debts.filter(bill => !bill.isPaid && bill.dueDate && new Date(bill.dueDate) < now);
  if (debts.length === 0) return 100; // Nenhuma conta lançada
  if (overdue.length === 0) return 100;
  // Penaliza de acordo com % de contas vencidas
  const percentOverdue = overdue.length / debts.length;
  return parseFloat((100 - percentOverdue * 100).toFixed(1));
};

// Nota de uso do app: baseado em contador salvo no localStorage (0 a 100, máximo em 30 acessos/mês)
const calculateAppUsageScore = (): number => {
  try {
    const raw = localStorage.getItem('appAccessCount');
    const count = raw ? parseInt(raw, 10) : 0;
    return Math.min(100, (count / 30) * 100);
  } catch {
    return 0;
  }
};

// Nota de interação com IA: baseado em contador salvo no localStorage (0 a 100, máximo em 15 interações/mês)
const calculateIAInteractionScore = (): number => {
  try {
    const raw = localStorage.getItem('iaInteractionCount');
    const count = raw ? parseInt(raw, 10) : 0;
    return Math.min(100, (count / 15) * 100);
  } catch {
    return 0;
  }
};

const calculateDebtScore = (totalDebt: number, netMonthlyIncome: number): number => {
  if (netMonthlyIncome <= 0) {
    return totalDebt > 0 ? 5.0 : 95.0; // Se não há renda, dívida é ruim, sem dívida é bom.
  }
  const dtiRatio = totalDebt / netMonthlyIncome; // ex: 0.3 para 30%

  let score = 0;
  if (dtiRatio >= 0.6) { // DTI >= 60%
    score = 5.0;
  } else if (dtiRatio >= 0.5) { // DTI 50-60%
    score = 15.0 - ((dtiRatio - 0.5) / 0.1) * 10.0; // entre 5 e 15 (invertido)
  } else if (dtiRatio >= 0.4) { // DTI 40-50%
    score = 35.0 - ((dtiRatio - 0.4) / 0.1) * 20.0; // entre 15 e 35 (invertido)
  } else if (dtiRatio >= 0.3) { // DTI 30-40%
    score = 60.0 - ((dtiRatio - 0.3) / 0.1) * 25.0; // entre 35 e 60 (invertido)
  } else if (dtiRatio >= 0.15) { // DTI 15-30%
    score = 85.0 - ((dtiRatio - 0.15) / 0.15) * 25.0; // entre 60 e 85 (invertido)
  } else { // DTI < 15%
    score = Math.min(100.0, 95.0 + ((0.15 - dtiRatio) / 0.15) * 5.0); // Tende a 100, máximo em 100
  }
  return parseFloat(score.toFixed(1));
};

const calculateLiquidityScore = (currentTotalBalance: number, totalMonthlyExpenses: number): number => {
  if (totalMonthlyExpenses <= 0) {
    return currentTotalBalance > 0 ? 95.0 : 5.0;
  }
  const monthsCovered = currentTotalBalance / totalMonthlyExpenses; // Meses de despesas cobertos

  let score = 0;
  if (monthsCovered < 0.5) { // Menos de 0.5 mês
    score = 5.0 + (monthsCovered / 0.5) * 15.0; // entre 5 e 20
  } else if (monthsCovered < 1) { // 0.5-1 mês
    score = 20.0 + ((monthsCovered - 0.5) / 0.5) * 20.0; // entre 20 e 40
  } else if (monthsCovered < 2) { // 1-2 meses
    score = 40.0 + ((monthsCovered - 1) / 1) * 25.0; // entre 40 e 65
  } else if (monthsCovered < 4) { // 2-4 meses
    score = 65.0 + ((monthsCovered - 2) / 2) * 25.0; // entre 65 e 90
  } else { // >= 4 meses
    score = Math.min(100.0, 90.0 + ((monthsCovered - 4) / 2) * 10.0); // Tende a 100, máximo em 100 para 6 meses
  }
  return parseFloat(score.toFixed(1));
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

  const savingsScore = calculateSavingsScore(netMonthlyIncome, currentTotalBalance);
  const debtScore = calculateDebtScore(totalDebt, netMonthlyIncome);
  const liquidityScore = calculateLiquidityScore(currentTotalBalance, totalMonthlyExpenses);
  const billsOnTimeScore = calculateBillsOnTimeScore(debts);
  const appUsageScore = typeof window !== 'undefined' ? calculateAppUsageScore() : 50; // fallback SSR
  const iaInteractionScore = typeof window !== 'undefined' ? calculateIAInteractionScore() : 50;

  // Pesos: Poupança (40%), Endividamento (30%), Liquidez (20%), Contas em dia (5%), Uso app (2.5%), IA (2.5%)
  const finalScore = (
    savingsScore * 0.4 +
    debtScore * 0.3 +
    liquidityScore * 0.2 +
    billsOnTimeScore * 0.05 +
    appUsageScore * 0.025 +
    iaInteractionScore * 0.025
  );

  return {
    finalScore: parseFloat(finalScore.toFixed(1)),
    savingsScore: parseFloat(savingsScore.toFixed(1)),
    debtScore: parseFloat(debtScore.toFixed(1)),
    liquidityScore: parseFloat(liquidityScore.toFixed(1)),
    billsOnTimeScore: parseFloat(billsOnTimeScore.toFixed(1)),
    appUsageScore: parseFloat(appUsageScore.toFixed(1)),
    iaInteractionScore: parseFloat(iaInteractionScore.toFixed(1)),
    // Adicionar os valores brutos para possível exibição ou depuração
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
