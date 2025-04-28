
import React from 'react';
import { Search } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showSearch?: boolean;
  onSearch?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showSearch = true, 
  onSearch 
}) => {
  return (
    <div className="flex items-center bg-galileo-background p-4 pb-2 justify-between sticky top-0 z-10">
      <h2 className="text-galileo-text text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
        {title}
      </h2>
      
      {showSearch && (
        <div className="flex w-12 items-center justify-end">
          <button
            onClick={onSearch}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent text-galileo-text gap-2 text-base min-w-0 p-0"
          >
            <div className="text-galileo-text">
              <Search size={24} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
