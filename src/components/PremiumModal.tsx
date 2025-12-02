import { useState, useEffect } from 'react';
import { X, Crown, Check, Sparkles, Shield, CreditCard, Infinity, Camera, FileText, Bot, TrendingUp, Loader2, AlertTriangle, Mail, XCircle, Mic, PieChart, Bell, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { STRIPE_PRICE_PRO } from '@/lib/stripe';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 💎 Modal PRO Premium - Design Responsivo (Desktop horizontal, Mobile vertical)
 */
export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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
    { icon: <Infinity size={20} />, text: '50 mensagens IA/dia', description: 'Consulte a IA ilimitadamente', color: '#a78bfa' },
    { icon: <Camera size={20} />, text: 'Scanner de notas', description: 'Extraia dados de recibos', color: '#f472b6' },
    { icon: <FileText size={20} />, text: 'Leitura de PDFs', description: 'Importe extratos bancários', color: '#60a5fa' },
    { icon: <Bot size={20} />, text: 'Bot Telegram', description: 'Registre gastos pelo chat', color: '#34d399' },
    { icon: <TrendingUp size={20} />, text: 'Relatórios avançados', description: 'Análises detalhadas', color: '#fbbf24' },
  ];

  // Layout Desktop - Horizontal sem scroll
  if (isDesktop) {
    return (
      <>
        {/* Overlay */}
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={onClose}
        />

        {/* Modal Desktop - Layout Horizontal */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 0 80px rgba(139, 92, 246, 0.25)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              display: 'flex',
              position: 'relative',
            }}
          >
            {/* Gradient glow */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-20%',
              width: '60%',
              height: '200%',
              background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />

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
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '18px', height: '18px', color: 'rgba(255, 255, 255, 0.6)' }} />
            </button>

            {/* Lado Esquerdo - Branding e Features */}
            <div style={{ 
              flex: '1', 
              padding: '40px', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {/* PRO Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                marginBottom: '20px',
                width: 'fit-content',
              }}>
                <Crown style={{ width: '16px', height: '16px', color: '#c4b5fd' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#e9d5ff', letterSpacing: '1.5px' }}>STATER PRO</span>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '12px',
                lineHeight: 1.2,
              }}>
                Desbloqueie o poder<br />completo da IA
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '28px' }}>
                Ferramentas avançadas para sua gestão financeira
              </p>

              {/* Features Grid - 2 colunas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `${feature.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feature.color,
                      flexShrink: 0,
                    }}>
                      {feature.icon}
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', display: 'block' }}>
                        {feature.text}
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                        {feature.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lado Direito - Preço e CTA */}
            <div style={{
              width: '320px',
              padding: '40px 32px',
              background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              {/* Sparkle icon */}
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 24px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 16px 48px rgba(139, 92, 246, 0.4)',
              }}>
                <Sparkles style={{ width: '28px', height: '28px', color: '#fff' }} />
              </div>

              {/* Best seller badge */}
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.5px',
                textAlign: 'center',
                marginBottom: '20px',
                width: 'fit-content',
                margin: '0 auto 20px',
              }}>
                ⭐ MAIS POPULAR
              </div>

              {/* Price */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>R$</span>
                  <span style={{ fontSize: '52px', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>14</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>,90</span>
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)' }}>/mês</span>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
                  marginBottom: '16px',
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
                    Assinar PRO
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px' }}>
                  <Shield style={{ width: '14px', height: '14px' }} />
                  <span>Seguro</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px' }}>
                  <CreditCard style={{ width: '14px', height: '14px' }} />
                  <span>Stripe</span>
                </div>
              </div>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255, 255, 255, 0.35)', marginBottom: '12px' }}>
                Cancele quando quiser
              </p>

              {/* Skip button */}
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.35)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                Continuar grátis →
              </button>
            </div>
          </div>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  // Layout Mobile - Vertical (original)
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

      {/* Modal Mobile */}
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
            maxWidth: '400px',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 0 80px rgba(139, 92, 246, 0.3)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            position: 'relative',
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
        >
          {/* Gradient glow top */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '160px',
            background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 10,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '18px', height: '18px', color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>

          {/* Header */}
          <div style={{ padding: '40px 24px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              marginBottom: '20px',
            }}>
              <Crown style={{ width: '16px', height: '16px', color: '#c4b5fd' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e9d5ff', letterSpacing: '1.5px' }}>STATER PRO</span>
            </div>

            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 20px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 16px 48px rgba(139, 92, 246, 0.5)',
            }}>
              <Sparkles style={{ width: '28px', height: '28px', color: '#fff' }} />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', lineHeight: 1.2 }}>
              Desbloqueie todo o<br />poder da IA
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
              Gestão financeira no próximo nível
            </p>
          </div>

          {/* Price */}
          <div style={{ padding: '0 24px 20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              position: 'relative',
              textAlign: 'center',
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#fff',
              }}>
                ⭐ POPULAR
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px', marginTop: '8px' }}>
                <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)' }}>R$</span>
                <span style={{ fontSize: '48px', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>14</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>,90</span>
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', marginLeft: '4px' }}>/mês</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '12px' }}>
                Cancele quando quiser
              </p>
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${feature.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: feature.color,
                    flexShrink: 0,
                  }}>
                    {feature.icon}
                  </div>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.85)' }}>
                    {feature.text}
                  </span>
                  <Check style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: '0 24px 16px' }}>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
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
                boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
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

          {/* Trust + Skip */}
          <div style={{ padding: '0 24px 28px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
                <Shield style={{ width: '14px', height: '14px' }} />
                <span>Pagamento seguro</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
                <CreditCard style={{ width: '14px', height: '14px' }} />
                <span>Via Stripe</span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 16px',
              }}
            >
              Continuar com plano gratuito →
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/**
 * 🎉 Modal de Status PRO - Para assinantes
 * Inclui opção de cancelar assinatura e suporte
 */
