import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUserPreferences } from './localStorage';

/**
 * Formata um valor monetário de acordo com as preferências do usuário
 * @param value Valor a ser formatado
 * @param showSymbol Se deve mostrar o símbolo da moeda
 * @returns String formatada
 */
export const formatCurrency = (value: number, showSymbol = true): string => {
  const preferences = getUserPreferences();
  const currency = preferences.currency || 'BRL';
  const showCents = preferences.showCents !== false;
  
  // Formatação de acordo com a localidade brasileira (padrão)
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  });
  
  return formatter.format(value);
};

/**
 * Formata uma data de acordo com as preferências do usuário
 * @param date Data a ser formatada
 * @returns String formatada
 */
export const formatDate = (date: Date): string => {
  const preferences = getUserPreferences();
  const dateFormat = preferences.dateFormat || 'dd/MM/yyyy';
  
  return format(date, dateFormat, { locale: ptBR });
};

/**
 * Formata um número com separador de milhares
 * @param value Valor a ser formatado
 * @returns String formatada
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};
