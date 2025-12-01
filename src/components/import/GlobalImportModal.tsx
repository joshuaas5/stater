import React, { useEffect, useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { readOFXFile, OFXParseResult } from '@/utils/ofxParser';
import { MultiTransactionModal } from '@/components/modals/MultiTransactionModal';
import { useToast } from '@/hooks/use-toast';
import { saveTransaction, uuidv4 } from '@/utils/localStorage';
import { Transaction } from '@/types';

interface GlobalImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalImportModal: React.FC<GlobalImportModalProps> = ({ isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<OFXParseResult | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const { toast } = useToast();

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
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
      const result = await readOFXFile(file);
      
      if (result.success && result.transactions.length > 0) {
        setParseResult(result);
        setShowTransactionModal(true);
        
        toast({
          title: '✅ Arquivo processado!',
          description: `${result.transactions.length} transações encontradas.`,
        });
      } else {
        toast({
          title: '❌ Erro ao processar',
          description: result.error || 'Nenhuma transação encontrada',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast({
        title: '❌ Erro ao importar',
        description: 'Ocorreu um erro ao processar o arquivo',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTransactions = async (transactions: any[]) => {
    try {
      let savedCount = 0;
      
      for (const tx of transactions) {
        // Criar transação parcial - saveTransaction adiciona userId internamente
        const transaction = {
          id: uuidv4(),
          title: tx.description,
          amount: tx.amount,
          type: tx.type as 'income' | 'expense',
          category: tx.category,
          date: new Date(tx.date),
        } as Partial<Transaction>;
        
        saveTransaction(transaction as Transaction);
        savedCount++;
      }
      
      toast({
        title: '🎉 Importação concluída!',
        description: `${savedCount} transações adicionadas com sucesso.`,
      });
      
      // Disparar evento para atualizar dashboard
      window.dispatchEvent(new CustomEvent('transactionsUpdated'));
      
      setShowTransactionModal(false);
      setParseResult(null);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as transações',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div 
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #be185d)',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                }}
              >
                <Upload size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Importar Extrato</h2>
                <p className="text-xs text-white/50">Suporta arquivos .OFX e .QFX</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X size={18} className="text-white/60" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Drop Zone */}
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer
                border-2 border-dashed transition-all duration-200
                ${isDragging 
                  ? 'border-pink-500 bg-pink-500/10' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }
              `}
            >
              <input
                type="file"
                accept=".ofx,.qfx"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              
              {isProcessing ? (
                <>
                  <div className="w-12 h-12 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-4" />
                  <p className="text-white/80 font-medium">Processando arquivo...</p>
                </>
              ) : (
                <>
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(190, 24, 93, 0.1))',
                      border: '1px solid rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    <FileText size={32} className="text-pink-400" />
                  </div>
                  <p className="text-white font-medium mb-1">
                    Arraste seu arquivo aqui
                  </p>
                  <p className="text-white/50 text-sm">
                    ou clique para selecionar
                  </p>
                </>
              )}
            </label>
            
            {/* Info */}
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <h4 className="text-sm font-medium text-white/80 mb-2">💡 Como obter seu extrato OFX:</h4>
              <ol className="text-xs text-white/50 space-y-1 list-decimal list-inside">
                <li>Acesse o internet banking do seu banco</li>
                <li>Vá em Extratos ou Movimentações</li>
                <li>Procure a opção "Exportar" ou "Download"</li>
                <li>Selecione o formato OFX/QFX</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Review Modal */}
      {showTransactionModal && parseResult && (
        <MultiTransactionModal
          isOpen={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false);
            setParseResult(null);
          }}
          transactions={parseResult.transactions}
          onSaveAll={handleSaveTransactions}
          documentInfo={{
            documentType: 'OFX',
            establishment: parseResult.bankInfo?.bankId || 'Extrato Bancário'
          }}
        />
      )}
    </>
  );
};

export default GlobalImportModal;
