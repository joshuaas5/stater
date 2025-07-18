import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { preloadCriticalRoutes, preloadRoute } from '@/router/routes';

export const useRoutePreloading = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Preload critical routes when user is authenticated
    if (user) {
      preloadCriticalRoutes();
    }
  }, [user]);
  
  // Preload route on hover - for better UX
  const preloadOnHover = (routePath: string) => {
    return {
      onMouseEnter: () => preloadRoute(routePath),
      onFocus: () => preloadRoute(routePath)
    };
  };
  
  return {
    preloadOnHover,
    preloadRoute
  };
};
