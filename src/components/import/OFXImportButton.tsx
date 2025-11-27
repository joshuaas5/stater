import React, { useRef, useState } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { readOFXFile, OFXParseResult } from '@/utils/ofxParser';
import { MultiTransactionModal } from '@/components/modals/MultiTransactionModal';
import { useToast } from '@/hooks/use-toast';
import { saveTransaction, uuidv4 } from '@/utils/localStorage';

interface OFXImportButtonProps {
  onImportComplete?: (count: number) => void;
  className?: string;
}

export const OFXImportButton: React.FC<OFXImportButtonProps> = ({ 
  onImportComplete,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [parseResult, setParseResult] = useState<OFXParseResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar extensão
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.ofx') && !fileName.endsWith('.qfx')) {
      toast({
        title: '❌ Arquivo inválido',
        description: 'Por favor, selecione um arquivo .OFX ou .QFX',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log(`📂 [OFX_IMPORT] Processando arquivo: ${file.name}`);
      
      const result = await readOFXFile(file);
      
      if (result.success && result.transactions.length > 0) {
        setParseResult(result);
        setShowModal(true);
        
        toast({
          title: '✅ Arquivo processado!',
          description: `${result.transactions.length} transações encontradas. Revise e confirme.`,
        });
      } else {
        toast({
          title: '❌ Erro ao processar',
          description: result.error || 'Nenhuma transação encontrada no arquivo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ [OFX_IMPORT] Erro:', error);
      toast({
        title: '❌ Erro ao importar',
        description: 'Ocorreu um erro ao processar o arquivo OFX',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveTransactions = async (transactions: any[]) => {
    try {
      console.log(`💾 [OFX_IMPORT] Salvando ${transactions.length} transações...`);
      
      let savedCount = 0;
      
      for (const tx of transactions) {
        const transaction = {
          id: uuidv4(),
          title: tx.description,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          date: tx.date,
          importedFrom: 'ofx',
          importedAt: new Date().toISOString(),
        };
        
        await saveTransaction(transaction);
        savedCount++;
      }
      
      toast({
        title: '🎉 Importação concluída!',
        description: `${savedCount} transações foram adicionadas com sucesso.`,
      });
      
      onImportComplete?.(savedCount);
      setShowModal(false);
      setParseResult(null);
      
    } catch (error) {
      console.error('❌ [OFX_IMPORT] Erro ao salvar:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as transações',
        variant: 'destructive',
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setParseResult(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ofx,.qfx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Botão de importação */}
      <button
        onClick={triggerFileInput}
        disabled={isProcessing}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processando...</span>
          </>
        ) : (
          <>
            <Upload size={18} />
            <span>Importar OFX</span>
          </>
        )}
      </button>

      {/* Modal de transações */}
      {parseResult && (
        <MultiTransactionModal
          isOpen={showModal}
          onClose={handleCloseModal}
          transactions={parseResult.transactions.map(tx => ({
            id: tx.id,
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            date: tx.date,
          }))}
          onSaveAll={handleSaveTransactions}
          documentInfo={{
            documentType: 'Extrato OFX',
            establishment: parseResult.bankInfo?.accountId 
              ? `Conta: ${parseResult.bankInfo.accountId}` 
              : 'Extrato Bancário',
          }}
        />
      )}
    </>
  );
};

export default OFXImportButton;
