import React, { useState } from 'react';
import { Menu, X, Home, CreditCard, BarChart3, Settings, Bot, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    label: 'Transações',
    path: '/transactions'
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'Relatórios',
    path: '/charts'
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    label: 'Análise Financeira',
    path: '/analise-financeira'
  },
  {
    icon: <Bot className="h-5 w-5" />,
    label: 'Assistente IA',
    path: '/financial-advisor'
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: 'Configurações',
    path: '/settings'
  }
];

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-gray-700 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Stater</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          "text-left font-medium",
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <span className={cn(
                          isActive ? "text-blue-600" : "text-gray-500"
                        )}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Stater v1.0.0
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;
