
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
  
  return (
    <div className="flex items-center gap-1.5">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handlePrevMonth}
        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10"
      >
        <ChevronLeft size={16} />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center cursor-pointer">
            <div className={`flex items-center rounded-md border ${borderColors[selectedMonth]} bg-card shadow-sm px-3 py-1.5 hover:bg-accent/5 transition-colors`}>
              <CalendarIcon size={14} className="mr-2 text-muted-foreground" />
              <span className={`font-medium ${textColors[selectedMonth]}`}>{months[selectedMonth]}</span>
              <span className="text-xs text-muted-foreground ml-1.5">{selectedYear}</span>
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
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleNextMonth}
        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};
