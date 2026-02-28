import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onImageUpload?: (imageBase64: string) => void;
  loading: boolean;
  waitingConfirmation: boolean;
  pendingActionDetails: { description?: string; category?: string; type?: string; amount?: number; date?: string; ocrTransactions?: any[] } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  onImageUpload,
  loading, 
  waitingConfirmation, 
  pendingActionDetails,
  onConfirm,
  onCancel 
}) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !loading) {
      onSubmit(message.trim());
      setMessage('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        onImageUpload(base64Data);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
        if (onImageUpload) {
          onImageUpload(base64Data);
        }
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <>
      <div 
        className="input-container"
        style={{
          padding: '30px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <form 
          className="input-wrapper" 
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}
        >
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Digite uma mensagem..."
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            rows={1}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '25px',
              padding: '14px 20px',
              color: 'white',
              fontSize: '15px',
              outline: 'none',
              transition: 'all 0.3s ease',
              resize: 'none',
              minHeight: '50px',
              maxHeight: '120px',
              fontFamily: 'inherit',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
          />
          
          <div 
            className="input-actions"
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Anexar arquivo"
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                fontSize: '18px',
                opacity: loading ? 0.5 : 1
              }}
            >
              📎
            </button>
            
            <button
              type="button"
              onClick={startCamera}
              disabled={loading}
              title="Tirar foto"
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                fontSize: '18px',
                opacity: loading ? 0.5 : 1
              }}
            >
              📷
            </button>
            
            <button
              type="submit"
              disabled={loading || !message.trim()}
              title="Enviar"              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: (loading || !message.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                opacity: (loading || !message.trim()) ? 0.5 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.xlsm,image/*"
        onChange={handleFileSelect}
      />
      
      <input
        ref={photoInputRef}
        type="file"
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
      />

      {/* Camera Modal */}
      {showCamera && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              maxWidth: '90%',
              maxHeight: '70%',
              borderRadius: '12px'
            }}
          />
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>            <button
              onClick={capturePhoto}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              📷
            </button>
            
            <button
              onClick={stopCamera}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ❌
            </button>
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .message-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
          .message-input:focus {
            border-color: rgba(255, 255, 255, 0.4) !important;
            background: rgba(255, 255, 255, 0.2) !important;
          }
          .input-actions button:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.25) !important;
            transform: scale(1.05);
          }
          .input-actions button[type="submit"]:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4);
          }
          @media (max-width: 768px) {
            .input-container {
              padding: 20px 0 !important;
            }
            .input-actions button {
              width: 45px !important;
              height: 45px !important;
              font-size: 16px !important;
            }
            .message-input {
              font-size: 14px !important;
            }
          }
        `
      }} />
    </>
  );
};

  // Handle file upload
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;    // Aceitar imagens, PDFs e arquivos de texto/planilha
    const isValidImage = file.type.startsWith('image/') || 
                        file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);
    const isValidPDF = file.type === 'application/pdf' || 
                      file.name.toLowerCase().endsWith('.pdf');
    const isValidText = file.type === 'text/plain' || 
                       file.name.toLowerCase().endsWith('.txt');
    const isValidCSV = file.type === 'text/csv' || 
                      file.name.toLowerCase().endsWith('.csv');
    const isValidExcel = file.type.includes('sheet') || 
                        file.name.toLowerCase().match(/\.(xls|xlsx|xlsm)$/);
      if (!isValidImage && !isValidPDF && !isValidText && !isValidCSV && !isValidExcel) {
      toast({
        title: "Arquivo inválido",
        description: "Selecione apenas: imagens (JPG, PNG), PDF, texto (TXT), planilhas (CSV, XLS, XLSX, XLSM).",
        variant: "destructive"
      });
      return;
    }    if (file.size > 15 * 1024 * 1024) { // 15MB limit para planilhas maiores
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 15MB.",
        variant: "destructive"
      });
      return;
    }

    // Processar arquivos de texto/planilha diferente de imagens/PDFs
    if (isValidText || isValidCSV || isValidExcel) {
      console.log('📄 Processando arquivo texto/planilha:', file.name, file.type);
      
      // Para arquivos de texto e CSV, ler como texto
      if (isValidText || isValidCSV) {
        const textReader = new FileReader();
        textReader.onload = (e) => {
          const textContent = e.target?.result as string;
          console.log('📝 Conteúdo de texto carregado, tamanho:', textContent?.length);
          
          // Criar dados específicos para arquivo de texto
          const fileData = {
            fileName: file.name,
            fileType: isValidCSV ? 'text/csv' : 'text/plain',
            textData: textContent,
            fileSize: file.size
          };
          
          // Passar dados como JSON string no lugar de base64
          onImageUpload?.(JSON.stringify(fileData));
        };
        textReader.readAsText(file);
        return;
      }
      
      // Para arquivos Excel, processar como base64 (será convertido no backend)
      if (isValidExcel) {
        const excelReader = new FileReader();
        excelReader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          console.log('📊 Arquivo Excel carregado, tamanho base64:', base64.length);
          
          // Criar dados específicos para arquivo Excel
          const fileData = {
            fileName: file.name,
            fileType: file.type || 'application/vnd.ms-excel',
            excelData: base64,
            fileSize: file.size
          };
          
          onImageUpload?.(JSON.stringify(fileData));
        };
        excelReader.readAsArrayBuffer(file);
        return;
      }
    }const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      setSelectedImage(fileData);
    };
    reader.readAsDataURL(file);
  };// Camera functions - Detectar se é mobile para usar câmera nativa
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const startCamera = async () => {
    console.log('🔍 Iniciando câmera... isMobile:', isMobile);
    
    // Se for mobile, usar input file com capture para câmera nativa
    if (isMobile) {
      console.log('📱 Usando câmera nativa do mobile');
      // Criar input temporário para câmera nativa
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Usar câmera traseira
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {          const reader = new FileReader();
          reader.onload = (event) => {
            const imageData = event.target?.result as string;
            setSelectedImage(imageData);
            toast({
              title: "Foto capturada!",
              description: "Agora você pode processar o documento.",
            });
          };
          reader.readAsDataURL(file);
        }
      };
      
      input.click();
      return;
    }
    
    console.log('💻 Usando interface de câmera customizada para desktop');
    // Para desktop, manter a interface customizada
    try {
      // Verificar se o navegador suporta câmera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador');
      }

      console.log('Solicitando acesso à câmera...');      // Configuração otimizada para câmera com melhor qualidade
      const constraints = {
        video: {
          facingMode: 'environment', // Câmera traseira preferida (melhor qualidade)
          width: { ideal: 1920, max: 4096 }, // Alta resolução
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30 }, // 30 FPS para melhor qualidade
          focusMode: 'continuous', // Foco automático contínuo
          whiteBalance: 'auto', // Balanço automático de branco
          exposureMode: 'auto' // Exposição automática
        },
        audio: false // Não precisamos de áudio
      };

      // Solicitar permissão para câmera
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Stream da câmera obtido:', mediaStream);
      
      // Primeiro definir o estado para mostrar a interface
      setShowCamera(true);
      setStream(mediaStream);
      
      // Depois configurar o vídeo
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          console.log('Configurando vídeo...');
          const video = videoRef.current;
          
          // Definir propriedades do vídeo
          video.srcObject = mediaStream;
          video.setAttribute('playsinline', 'true'); // Importante para iOS
          video.muted = true; // Necessário para autoplay em alguns navegadores
          
          // Tentar reproduzir o vídeo
          video.play().catch((playError) => {
            console.warn('Erro ao reproduzir vídeo automaticamente:', playError);
            // Não é crítico, o usuário pode clicar para reproduzir
          });
        }
      }, 100);
      
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err);
      
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão negada. Permita o acesso à câmera nas configurações do navegador e tente novamente.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Câmera não suportada neste navegador.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
      }
      
      toast({
        title: "Erro na câmera",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !stream) {
      toast({
        title: "Erro ao capturar",
        description: "Câmera não está pronta. Tente novamente.",
        variant: "destructive"
      });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      toast({
        title: "Erro no canvas",
        description: "Não foi possível processar a imagem.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se o vídeo tem dimensões válidas
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast({
          title: "Vídeo não carregado",
          description: "Aguarde a câmera carregar completamente.",
          variant: "destructive"
        });
        return;
      }      // Configurar canvas com alta qualidade
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Configurações para melhor qualidade
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      // Capturar a imagem do vídeo
      context.drawImage(video, 0, 0);      // Converter para JPEG com alta qualidade (0.95 = 95% de qualidade)
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      setSelectedImage(imageData);
      stopCamera();

      toast({
        title: "Foto capturada com alta qualidade!",
        description: "Agora você pode processar o documento.",
      });
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      toast({
        title: "Erro na captura",
        description: "Falha ao capturar a foto. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };  // Process selected image
  const processSelectedImage = () => {
    if (selectedImage && onImageUpload) {
      onImageUpload(selectedImage); // Sempre sem senha
      setSelectedImage(null);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processMessage = (msg: string): string => {
    // Process numeric inputs with "mil" to convert to thousands
    return msg.replace(/(\d+)\s*mil/gi, (match, number) => {
      return `${number}000`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Digite algo para enviar",
        variant: "destructive"
      });
      return;
    }

    // Process the message before submitting
    const processedMessage = processMessage(message);

    onSubmit(processedMessage);
    setMessage('');
  };

  if (waitingConfirmation && pendingActionDetails) {
    return (      <div className="p-3 border-t border-border bg-amber-50">        <p className="text-sm text-center text-amber-700 mb-2">
          {pendingActionDetails.ocrTransactions ? 
            `Confirmar ação: Registrar ${pendingActionDetails.ocrTransactions.length > 1 ? 'transações' : 'transação'}` :
            `Confirmar ação: Registrar ${pendingActionDetails.type || 'transação'} "${pendingActionDetails.description || pendingActionDetails.category}" de ${pendingActionDetails.amount ? Math.abs(pendingActionDetails.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''} ${pendingActionDetails.date ? `em ${new Date(pendingActionDetails.date).toLocaleDateString('pt-BR')}` : ''}?`
          }
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={onConfirm} variant="default" size="sm" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? 'Confirmando...' : 'Sim, confirmar'}
          </Button>
          <Button onClick={onCancel} variant="destructive" size="sm" disabled={loading}>
            {loading ? 'Cancelando...' : 'Não, cancelar'}
          </Button>
        </div>
      </div>
    );
  }  // Camera view
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-black text-white p-4 text-center">
          <h3 className="text-lg font-semibold">📷 Capturar Documento</h3>
          <p className="text-sm text-gray-300">
            Posicione bem o documento e capture
          </p>
        </div>
        
        {/* Camera area - vertical orientation for PC */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className="rounded-lg shadow-lg bg-black object-cover"
              style={{
                width: '350px',
                height: '500px',
                maxWidth: '90vw',
                maxHeight: '60vh'
              }}
            />
            
            {/* Overlay de guia para posicionamento */}
            <div className="absolute inset-4 border-2 border-dashed border-white opacity-70 rounded pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-white"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-white"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-white"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-white"></div>
            </div>
            
            {!stream && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Inicializando câmera...</p>
                </div>
              </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>
        
        {/* Bottom controls - sempre visível e funcional */}
        <div className="bg-black text-white p-6">
          <div className="flex justify-center gap-4 mb-4">
            <Button 
              onClick={capturePhoto} 
              variant="default" 
              size="lg"
              disabled={!stream}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-lg shadow-lg"
            >
              📸 Capturar Foto
            </Button>
            <Button 
              onClick={stopCamera} 
              variant="destructive" 
              size="lg"
              className="font-semibold px-8 py-3 text-lg shadow-lg"
            >
              ✕ Cancelar
            </Button>
          </div>
          
          {stream && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Câmera conectada e pronta
              </div>
            </div>          )}
        </div>
      </div>
    );
  }

  // Selected image preview
  if (selectedImage) {
    const isPdf = selectedImage.startsWith('data:application/pdf');
    
    return (
      <div className="p-4 border-t border-border bg-card">
        <div className="mb-4 flex justify-center">
          <div className="relative max-w-md w-full">
            {isPdf ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                <div className="text-red-600 text-4xl mb-2">📄</div>
                <p className="font-semibold text-red-800">Documento PDF</p>
                <p className="text-sm text-red-600 mt-1">Pronto para processar</p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Documento selecionado" 
                  className="w-full h-auto max-h-64 object-contain rounded-lg border shadow-md"
                />                <Button
                  onClick={clearSelectedImage}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full shadow-lg"
                >
                  <X size={14} />
                </Button>
              </div>
            )}
          </div>        </div>
        
        {/* Removi o input de senha para PDF */}
        
        <div className="flex justify-center gap-3">
          <Button 
            onClick={processSelectedImage} 
            variant="default" 
            size="lg"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                🤖 Extrair Transações
              </>
            )}
          </Button>
          <Button 
            onClick={clearSelectedImage} 
            variant="outline" 
            size="lg"
            className="font-semibold px-6 py-3 shadow-lg"
          >
            🗑️ Remover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-card">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={loading ? "Processando..." : "Digite uma mensagem..."}
            className="w-full py-2.5 px-4 pr-10 rounded-full bg-muted border border-border text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all"
            disabled={loading || waitingConfirmation}
          />
        </div>
        
        {/* Image upload buttons */}
        <Button 
          type="button"
          onClick={handleFileSelect}
          size="icon"
          variant="outline"
          className="rounded-full"
          disabled={loading || waitingConfirmation}
          title="Selecionar imagem"
        >
          <Image size={18} />
        </Button>
        
        <Button 
          type="button"
          onClick={startCamera}
          size="icon"
          variant="outline" 
          className="rounded-full"
          disabled={loading || waitingConfirmation}
          title="Usar câmera"
        >
          <Camera size={18} />
        </Button>
        
        <Button 
          type="submit" 
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md hover:shadow-lg transition-all duration-200 p-2.5"
          disabled={loading || waitingConfirmation || !message.trim()}
        >
          <Send size={18} />
        </Button>
      </form>
        {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.pdf,.txt,.csv,.xls,.xlsx,.xlsm,text/plain,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ChatInput;
