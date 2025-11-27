import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const { toast } = useToast();

  const allAccepted = termsAccepted && dataProcessingAccepted;

  // Reset quando modal abre
  useEffect(() => {
    if (isOpen) {
      setTermsAccepted(false);
      setDataProcessingAccepted(false);
      setIsAccepting(false);
    }
  }, [isOpen]);

  // Bloquear scroll do body quando modal aberto
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

  const handleAccept = async () => {
    if (!allAccepted || isAccepting) return;
    
    try {
      setIsAccepting(true);
      console.log('✅ [TERMS MODAL] Aceitando termos...');
      
      toast({
        title: "Salvando seus termos",
        description: "Por favor, aguarde um momento..."
      });
      
      await onAccept();
      
      toast({
        title: "Termos aceitos com sucesso",
        description: "Bem-vindo ao Stater!"
      });
    } catch (error) {
      console.error('❌ [TERMS MODAL] Erro ao aceitar termos:', error);
      toast({
        title: "Erro ao aceitar termos",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      setIsAccepting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        background: '#1e3a6e',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div 
        style={{
          padding: '16px',
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          background: '#2a4a7a',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          flexShrink: 0,
        }}
      >
        <h1 style={{ 
          fontSize: '18px', 
          fontWeight: 600, 
          textAlign: 'center',
          margin: 0,
          color: '#ffffff'
        }}>
          Termos de Uso e Política de Privacidade
        </h1>
      </div>

      {/* Conteúdo scrollável */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '16px' }}>
          ÚLTIMA ATUALIZAÇÃO: 27 de junho de 2025
        </p>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>1. SOBRE O APLICATIVO</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, marginBottom: '8px' }}>
            1.1. O Stater é um aplicativo de assistente financeiro inteligente que utiliza Inteligência Artificial para ajudar usuários a gerenciar suas finanças pessoais.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
            1.2. O aplicativo oferece funcionalidades como análise de extratos, chat com IA, controle de gastos, relatórios financeiros e integração com bot do Telegram.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>2. ACEITAÇÃO DOS TERMOS</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, marginBottom: '8px' }}>
            2.1. Ao criar uma conta no Stater, você concorda integralmente com estes Termos de Uso e Política de Privacidade.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
            2.2. O uso continuado do aplicativo implica na aceitação de eventuais atualizações destes termos.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>3. FUNCIONALIDADES GRATUITAS E PAGAS</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, marginBottom: '8px' }}>
            3.1. O Stater oferece funcionalidades básicas gratuitas e recursos premium pagos.
          </p>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '8px', 
            padding: '12px',
            marginBottom: '8px'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>3.2. PAGAMENTOS:</p>
            <ul style={{ paddingLeft: '20px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
              <li>Pagamentos processados via Stripe ou Google Play</li>
              <li>O Stater não armazena dados de cartão de crédito</li>
              <li>Para cancelar assinaturas, acesse sua conta</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>4. COLETA DE DADOS (LGPD)</h3>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '8px', 
            padding: '12px' 
          }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Dados coletados:</p>
            <ul style={{ paddingLeft: '20px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
              <li>Informações de cadastro (nome, email)</li>
              <li>Dados financeiros inseridos pelo usuário</li>
              <li>Conversas com a IA</li>
              <li>Dados de uso do aplicativo</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>5. SEUS DIREITOS</h3>
          <ul style={{ paddingLeft: '20px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            <li>Acesso aos dados</li>
            <li>Correção de dados incorretos</li>
            <li>Eliminação dos dados</li>
            <li>Portabilidade dos dados</li>
            <li>Revogação do consentimento</li>
          </ul>
        </div>

        <div style={{ 
          background: 'rgba(245, 158, 11, 0.2)', 
          border: '1px solid rgba(245, 158, 11, 0.4)', 
          borderRadius: '8px', 
          padding: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#fef08a' }}>📧 CONTATO</h3>
          <p style={{ color: '#fef9c3' }}>Email: staterbills@gmail.com</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>6. LEI APLICÁVEL</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
            Estes termos são regidos pela legislação brasileira (LGPD - Lei nº 13.709/2018).
          </p>
        </div>
      </div>

      {/* Footer com checkboxes e botões */}
      <div 
        style={{
          padding: '16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          background: '#2a4a7a',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          flexShrink: 0,
        }}
      >
        {/* Checkbox 1 */}
        <button
          type="button"
          onClick={() => setTermsAccepted(!termsAccepted)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            width: '100%',
            padding: '14px',
            marginBottom: '12px',
            background: termsAccepted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
            border: termsAccepted ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            color: '#ffffff',
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            border: termsAccepted ? '2px solid #22c55e' : '2px solid #ffffff',
            background: termsAccepted ? '#22c55e' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {termsAccepted && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize: '14px', lineHeight: 1.4 }}>
            Li e aceito os Termos de Uso e Política de Privacidade do Stater
          </span>
        </button>

        {/* Checkbox 2 */}
        <button
          type="button"
          onClick={() => setDataProcessingAccepted(!dataProcessingAccepted)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            width: '100%',
            padding: '14px',
            marginBottom: '16px',
            background: dataProcessingAccepted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
            border: dataProcessingAccepted ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            color: '#ffffff',
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            border: dataProcessingAccepted ? '2px solid #22c55e' : '2px solid #ffffff',
            background: dataProcessingAccepted ? '#22c55e' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {dataProcessingAccepted && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize: '14px', lineHeight: 1.4 }}>
            Autorizo o tratamento dos meus dados pessoais conforme descrito acima (LGPD)
          </span>
        </button>

        {/* Botão Aceitar */}
        <button
          type="button"
          onClick={handleAccept}
          disabled={!allAccepted || isAccepting}
          style={{
            width: '100%',
            padding: '16px',
            marginBottom: '10px',
            background: allAccepted && !isAccepting ? '#22c55e' : 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: allAccepted && !isAccepting ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isAccepting && <Loader2 className="h-5 w-5 animate-spin" />}
          {isAccepting ? 'Salvando...' : allAccepted ? '✓ Aceitar e Continuar' : 'Aceite ambos os termos'}
        </button>

        {/* Botão Cancelar */}
        <button
          type="button"
          onClick={onClose}
          disabled={isAccepting}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isAccepting ? 'not-allowed' : 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
