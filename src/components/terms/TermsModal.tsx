import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [acceptComplete, setAcceptComplete] = useState(false);
  const { toast } = useToast();

  const allAccepted = termsAccepted && dataProcessingAccepted;
  
  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setAcceptComplete(false);
    }
  }, [isOpen]);

  const handleAccept = async () => {
    if (!allAccepted) return;
    
    try {
      setIsAccepting(true);
      console.log('✅ [TERMS MODAL] Aceitando termos...');
      
      // Notificar usuário imediatamente que está sendo processado
      toast({
        title: "Salvando seus termos",
        description: "Por favor, aguarde um momento..."
      });
      
      await onAccept();
      setAcceptComplete(true);
      
      toast({
        title: "Termos aceitos com sucesso",
        description: "Bem-vindo ao Stater! Você está sendo redirecionado..."
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

  return (
    <Dialog open={isOpen && !acceptComplete} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 flex flex-col fixed top-[5vh] left-[2.5vw]"
        style={{ 
          background: 'rgba(49, 81, 139, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          color: '#ffffff',
          fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif',
          zIndex: 9999
        }}
      >
        <DialogHeader 
          className="p-4 pb-2 flex-shrink-0 border-b border-white/20"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <DialogTitle 
            className="text-lg md:text-xl font-bold text-center text-white px-2 py-1 rounded-sm" 
            style={{ 
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              fontWeight: 600
            }}
          >
            Termos de Uso e Política de Privacidade - Stater
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-4 md:px-6">
          <div className="space-y-4 text-sm text-white">
            <div className="text-center text-white/60 text-xs">
              ÚLTIMA ATUALIZAÇÃO: 27 de junho de 2025
            </div>

            <section>
              <h3 className="font-bold text-lg mb-2 text-white" style={{ fontWeight: 600 }}>1. SOBRE O APLICATIVO</h3>
              <p className="mb-2 text-white/90">1.1. O Stater é um aplicativo de assistente financeiro inteligente que utiliza Inteligência Artificial para ajudar usuários a gerenciar suas finanças pessoais.</p>
              <p className="text-white/90">1.2. O aplicativo oferece funcionalidades como análise de extratos, chat com IA, controle de gastos, relatórios financeiros e integração com bot do Telegram.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-white" style={{ fontWeight: 600 }}>2. ACEITAÇÃO DOS TERMOS</h3>
              <p className="mb-2 text-white/90">2.1. Ao criar uma conta no Stater, você concorda integralmente com estes Termos de Uso e Política de Privacidade.</p>
              <p className="text-white/90">2.2. O uso continuado do aplicativo implica na aceitação de eventuais atualizações destes termos.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-white" style={{ fontWeight: 600 }}>3. FUNCIONALIDADES GRATUITAS E PAGAS</h3>
              <p className="mb-2 text-white/90">3.1. O Stater oferece funcionalidades básicas gratuitas e recursos premium pagos.</p>
              
              <div 
                className="p-4 rounded-lg mb-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <p className="font-semibold text-white mb-2" style={{ fontWeight: 600 }}>3.2. PAGAMENTOS VIA GOOGLE PLAY:</p>
                <ul className="list-disc list-inside space-y-1 text-white/90">
                  <li>Todos os pagamentos de funcionalidades premium são processados exclusivamente através do Google Play Billing</li>
                  <li>A Google é responsável por toda a parte de cobrança, faturamento e processamento de pagamentos</li>
                  <li>Devoluções, estornos, contestações e questões de pagamento devem ser direcionadas diretamente à Google Play Store</li>
                  <li>O Stater não tem acesso direto aos dados de pagamento dos usuários</li>
                  <li>As políticas de reembolso seguem os termos e condições da Google Play Store</li>
                  <li>Para cancelar assinaturas, o usuário deve acessar sua conta Google Play</li>
                </ul>
              </div>
              
              <p className="text-white/90">3.3. O Stater não armazena dados de cartão de crédito ou informações financeiras de pagamento.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-white" style={{ fontWeight: 600 }}>4. COLETA E TRATAMENTO DE DADOS (LGPD)</h3>
              <div 
                className="p-4 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <p className="font-semibold mb-2 text-white" style={{ fontWeight: 600 }}>4.1. DADOS COLETADOS:</p>
                <ul className="list-disc list-inside space-y-1 text-white/90">
                  <li>Informações de cadastro (nome, email)</li>
                  <li>Dados financeiros inseridos pelo usuário</li>
                  <li>Conversas com a IA</li>
                  <li>Dados de uso do aplicativo</li>
                  <li>Informações do Telegram (quando conectado)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-white" style={{ fontWeight: 600 }}>5. SEUS DIREITOS (LGPD)</h3>
              <p className="mb-2 text-white/90">Você tem direito a:</p>
              <ul className="list-disc list-inside space-y-1 text-white/90">
                <li>Confirmação da existência de tratamento</li>
                <li>Acesso aos dados</li>
                <li>Correção de dados incompletos/incorretos</li>
                <li>Anonimização, bloqueio ou eliminação</li>
                <li>Portabilidade dos dados</li>
                <li>Eliminação dos dados</li>
                <li>Revogação do consentimento</li>
              </ul>
            </section>

            <section 
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="font-bold text-lg mb-2 text-yellow-200" style={{ fontWeight: 600 }}>📧 CONTATO E ENCARREGADO DE DADOS</h3>
              <p className="text-yellow-100">Para exercer seus direitos, dúvidas ou solicitações relacionadas aos dados:</p>
              <p className="font-bold text-yellow-200" style={{ fontWeight: 600 }}>Email: staterbills@gmail.com</p>
              <p className="text-sm text-yellow-100/80">Assunto: [LGPD] + sua solicitação</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-white" style={{ fontWeight: 600 }}>6. SEGURANÇA DOS DADOS</h3>
              <p className="text-white/90">Implementamos medidas técnicas e organizacionais para proteger seus dados, utilizando criptografia e armazenamento seguro.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-white" style={{ fontWeight: 600 }}>7. LEI APLICÁVEL</h3>
              <p className="text-white/90">Estes termos são regidos pela legislação brasileira (LGPD - Lei nº 13.709/2018).</p>
            </section>
          </div>
        </ScrollArea>

        <div 
          className="p-4 pt-2 border-t border-white/20 space-y-4 flex-shrink-0"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="space-y-3">
            <div 
              className="flex items-start space-x-3 p-2 rounded-md"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: termsAccepted ? '#3b82f6' : 'transparent'
                }}
              />
              <label htmlFor="terms" className="text-sm font-medium leading-5 cursor-pointer text-white select-none">
                Li e aceito os Termos de Uso e Política de Privacidade do Stater
              </label>
            </div>

            <div 
              className="flex items-start space-x-3 p-2 rounded-md"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Checkbox 
                id="data" 
                checked={dataProcessingAccepted}
                onCheckedChange={(checked) => setDataProcessingAccepted(checked === true)}
                className="mt-0.5"
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: dataProcessingAccepted ? '#3b82f6' : 'transparent'
                }}
              />
              <label htmlFor="data" className="text-sm font-medium leading-5 cursor-pointer text-white select-none">
                Autorizo o tratamento dos meus dados pessoais conforme descrito acima (LGPD)
              </label>
            </div>
          </div>

          <div 
            className="flex flex-col gap-3 p-3 rounded-md"
            style={{
              background: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <Button 
              onClick={handleAccept}
              disabled={!allAccepted || isAccepting}
              className="w-full text-white font-medium order-1"
              style={{ 
                backgroundColor: !allAccepted || isAccepting ? 'rgba(255, 255, 255, 0.2)' : '#3b82f6',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                fontWeight: 600,
                padding: '12px 24px',
                fontSize: '16px',
                minHeight: '48px'
              }}
            >
              {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAccepting 
                ? 'Salvando...' 
                : allAccepted 
                  ? 'Aceitar e Continuar' 
                  : 'Aceite ambos os termos'
              }
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full text-white hover:bg-white/20 order-2"
              disabled={isAccepting}
              style={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontSize: '14px',
                minHeight: '40px'
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
