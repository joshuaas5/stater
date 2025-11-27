import { useState } from 'react';
import { X, Crown, Check, Sparkles, Shield, CreditCard, Infinity, Camera, FileText, Bot, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { STRIPE_PRICE_PRO } from '@/lib/stripe';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 💎 Modal PRO Premium - Design Apple/Spotify
 */
export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user) {
      alert('Você precisa estar logado para assinar o PRO');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: STRIPE_PRICE_PRO,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=canceled`,
        },
      });

      if (error) {
        console.error('❌ Erro ao criar sessão:', error);
        alert('Erro ao processar pagamento. Tente novamente.');
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }

    } catch (err: any) {
      console.error('❌ Erro no checkout:', err);
      alert(`Erro ao processar pagamento: ${err.message || 'Tente novamente'}`);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Infinity size={18} />, text: '50 mensagens IA/dia', color: '#a78bfa' },
    { icon: <Camera size={18} />, text: 'Scanner de notas e recibos', color: '#f472b6' },
    { icon: <FileText size={18} />, text: 'Leitura de PDFs', color: '#60a5fa' },
    { icon: <Bot size={18} />, text: 'Bot Telegram integrado', color: '#34d399' },
    { icon: <TrendingUp size={18} />, text: 'Relatórios avançados', color: '#fbbf24' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: '32px',
            overflow: 'hidden',
            boxShadow: '0 0 100px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Gradient glow top */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              height: '200px',
              background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>

          {/* Header */}
          <div style={{ padding: '48px 24px 28px', textAlign: 'center', position: 'relative' }}>
            {/* PRO Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                marginBottom: '28px',
              }}
            >
              <Crown style={{ width: '18px', height: '18px', color: '#c4b5fd' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#e9d5ff', letterSpacing: '2px' }}>
                STATER PRO
              </span>
            </div>

            {/* Main Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(139, 92, 246, 0.5)',
              }}
            >
              <Sparkles style={{ width: '36px', height: '36px', color: '#fff' }} />
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '10px',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
              }}
            >
              Desbloqueie todo o<br />poder da IA
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
              Sua gestão financeira no próximo nível
            </p>
          </div>

          {/* Price Card */}
          <div style={{ padding: '0 24px 24px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.15) 100%)',
                borderRadius: '24px',
                padding: '28px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Best seller badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '0.5px',
                }}
              >
                ⭐ MAIS POPULAR
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
                <span style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>R$</span>
                <span style={{ fontSize: '64px', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>14</span>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>,90</span>
                <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.4)', marginLeft: '6px' }}>/mês</span>
              </div>

              <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '16px' }}>
                Cancele quando quiser • Sem surpresas
              </p>
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: '0 24px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 18px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: `${feature.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feature.color,
                      flexShrink: 0,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <span style={{ flex: 1, fontSize: '15px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.85)' }}>
                    {feature.text}
                  </span>
                  <Check style={{ width: '20px', height: '20px', color: '#10b981' }} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ padding: '0 24px 20px' }}>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                width: '100%',
                padding: '20px 24px',
                borderRadius: '18px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 15px 50px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: '22px', height: '22px', animation: 'spin 1s linear infinite' }} />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '22px', height: '22px' }} />
                  Assinar PRO agora
                </>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div
            style={{
              padding: '16px 24px 24px',
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>
              <Shield style={{ width: '16px', height: '16px' }} />
              <span>Pagamento seguro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>
              <CreditCard style={{ width: '16px', height: '16px' }} />
              <span>Via Stripe</span>
            </div>
          </div>

          {/* Skip button */}
          <div style={{ padding: '0 24px 36px', textAlign: 'center' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '15px',
                cursor: 'pointer',
                padding: '10px 20px',
                transition: 'color 0.2s',
              }}
            >
              Continuar com plano gratuito →
            </button>
          </div>
        </div>
      </div>

      {/* Keyframes for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

