import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  className,
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 rounded-full",
        "bg-blue-600 hover:bg-blue-700",
        "text-white shadow-lg hover:shadow-xl",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-4 focus:ring-blue-300",
        "active:scale-95",
        "md:bottom-8 md:right-8 md:w-16 md:h-16",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      size="icon"
    >
      <Plus className="h-6 w-6 md:h-8 md:w-8" />
      <span className="sr-only">Adicionar transação</span>
    </Button>
  );
};

export default FloatingActionButton;
