import React from 'react';
import { Transaction } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, Repeat } from 'lucide-react';

interface RecurrenceConfigProps {
  transaction: Partial<Transaction>;
  onChange: (transaction: Partial<Transaction>) => void;
}

const weekDays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export const RecurrenceConfig: React.FC<RecurrenceConfigProps> = ({ 
  transaction, 
  onChange 
}) => {
  const handleRecurrenceToggle = (checked: boolean) => {
    onChange({
      ...transaction,
      isRecurring: checked,
      recurrenceFrequency: checked ? 'monthly' : undefined,
      recurringDay: checked && transaction.recurrenceFrequency === 'monthly' ? 1 : undefined,
      recurringWeekday: checked && transaction.recurrenceFrequency === 'weekly' ? 1 : undefined,
      nextOccurrence: checked ? calculateNextOccurrence(transaction) : undefined
    });
  };

  const handleFrequencyChange = (frequency: 'weekly' | 'monthly' | 'yearly') => {
    const updates: Partial<Transaction> = {
      ...transaction,
      recurrenceFrequency: frequency
    };

    // Definir valores padrão baseados na frequência
    if (frequency === 'weekly') {
      updates.recurringWeekday = 1; // Segunda-feira por padrão
      updates.recurringDay = undefined;
    } else if (frequency === 'monthly' || frequency === 'yearly') {
      updates.recurringDay = 1; // Dia 1 por padrão
      updates.recurringWeekday = undefined;
    }

    updates.nextOccurrence = calculateNextOccurrence(updates);
    onChange(updates);
  };

  const handleDayChange = (value: string) => {
    const updates = {
      ...transaction,
      recurringDay: parseInt(value)
    };
    updates.nextOccurrence = calculateNextOccurrence(updates);
    onChange(updates);
  };

  const handleWeekdayChange = (value: string) => {
    const updates = {
      ...transaction,
      recurringWeekday: parseInt(value)
    };
    updates.nextOccurrence = calculateNextOccurrence(updates);
    onChange(updates);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
      <div className="flex items-center space-x-3">
        <Repeat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <Label className="text-base font-medium dark:text-gray-200">Transação Recorrente</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="recurring"
          checked={transaction.isRecurring || false}
          onCheckedChange={handleRecurrenceToggle}
        />
        <Label htmlFor="recurring" className="text-sm dark:text-gray-300">
          Repetir esta transação automaticamente
        </Label>
      </div>
      
      {transaction.isRecurring && (
        <div className="space-y-4 ml-6 p-3 border-l-2 border-blue-200 dark:border-blue-700">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 dark:text-gray-200">
              <Clock className="h-4 w-4" />
              Frequência
            </Label>
            <Select 
              value={transaction.recurrenceFrequency || 'monthly'} 
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                <SelectItem value="weekly" className="dark:text-gray-200 dark:focus:bg-gray-600">
                  🗓️ Semanal (toda semana)
                </SelectItem>
                <SelectItem value="monthly" className="dark:text-gray-200 dark:focus:bg-gray-600">
                  📅 Mensal (todo mês)
                </SelectItem>
                <SelectItem value="yearly" className="dark:text-gray-200 dark:focus:bg-gray-600">
                  🎂 Anual (todo ano)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {transaction.recurrenceFrequency === 'weekly' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium dark:text-gray-200">Dia da semana</Label>
              <Select 
                value={transaction.recurringWeekday?.toString() || '1'} 
                onValueChange={handleWeekdayChange}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  <SelectValue placeholder="Selecione o dia da semana" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {weekDays.map(day => (
                    <SelectItem 
                      key={day.value} 
                      value={day.value.toString()}
                      className="dark:text-gray-200 dark:focus:bg-gray-600"
                    >
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {(transaction.recurrenceFrequency === 'monthly' || transaction.recurrenceFrequency === 'yearly') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium dark:text-gray-200">
                Dia do {transaction.recurrenceFrequency === 'monthly' ? 'mês' : 'ano'}
              </Label>
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 15"
                value={transaction.recurringDay || ''}
                onChange={(e) => handleDayChange(e.target.value)}
                className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {transaction.recurrenceFrequency === 'monthly' 
                  ? 'Dia do mês (1-31)' 
                  : 'Dia do ano (mesma data todo ano)'}
              </p>
            </div>
          )}
          
          {/* Prévia da próxima ocorrência */}
          {transaction.nextOccurrence && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-300">Próxima execução:</span>
                <span className="text-blue-700 dark:text-blue-200">
                  {new Date(transaction.nextOccurrence).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Função auxiliar para calcular a próxima ocorrência
const calculateNextOccurrence = (transaction: Partial<Transaction>): Date | undefined => {
  if (!transaction.recurrenceFrequency) return undefined;

  const now = new Date();
  const next = new Date();

  switch (transaction.recurrenceFrequency) {
    case 'weekly':
      if (transaction.recurringWeekday !== undefined) {
        const daysUntilNext = (transaction.recurringWeekday + 7 - now.getDay()) % 7;
        next.setDate(now.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
      }
      break;
    
    case 'monthly':
      if (transaction.recurringDay) {
        next.setDate(transaction.recurringDay);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
      }
      break;
    
    case 'yearly':
      if (transaction.recurringDay) {
        next.setMonth(now.getMonth());
        next.setDate(transaction.recurringDay);
        if (next <= now) {
          next.setFullYear(next.getFullYear() + 1);
        }
      }
      break;
  }

  return next;
};

export default RecurrenceConfig;