interface ProStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProStatusModal({ isOpen, onClose }: ProStatusModalProps) {
  const { user } = useAuth();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCancelSubscription = async () => {
    if (!user?.email) {
      setCancelError('Erro: usuário não encontrado');
      return;
    }

    setCancelling(true);
    setCancelError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setCancelSuccess(true);
        setShowCancelConfirm(false);
      } else {
        setCancelError(data.message || 'Erro ao cancelar assinatura');
      }
    } catch (error: any) {
      console.error('Erro ao cancelar:', error);
      setCancelError('Erro de conexão. Tente novamente.');
    } finally {
      setCancelling(false);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Suporte Stater PRO - Reembolso');
    const body = encodeURIComponent(`Olá equipe Stater,

Sou assinante PRO e gostaria de solicitar:

[ ] Reembolso (estou dentro dos 7 dias)
[ ] Ajuda com problema técnico
[ ] Outra questão

Email da conta: ${user?.email || ''}

Descreva seu problema:


Obrigado!`);
    
    window.open(`mailto:support@stater.app?subject=${subject}&body=${body}`, '_blank');
  };

  const features = [
    { icon: <Infinity size={20} />, text: '50 mensagens IA por dia', color: '#a78bfa', active: true },
    { icon: <Camera size={20} />, text: 'Scanner de notas e recibos', color: '#f472b6', active: true },
    { icon: <FileText size={20} />, text: 'Leitura de PDFs', color: '#60a5fa', active: true },
    { icon: <Bot size={20} />, text: 'Bot Telegram integrado', color: '#34d399', active: true },
    { icon: <TrendingUp size={20} />, text: 'Relatórios avançados', color: '#fbbf24', active: true },
    { icon: <Shield size={20} />, text: 'Suporte prioritário', color: '#f87171', active: true },
  ];

  // Modal de Confirmação de Cancelamento
  if (showCancelConfirm) {
    return (
      <>
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
          onClick={() => setShowCancelConfirm(false)}
        />
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
              maxWidth: '380px',
              background: 'linear-gradient(180deg, #1f1a2e 0%, #15101f 100%)',
              borderRadius: '24px',
              padding: '32px 24px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                Cancelar assinatura?
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>
                Você continuará tendo acesso PRO até o fim do período atual. Após isso, voltará ao plano gratuito.
              </p>
            </div>

            {cancelError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#fca5a5',
                fontSize: '14px',
                textAlign: 'center',
              }}>
                {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {cancelling ? (
                  <>
                    <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle style={{ width: '18px', height: '18px' }} />
                    Sim, cancelar assinatura
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Não, quero continuar PRO
              </button>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  // Modal de Sucesso após Cancelamento
  if (cancelSuccess) {
    return (
      <>
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
          onClick={onClose}
        />
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
              maxWidth: '380px',
              background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
              borderRadius: '24px',
              padding: '32px 24px',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: 'rgba(251, 191, 36, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check style={{ width: '32px', height: '32px', color: '#fbbf24' }} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              Assinatura cancelada
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6, marginBottom: '24px' }}>
              Você ainda tem acesso PRO até o fim do período pago. Sentiremos sua falta! 💜
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      </>
    );
  }

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
            boxShadow: '0 0 100px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Gradient glow top - Verde para PRO */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              height: '200px',
              background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Confetti effect */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', overflow: 'hidden', pointerEvents: 'none' }}>
            {['🎉', '✨', '🌟', '💎', '🎊'].map((emoji, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  fontSize: '24px',
                  top: `${20 + i * 15}px`,
                  left: `${10 + i * 20}%`,
                  opacity: 0.6,
                  animation: `float${i % 3} 3s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

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
            }}
          >
            <X style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>

          {/* Header */}
          <div style={{ padding: '48px 24px 28px', textAlign: 'center', position: 'relative' }}>
            {/* PRO Badge Active */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(52, 211, 153, 0.3) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                marginBottom: '28px',
              }}
            >
              <Crown style={{ width: '18px', height: '18px', color: '#34d399' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#6ee7b7', letterSpacing: '2px' }}>
                ASSINANTE PRO
              </span>
            </div>

            {/* Check Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(16, 185, 129, 0.5)',
              }}
            >
              <Check style={{ width: '40px', height: '40px', color: '#fff', strokeWidth: 3 }} />
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '12px',
                letterSpacing: '-0.5px',
                lineHeight: 1.3,
              }}
            >
              Parabéns! 🎉
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, lineHeight: 1.5 }}>
              Você faz parte do seleto grupo que investe<br />na própria organização financeira!
            </p>
          </div>

          {/* Active Features */}
          <div style={{ padding: '0 24px 28px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Seus benefícios ativos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '14px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: `${feature.color}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feature.color,
                      flexShrink: 0,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>
                    {feature.text}
                  </span>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check style={{ width: '14px', height: '14px', color: '#fff' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Message */}
          <div style={{ padding: '0 24px 16px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.8)', margin: 0, lineHeight: 1.6 }}>
                💡 <strong>Dica:</strong> Use o assistente de IA para analisar seus gastos e encontrar oportunidades de economia!
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div style={{ padding: '0 24px 16px' }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '18px 24px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                color: '#fff',
                fontSize: '17px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Sparkles style={{ width: '20px', height: '20px' }} />
              Continuar usando
            </button>
          </div>

          {/* Management Options */}
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <p style={{ 
                fontSize: '12px', 
                color: 'rgba(255, 255, 255, 0.4)', 
                textAlign: 'center',
                marginBottom: '4px',
              }}>
                Gerenciar assinatura
              </p>
              
              {/* Botão de Suporte/Reembolso */}
              <button
                onClick={handleContactSupport}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <Mail style={{ width: '16px', height: '16px' }} />
                Suporte / Solicitar reembolso
              </button>

              {/* Botão de Cancelar */}
              <button
                onClick={() => setShowCancelConfirm(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'rgba(239, 68, 68, 0.8)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <XCircle style={{ width: '16px', height: '16px' }} />
                Cancelar assinatura
              </button>
              
              <p style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.35)', 
                textAlign: 'center',
                marginTop: '4px',
                lineHeight: 1.4,
              }}>
                Reembolso disponível em até 7 dias após a compra.
                <br />
                Entre em contato pelo suporte.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float0 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
      `}</style>
    </>
  );
}