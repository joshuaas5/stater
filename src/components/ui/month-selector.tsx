
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getWeeksInMonth, getWeekStartDay } from '@/utils/weekStart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  onMonthChange: (month: number, year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ onMonthChange }) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 
    'Maio', 'Junho', 'Julho', 'Agosto', 
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [date, setDate] = useState<Date | undefined>(currentDate);
  
  const handlePrevMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setDate(new Date(newYear, newMonth, 1));
    onMonthChange(newMonth, newYear);
  };
  
  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setDate(new Date(newYear, newMonth, 1));
    onMonthChange(newMonth, newYear);
  };
  
  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const month = newDate.getMonth();
      const year = newDate.getFullYear();
      
      setSelectedMonth(month);
      setSelectedYear(year);
      setDate(newDate);
      onMonthChange(month, year);
    }
  };
  
  // Generate a background color for each month
  const monthColors = [
    'bg-blue-100 dark:bg-blue-900/50', 
    'bg-purple-100 dark:bg-purple-900/50', 
    'bg-green-100 dark:bg-green-900/50', 
    'bg-yellow-100 dark:bg-yellow-900/50',
    'bg-pink-100 dark:bg-pink-900/50', 
    'bg-red-100 dark:bg-red-900/50', 
    'bg-indigo-100 dark:bg-indigo-900/50', 
    'bg-orange-100 dark:bg-orange-900/50',
    'bg-teal-100 dark:bg-teal-900/50', 
    'bg-cyan-100 dark:bg-cyan-900/50', 
    'bg-amber-100 dark:bg-amber-900/50', 
    'bg-lime-100 dark:bg-lime-900/50'
  ];
  
  const borderColors = [
    'border-blue-300 dark:border-blue-700', 
    'border-purple-300 dark:border-purple-700', 
    'border-green-300 dark:border-green-700', 
    'border-yellow-300 dark:border-yellow-700',
    'border-pink-300 dark:border-pink-700', 
    'border-red-300 dark:border-red-700', 
    'border-indigo-300 dark:border-indigo-700', 
    'border-orange-300 dark:border-orange-700',
    'border-teal-300 dark:border-teal-700', 
    'border-cyan-300 dark:border-cyan-700', 
    'border-amber-300 dark:border-amber-700', 
    'border-lime-300 dark:border-lime-700'
  ];
  
  const textColors = [
    'text-blue-800 dark:text-blue-100',
    'text-purple-800 dark:text-purple-100',
    'text-green-800 dark:text-green-100',
    'text-yellow-800 dark:text-yellow-100',
    'text-pink-800 dark:text-pink-100',
    'text-red-800 dark:text-red-100',
    'text-indigo-800 dark:text-indigo-100',
    'text-orange-800 dark:text-orange-100',
    'text-teal-800 dark:text-teal-100',
    'text-cyan-800 dark:text-cyan-100',
    'text-amber-800 dark:text-amber-100',
    'text-lime-800 dark:text-lime-100'
  ];
  
  // Gerar padrões de fundo baseados no mês
  const getMonthPattern = () => {
    const patterns = [
      'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white dark:from-blue-900/40 dark:via-blue-800/30 dark:to-background',
      'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-purple-200 via-purple-100 to-purple-50 dark:from-purple-900/40 dark:via-purple-800/30 dark:to-background',
      'bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-green-100 to-green-50 dark:from-green-900/40 dark:to-background',
      'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-200 via-amber-100 to-amber-50 dark:from-amber-900/40 dark:via-amber-800/30 dark:to-background',
      'bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-pink-200 via-pink-100 to-pink-50 dark:from-pink-900/40 dark:via-pink-800/30 dark:to-background',
      'bg-[linear-gradient(to_left,_var(--tw-gradient-stops))] from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-background',
      'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-200 via-sky-100 to-sky-50 dark:from-sky-900/40 dark:via-sky-800/30 dark:to-background',
      'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-yellow-200 via-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:via-yellow-800/30 dark:to-background',
      'bg-[linear-gradient(to_bottom_right,_var(--tw-gradient-stops))] from-teal-100 to-teal-50 dark:from-teal-900/40 dark:to-background',
      'bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-rose-200 via-rose-100 to-rose-50 dark:from-rose-900/40 dark:via-rose-800/30 dark:to-background',
      'bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-indigo-200 via-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:via-indigo-800/30 dark:to-background',
      'bg-[linear-gradient(to_top_left,_var(--tw-gradient-stops))] from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-background'
    ];
    return patterns[selectedMonth];
  };

  // Gerar decorações sazonais baseadas no mês
  const getMonthDecoration = () => {
    // Elementos decorativos sutis para cada mês
    const decorations = [
      '❄️', // Janeiro - flocos de neve
      '💕', // Fevereiro - corações
      '🌱', // Março - brotos
      '🌷', // Abril - flores
      '🌿', // Maio - folhas
      '☀️', // Junho - sol
      '🌊', // Julho - ondas
      '🌴', // Agosto - palmeiras
      '📚', // Setembro - livros (volta às aulas)
      '🍂', // Outubro - folhas caindo
      '🌧️', // Novembro - chuva
      '✨'  // Dezembro - estrelas
    ];
    return decorations[selectedMonth];
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border ${borderColors[selectedMonth]} shadow-md transition-all duration-300 ${getMonthPattern()}`}>
      {/* Botões de navegação */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-3 py-3 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePrevMonth}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-full h-8 w-8"
        >
          <ChevronLeft size={18} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNextMonth}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-full h-8 w-8"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
      
      {/* Conteúdo principal */}
      <Popover>
        <PopoverTrigger asChild>
          <div className="cursor-pointer py-6 px-4 flex flex-col items-center justify-center min-h-[100px]">
            {/* Decoração sazonal */}
            <div className="absolute top-2 right-2 text-xl opacity-50">{getMonthDecoration()}</div>
            
            {/* Mês em destaque */}
            <h2 className={`text-3xl font-bold mb-1 ${textColors[selectedMonth]}`}>
              {months[selectedMonth]}
            </h2>
            
            {/* Ano em tamanho menor */}
            <div className={`text-sm font-medium ${textColors[selectedMonth]} opacity-80`}>
              {selectedYear}
            </div>
            
            {/* Ícone de calendário */}
            <div className="mt-2 opacity-60">
              <CalendarIcon size={16} className={textColors[selectedMonth]} />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            initialFocus
            locale={ptBR}
            className={cn("p-3 pointer-events-auto")}
            weekStartsOn={getWeekStartDay()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
