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

/**
 * 🎉 Modal de Status PRO - Para assinantes
 */
interface ProStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProStatusModal({ isOpen, onClose }: ProStatusModalProps) {
  if (!isOpen) return null;

  const features = [
    { icon: <Infinity size={20} />, text: '50 mensagens IA por dia', color: '#a78bfa', active: true },
    { icon: <Camera size={20} />, text: 'Scanner de notas e recibos', color: '#f472b6', active: true },
    { icon: <FileText size={20} />, text: 'Leitura de PDFs', color: '#60a5fa', active: true },
    { icon: <Bot size={20} />, text: 'Bot Telegram integrado', color: '#34d399', active: true },
    { icon: <TrendingUp size={20} />, text: 'Relatórios avançados', color: '#fbbf24', active: true },
    { icon: <Shield size={20} />, text: 'Suporte prioritário', color: '#f87171', active: true },
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
          <div style={{ padding: '0 24px 24px' }}>
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
          <div style={{ padding: '0 24px 36px' }}>
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