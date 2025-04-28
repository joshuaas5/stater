
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

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
  
  const handlePrevMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
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
    onMonthChange(newMonth, newYear);
  };
  
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-galileo-card rounded-lg">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handlePrevMonth}
        className="text-galileo-text"
      >
        <ChevronLeft size={20} />
      </Button>
      
      <div className="text-galileo-text font-medium">
        {months[selectedMonth]} {selectedYear}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleNextMonth}
        className="text-galileo-text"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};
