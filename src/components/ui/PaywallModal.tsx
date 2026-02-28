import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { STRIPE_PRICE_PRO } from '@/lib/stripe';
import { 
  X, 
  Crown, 
  Sparkles, 
  Camera, 
  FileText, 
  Shield,
  Check,
  Loader2,
  Infinity,
  Bot,
  TrendingUp,
  CreditCard
} from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planType: any) => void;
  trigger: 'messages' | 'bills' | 'transactions' | 'reports' | 'manual' | 'ocr' | 'pdf' | 'audio';
  userId: string;
}

export function PaywallModal({ isOpen, onClose, trigger, userId }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Erro ao carregar email:', error);
      }
    };

    if (isOpen) {
      loadUserEmail();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubscribe = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: STRIPE_PRICE_PRO,
          userId: userId,
          userEmail: userEmail,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=canceled`
        }
      });

      if (error) {
        console.error('❌ Erro ao criar checkout:', error);
        alert('Erro ao processar pagamento. Tente novamente.');
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
      
    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      alert('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const triggerIcons: Record<string, { icon: 'messages' | 'camera' | 'file' | 'mic' | 'chart' | 'sparkles' | 'receipt' | 'card'; title: string; desc: string }> = {
    messages: { icon: 'messages', title: 'Suas mensagens acabaram', desc: 'Você usou suas 5 mensagens diárias' },
    ocr: { icon: 'camera', title: 'Recurso PRO', desc: 'Análise de fotos com IA' },
    pdf: { icon: 'file', title: 'Recurso PRO', desc: 'Leitura de PDFs e extratos' },
    audio: { icon: 'mic', title: 'Recurso PRO', desc: 'Comandos por voz' },
    reports: { icon: 'chart', title: 'Recurso PRO', desc: 'Exportação de relatórios' },
    manual: { icon: 'sparkles', title: 'Seja PRO', desc: 'Desbloqueie todo o potencial' },
    bills: { icon: 'receipt', title: 'Recurso PRO', desc: 'Gestão avançada de contas' },
    transactions: { icon: 'card', title: 'Recurso PRO', desc: 'Transações ilimitadas' },
  };

  const iconMap = {
    messages: <Bot size={48} style={{ color: '#a78bfa' }} />,
    camera: <Camera size={48} style={{ color: '#f472b6' }} />,
    file: <FileText size={48} style={{ color: '#60a5fa' }} />,
    mic: <Sparkles size={48} style={{ color: '#34d399' }} />,
    chart: <TrendingUp size={48} style={{ color: '#fbbf24' }} />,
    sparkles: <Sparkles size={48} style={{ color: '#a78bfa' }} />,
    receipt: <FileText size={48} style={{ color: '#f472b6' }} />,
    card: <CreditCard size={48} style={{ color: '#60a5fa' }} />,
  };

  const info = triggerIcons[trigger] || triggerIcons.manual;

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
          padding: 'calc(20px + env(safe-area-inset-top, 0px)) 16px calc(20px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            maxHeight: 'calc(100vh - 40px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: '24px',
            overflow: 'hidden',
            overflowY: 'auto',
            boxShadow: '0 0 100px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            position: 'relative',
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
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <X style={{ width: '18px', height: '18px', color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>

          {/* Header */}
          <div style={{ padding: '40px 24px 24px', textAlign: 'center', position: 'relative' }}>
            {/* PRO Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                marginBottom: '24px',
              }}
            >
              <Crown style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4b5fd', letterSpacing: '1px' }}>
                STATER PRO
              </span>
            </div>

            {/* Icon */}
            <div
              style={{
                marginBottom: '20px',
                filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))',
              }}
            >
              {iconMap[info.icon]}
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '8px',
                letterSpacing: '-0.5px',
              }}
            >
              {info.title}
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
              {info.desc}
            </p>
          </div>

          {/* Price Card */}
          <div style={{ padding: '0 24px 20px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Discount badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                POPULAR
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>R$</span>
                <span style={{ fontSize: '56px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>14</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>,90</span>
                <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.4)', marginLeft: '4px' }}>/mês</span>
              </div>

              <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '12px' }}>
                Cancele quando quiser • Sem surpresas
              </p>
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: <Infinity size={18} />, text: '50 mensagens IA/dia', color: '#a78bfa' },
                { icon: <Camera size={18} />, text: 'Scanner de notas e recibos', color: '#f472b6' },
                { icon: <FileText size={18} />, text: 'Leitura de PDFs', color: '#60a5fa' },
                { icon: <Bot size={18} />, text: 'Bot Telegram integrado', color: '#34d399' },
                { icon: <TrendingUp size={18} />, text: 'Relatórios avançados', color: '#fbbf24' },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `${feature.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)' }}>
                    {feature.text}
                  </span>
                  <Check style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ padding: '0 24px 16px' }}>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px 24px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                color: '#fff',
                fontSize: '17px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.2s',
                transform: 'scale(1)',
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.4)';
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '20px', height: '20px' }} />
                  Assinar PRO agora
                </>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div
            style={{
              padding: '12px 24px 20px',
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.35)', fontSize: '12px' }}>
              <Shield style={{ width: '14px', height: '14px' }} />
              <span>Pagamento seguro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.35)', fontSize: '12px' }}>
              <CreditCard style={{ width: '14px', height: '14px' }} />
              <span>Stripe</span>
            </div>
          </div>

          {/* Skip button */}
          <div style={{ padding: '0 24px 32px', textAlign: 'center' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 16px',
                transition: 'color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)'}
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

// Hook para usar o PaywallModal
export function usePaywallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<'messages' | 'bills' | 'transactions' | 'reports' | 'manual' | 'ocr' | 'pdf' | 'audio'>('manual');

  const openPaywall = (triggerType: 'messages' | 'bills' | 'transactions' | 'reports' | 'manual' | 'ocr' | 'pdf' | 'audio') => {
    setTrigger(triggerType);
    setIsOpen(true);
  };

  const closePaywall = () => {
    setIsOpen(false);
  };

  return {
    isPaywallOpen: isOpen,
    openPaywall,
    closePaywall,
    trigger
  };
}
