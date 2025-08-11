import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';

const PersistentLayout: React.FC = () => {
  const location = useLocation();
  const noNavBarRoutes = ['/financial-advisor'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* O Outlet renderizará a página da rota atual (Dashboard, FinancialAdvisorPage, etc.) */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      
      {/* A NavBar agora é persistente e fica fora das páginas */}
      {!noNavBarRoutes.includes(location.pathname) && <NavBar />}
    </div>
  );
};

export default PersistentLayout;
