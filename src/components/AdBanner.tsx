// AdBanner.tsx - Google AdSense Integration
// Monetização para usuários FREE

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

export function AdBanner({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = '' 
}: AdBannerProps) {
  const { user } = useAuth();
  const adRef = useRef<HTMLDivElement>(null);
  const [isPaidUser, setIsPaidUser] = useState(false);

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
    // ✅ NÃO mostrar ads para usuários pagos
    if (isPaidUser) {
      return;
    }

    // ✅ Carregar AdSense apenas uma vez
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      // Silencioso - AdSense pode não estar disponível em dev
    }
  }, [isPaidUser]);

  // ✅ Não renderizar para usuários pagos
  if (isPaidUser) {
    return null;
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4642150915962893" // ✅ Publisher ID do AdSense
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
// 📍 COMO USAR:
// =====================================

// 1. Adicione o script do AdSense no index.html (dentro de <head>):
/*
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
     crossorigin="anonymous"></script>
*/

// 2. Use o componente nas páginas:
/*
<AdBanner 
  slot="1234567890"  // Slot ID do AdSense
  format="rectangle" 
/>
*/

// 3. Posições recomendadas:
//    - Sidebar do Dashboard (300x250)
//    - Entre listas de transações (responsivo)
//    - Footer das páginas (728x90)
//    - Entre seções de conteúdo (auto)
