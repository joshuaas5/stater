
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
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
    'bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-yellow-100',
    'bg-pink-100', 'bg-red-100', 'bg-indigo-100', 'bg-orange-100',
    'bg-teal-100', 'bg-cyan-100', 'bg-amber-100', 'bg-lime-100'
  ];
  
  const borderColors = [
    'border-blue-300', 'border-purple-300', 'border-green-300', 'border-yellow-300',
    'border-pink-300', 'border-red-300', 'border-indigo-300', 'border-orange-300',
    'border-teal-300', 'border-cyan-300', 'border-amber-300', 'border-lime-300'
  ];
  
  return (
    <div className={`flex items-center justify-between py-2 px-4 bg-galileo-card rounded-lg border-2 ${borderColors[selectedMonth]}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handlePrevMonth}
        className="text-galileo-text hover:bg-galileo-accent/20"
      >
        <ChevronLeft size={20} />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${monthColors[selectedMonth]} text-galileo-text font-medium hover:bg-galileo-accent/20`}
          >
            <CalendarIcon size={16} />
            {months[selectedMonth]} {selectedYear}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            initialFocus
            locale={ptBR}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleNextMonth}
        className="text-galileo-text hover:bg-galileo-accent/20"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};
