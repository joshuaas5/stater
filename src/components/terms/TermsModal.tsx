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
        className="w-full max-w-4xl h-[95vh] max-h-[95vh] p-0 m-2 flex flex-col bg-white"
        style={{ backgroundColor: '#ffffff', color: '#000000' }}
      >
        <DialogHeader className="p-4 pb-2 flex-shrink-0 bg-white border-b shadow-sm">
          <DialogTitle className="text-lg md:text-xl font-bold text-center text-black bg-white px-2 py-1 rounded-sm" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
            Termos de Uso e Política de Privacidade - Stater
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-4 md:px-6">
          <div className="space-y-4 text-sm">
            <div className="text-center text-gray-500 text-xs">
              ÚLTIMA ATUALIZAÇÃO: 27 de junho de 2025
            </div>

            <section>
              <h3 className="font-bold text-lg mb-2">1. SOBRE O APLICATIVO</h3>
              <p className="mb-2">1.1. O Stater é um aplicativo de assistente financeiro inteligente que utiliza Inteligência Artificial para ajudar usuários a gerenciar suas finanças pessoais.</p>
              <p>1.2. O aplicativo oferece funcionalidades como análise de extratos, chat com IA, controle de gastos, relatórios financeiros e integração com bot do Telegram.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. ACEITAÇÃO DOS TERMOS</h3>
              <p className="mb-2">2.1. Ao criar uma conta no Stater, você concorda integralmente com estes Termos de Uso e Política de Privacidade.</p>
              <p>2.2. O uso continuado do aplicativo implica na aceitação de eventuais atualizações destes termos.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-blue-600">3. FUNCIONALIDADES GRATUITAS E PAGAS</h3>
              <p className="mb-2">3.1. O Stater oferece funcionalidades básicas gratuitas e recursos premium pagos.</p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-2">
                <p className="font-semibold text-blue-800 mb-2">3.2. PAGAMENTOS VIA GOOGLE PLAY:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Todos os pagamentos de funcionalidades premium são processados exclusivamente através do Google Play Billing</li>
                  <li>A Google é responsável por toda a parte de cobrança, faturamento e processamento de pagamentos</li>
                  <li>Devoluções, estornos, contestações e questões de pagamento devem ser direcionadas diretamente à Google Play Store</li>
                  <li>O Stater não tem acesso direto aos dados de pagamento dos usuários</li>
                  <li>As políticas de reembolso seguem os termos e condições da Google Play Store</li>
                  <li>Para cancelar assinaturas, o usuário deve acessar sua conta Google Play</li>
                </ul>
              </div>
              
              <p>3.3. O Stater não armazena dados de cartão de crédito ou informações financeiras de pagamento.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-green-600">4. COLETA E TRATAMENTO DE DADOS (LGPD)</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">4.1. DADOS COLETADOS:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Informações de cadastro (nome, email)</li>
                  <li>Dados financeiros inseridos pelo usuário</li>
                  <li>Conversas com a IA</li>
                  <li>Dados de uso do aplicativo</li>
                  <li>Informações do Telegram (quando conectado)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. SEUS DIREITOS (LGPD)</h3>
              <p className="mb-2">Você tem direito a:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Confirmação da existência de tratamento</li>
                <li>Acesso aos dados</li>
                <li>Correção de dados incompletos/incorretos</li>
                <li>Anonimização, bloqueio ou eliminação</li>
                <li>Portabilidade dos dados</li>
                <li>Eliminação dos dados</li>
                <li>Revogação do consentimento</li>
              </ul>
            </section>

            <section className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2 text-yellow-800">📧 CONTATO E ENCARREGADO DE DADOS</h3>
              <p className="text-yellow-700">Para exercer seus direitos, dúvidas ou solicitações relacionadas aos dados:</p>
              <p className="font-bold text-yellow-800">Email: staterbills@gmail.com</p>
              <p className="text-sm text-yellow-600">Assunto: [LGPD] + sua solicitação</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. SEGURANÇA DOS DADOS</h3>
              <p>Implementamos medidas técnicas e organizacionais para proteger seus dados, utilizando criptografia e armazenamento seguro.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">7. LEI APLICÁVEL</h3>
              <p>Estes termos são regidos pela legislação brasileira (LGPD - Lei nº 13.709/2018).</p>
            </section>
          </div>
        </ScrollArea>

        <div className="p-4 pt-2 border-t space-y-4 flex-shrink-0 bg-white">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 bg-white p-2 rounded-md">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm font-medium leading-5 cursor-pointer text-black select-none">
                Li e aceito os Termos de Uso e Política de Privacidade do Stater
              </label>
            </div>

            <div className="flex items-start space-x-3 bg-white p-2 rounded-md">
              <Checkbox 
                id="data" 
                checked={dataProcessingAccepted}
                onCheckedChange={(checked) => setDataProcessingAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="data" className="text-sm font-medium leading-5 cursor-pointer text-black select-none">
                Autorizo o tratamento dos meus dados pessoais conforme descrito acima (LGPD)
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-md">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isAccepting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!allAccepted || isAccepting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium order-1 sm:order-2"
              style={{ backgroundColor: !allAccepted || isAccepting ? '#9CA3AF' : '#2563EB' }}
            >
              {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAccepting 
                ? 'Salvando...' 
                : allAccepted 
                  ? 'Aceitar e Continuar' 
                  : 'Aceite ambos os termos'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
