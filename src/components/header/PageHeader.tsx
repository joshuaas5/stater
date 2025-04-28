
import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  showThemeToggle?: boolean;
  onSearch?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title,
  showBack = false,
  showSearch = true,
  showThemeToggle = true,
  onSearch 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center bg-galileo-background p-4 pb-2 justify-between sticky top-0 z-10">
      <div className="flex items-center">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-galileo-text mr-3"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h2 className="text-galileo-text text-lg font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        {showThemeToggle && <ThemeToggle />}
        
        {showSearch && (
          <button
            onClick={onSearch}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-galileo-text"
          >
            <Search size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
