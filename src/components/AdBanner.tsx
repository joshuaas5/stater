// AdBanner.tsx - Google AdSense Integration
// Monetização para usuários FREE

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

export function AdBanner({ 
  slot = '4402468222', 
  format = 'auto', 
  responsive = true,
  className = '' 
}: AdBannerProps) {
  const { user } = useAuth();
  const adRef = useRef<HTMLDivElement>(null);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Verificar se estamos em produção
    setIsProduction(window.location.hostname === 'www.stater.app' || window.location.hostname === 'stater.app');
  }, []);

  useEffect(() => {
    // Verificar se usuário é pagante
    const checkSubscription = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('id', user.id)
        .single();
      
      setIsPaidUser(data?.subscription_status === 'active');
    };

    checkSubscription();
  }, [user]);

  useEffect(() => {
    // Não mostrar ads para usuários pagos ou fora de produção
    if (isPaidUser || !isProduction) {
      return;
    }

    // Carregar AdSense apenas uma vez
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (err) {
      // Silencioso - AdSense pode não estar disponível
    }
  }, [isPaidUser, isProduction]);

  // Não renderizar para usuários pagos
  if (isPaidUser) {
    return null;
  }

  // Não renderizar fora de produção (evita iframe vazio em dev/localhost)
  if (!isProduction) {
    return null;
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: adLoaded ? 'auto' : '0px' }}
        data-ad-client="ca-pub-4642150915962893"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// Declaração TypeScript para window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

// =====================================
// COMO USAR:
// =====================================

// 1. O script do AdSense já está no index.html

// 2. Use o componente nas páginas:
/*
<AdBanner 
  slot="4402468222"  // Slot ID do AdSense
  format="rectangle" 
/>
*/