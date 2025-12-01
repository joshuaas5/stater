import React, { useEffect, useState } from 'react';
import { X, Upload, FileText, Image, FileSpreadsheet, Camera, Loader2 } from 'lucide-react';
import { readOFXFile, OFXParseResult } from '@/utils/ofxParser';
import { MultiTransactionModal } from '@/components/modals/MultiTransactionModal';
import { useToast } from '@/hooks/use-toast';
import { saveTransaction, uuidv4 } from '@/utils/localStorage';
import { Transaction } from '@/types';

interface GlobalImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FileType = 'ofx' | 'pdf' | 'image' | 'unknown';

interface SupportedFormat {
  type: FileType;
  extensions: string[];
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const SUPPORTED_FORMATS: SupportedFormat[] = [
  {
    type: 'ofx',
    extensions: ['.ofx', '.qfx'],
    icon: <FileSpreadsheet size={20} />,
    label: 'OFX/QFX',
    description: 'Extrato bancário',
    color: '#10b981'
  },
  {
    type: 'pdf',
    extensions: ['.pdf'],
    icon: <FileText size={20} />,
    label: 'PDF',
    description: 'Faturas e extratos',
    color: '#ef4444'
  },
  {
    type: 'image',
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
    icon: <Image size={20} />,
    label: 'Imagens',
    description: 'Notas e recibos',
    color: '#8b5cf6'
  }
];

export const GlobalImportModal: React.FC<GlobalImportModalProps> = ({ isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [parseResult, setParseResult] = useState<OFXParseResult | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [detectedFileType, setDetectedFileType] = useState<FileType | null>(null);
  const { toast } = useToast();

  const detectFileType = (fileName: string): FileType => {
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    for (const format of SUPPORTED_FORMATS) {
      if (format.extensions.includes(ext)) {
        return format.type;
      }
    }
    return 'unknown';
  };

  const getAllAcceptedExtensions = () => {
    return SUPPORTED_FORMATS.flatMap(f => f.extensions).join(',');
  };

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

  const processOFXFile = async (file: File) => {
    setProcessingMessage('Lendo arquivo OFX...');
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
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processImageOrPDF = async (file: File, fileType: FileType) => {
    setProcessingMessage(fileType === 'pdf' 
      ? 'Analisando PDF com IA...' 
      : 'Analisando imagem com IA...');
    
    try {
      const base64 = await fileToBase64(file);
      
      const response = await fetch('/api/gemini-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          mimeType: file.type,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na análise do documento');
      }

      const data = await response.json();
      
      if (data.success && data.transactions && data.transactions.length > 0) {
        const ocrResult: OFXParseResult = {
          success: true,
          transactions: data.transactions.map((tx: any) => ({
            id: uuidv4(),
            description: tx.description || tx.title,
            amount: Math.abs(tx.amount),
            type: tx.type || (tx.amount >= 0 ? 'income' : 'expense'),
            category: tx.category || 'Não Categorizado',
            date: tx.date || new Date().toISOString().split('T')[0],
          })),
          bankInfo: {
            bankId: data.documentInfo?.establishment || 'Documento Digitalizado',
          },
        };
        
        setParseResult(ocrResult);
        setShowTransactionModal(true);
        toast({
          title: '✅ Documento analisado!',
          description: `${ocrResult.transactions.length} transações encontradas via IA.`,
        });
      } else {
        toast({
          title: '⚠️ Nenhuma transação encontrada',
          description: data.message || 'Não foi possível identificar transações no documento.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro no OCR:', error);
      toast({
        title: '❌ Erro na análise',
        description: 'Não foi possível analisar o documento. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const processFile = async (file: File) => {
    const fileType = detectFileType(file.name);
    setDetectedFileType(fileType);
    
    if (fileType === 'unknown') {
      toast({
        title: '❌ Formato não suportado',
        description: 'Use arquivos OFX, PDF, JPG, PNG ou WEBP',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      switch (fileType) {
        case 'ofx':
          await processOFXFile(file);
          break;
        case 'pdf':
        case 'image':
          await processImageOrPDF(file, fileType);
          break;
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
      setProcessingMessage('');
    }
  };

  const handleSaveTransactions = async (transactions: any[]) => {
    try {
      let savedCount = 0;
      
      for (const tx of transactions) {
        const transaction = {
          id: uuidv4(),
          title: tx.description || tx.title,
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
          className="w-full max-w-xl rounded-2xl overflow-hidden"
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
                <h2 className="text-lg font-bold text-white">Importar Documentos</h2>
                <p className="text-xs text-white/50">Extratos, faturas, notas e recibos</p>
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
            {/* Formatos Suportados */}
            <div className="flex justify-center gap-4 mb-6">
              {SUPPORTED_FORMATS.map((format) => (
                <div 
                  key={format.type}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${format.color}20`, color: format.color }}
                  >
                    {format.icon}
                  </div>
                  <span className="text-xs font-medium text-white/80">{format.label}</span>
                  <span className="text-[10px] text-white/40">{format.description}</span>
                </div>
              ))}
            </div>

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
                accept={getAllAcceptedExtensions()}
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              
              {isProcessing ? (
                <>
                  <Loader2 size={48} className="text-pink-400 animate-spin mb-4" />
                  <p className="text-white/80 font-medium">{processingMessage}</p>
                  <p className="text-white/50 text-sm mt-1">Isso pode levar alguns segundos...</p>
                </>
              ) : (
                <>
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.1))',
                      border: '1px solid rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    <Camera size={40} className="text-pink-400" />
                  </div>
                  <p className="text-white font-medium mb-1 text-center">
                    Arraste seu arquivo aqui
                  </p>
                  <p className="text-white/50 text-sm text-center">
                    ou clique para selecionar
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {SUPPORTED_FORMATS.flatMap(f => f.extensions).map(ext => (
                      <span 
                        key={ext}
                        className="px-2 py-0.5 rounded text-[10px] text-white/50"
                        style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </label>
            
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">OFX/QFX</span>
                </div>
                <p className="text-[10px] text-white/50">
                  Exporte do seu internet banking em formato OFX
                </p>
              </div>
              
              <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Camera size={14} className="text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Fotos & PDFs</span>
                </div>
                <p className="text-[10px] text-white/50">
                  Nossa IA lê faturas, notas fiscais e recibos
                </p>
              </div>
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
            documentType: detectedFileType === 'ofx' ? 'OFX' : 'Documento',
            establishment: parseResult.bankInfo?.bankId || 'Documento Importado'
          }}
        />
      )}
    </>
  );
};

export default GlobalImportModal;
