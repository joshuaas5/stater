
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-galileo-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-galileo-text">404</h1>
        <p className="text-xl text-galileo-secondaryText mb-4">Oops! Página não encontrada</p>
        <Button asChild>
          <a href="/" className="text-galileo-text bg-galileo-accent hover:bg-galileo-secondaryText">
            Voltar ao Início
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
