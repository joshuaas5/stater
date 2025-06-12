import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onImageUpload?: (imageBase64: string) => void;
  loading: boolean;
  waitingConfirmation: boolean;
  pendingActionDetails: { description?: string; category?: string; type?: string; amount?: number; date?: string } | null;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Desfocar o input na montagem inicial para evitar foco automático no mobile
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, []);

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle file upload
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Camera functions
  const startCamera = async () => {
    try {
      // Verificar se o navegador suporta câmera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador');
      }

      console.log('Solicitando acesso à câmera...');

      // Solicitar permissão para câmera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Câmera traseira por padrão
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      console.log('Stream da câmera obtido:', mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Aguardar o video carregar e definir o estado
        videoRef.current.onloadedmetadata = () => {
          console.log('Metadados do vídeo carregados');
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Vídeo iniciado com sucesso');
              setShowCamera(true);
            }).catch((playError) => {
              console.error('Erro ao reproduzir vídeo:', playError);
              setShowCamera(true); // Mesmo com erro de play, mostrar a interface
            });
          }
        };

        // Definir o estado imediatamente para mostrar a interface após um pequeno delay
        setTimeout(() => {
          if (mediaStream.active) {
            setShowCamera(true);
          }
        }, 500);
      }
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err);
      
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão negada. Permita o acesso à câmera e tente novamente.';
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
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setSelectedImage(imageData);
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Process selected image
  const processSelectedImage = () => {
    if (selectedImage && onImageUpload) {
      onImageUpload(selectedImage);
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
    return (
      <div className="p-3 border-t border-border bg-amber-50">
        <p className="text-sm text-center text-amber-700 mb-2">
          Confirmar ação: Registrar {pendingActionDetails.type || 'transação'} "<strong>{pendingActionDetails.description || pendingActionDetails.category}</strong>" de <strong>{pendingActionDetails.amount ? Math.abs(pendingActionDetails.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</strong> {pendingActionDetails.date ? `em ${new Date(pendingActionDetails.date).toLocaleDateString('pt-BR')}` : ''}?
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
  }

  // Camera view
  if (showCamera) {
    return (
      <div className="p-3 border-t border-border bg-card">
        <div className="mb-3">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="w-full max-w-sm mx-auto rounded-lg bg-black"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={capturePhoto} variant="default" size="sm">
            📸 Capturar
          </Button>
          <Button onClick={stopCamera} variant="outline" size="sm">
            ❌ Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // Selected image preview
  if (selectedImage) {
    return (
      <div className="p-3 border-t border-border bg-card">
        <div className="mb-3 flex justify-center">
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Documento selecionado" 
              className="max-w-sm max-h-48 object-contain rounded-lg border"
            />
            <Button
              onClick={clearSelectedImage}
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              <X size={12} />
            </Button>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={processSelectedImage} variant="default" size="sm" disabled={loading}>
            {loading ? '🔄 Processando...' : '🤖 Extrair Transações'}
          </Button>
          <Button onClick={clearSelectedImage} variant="outline" size="sm">
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
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ChatInput;
