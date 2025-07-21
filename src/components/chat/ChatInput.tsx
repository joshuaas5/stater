import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Camera, X, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onImageUpload?: (imageBase64: string) => void;
  loading: boolean;
  waitingConfirmation: boolean;
  pendingActionDetails: { description?: string; category?: string; type?: string; amount?: number; date?: string; ocrTransactions?: any[] } | null;
  onConfirm: () => void;
  onCancel: () => void;
  // Props para funcionalidade de áudio
  onAudioSend?: (audioBlob: Blob) => Promise<void>;
  isProcessingAudio?: boolean;
  audioLimits?: any;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  onImageUpload,
  loading, 
  waitingConfirmation, 
  pendingActionDetails,
  onConfirm,
  onCancel,
  // Props de áudio
  onAudioSend,
  isProcessingAudio = false,
  audioLimits
}) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showAttachmentButtons, setShowAttachmentButtons] = useState(false);
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
      console.log('Iniciando câmera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      console.log('Stream da câmera obtido:', mediaStream);
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
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
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64Data = imageDataUrl.split(',')[1];
      
      if (onImageUpload) {
        onImageUpload(base64Data);
      }
      
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (waitingConfirmation && pendingActionDetails) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(49, 81, 139, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div 
            className="p-4 rounded-xl border"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 className="text-white font-semibold mb-2">
              {pendingActionDetails.ocrTransactions 
                ? 'Confirmar transações detectadas' 
                : 'Confirmar transação'
              }
            </h3>
            
            {pendingActionDetails.ocrTransactions ? (
              <div className="space-y-2">
                {pendingActionDetails.ocrTransactions.map((transaction: any, index: number) => (
                  <div key={index} className="text-sm text-white/80">
                    <strong>{transaction.description}</strong> - 
                    <span className={transaction.type === 'income' ? 'text-green-300' : 'text-red-300'}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount?.toFixed(2)}
                    </span>
                    {transaction.category && <span className="text-white/60"> ({transaction.category})</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/80">
                <strong>{pendingActionDetails.description}</strong> - 
                <span className={pendingActionDetails.type === 'income' ? 'text-green-300' : 'text-red-300'}>
                  {pendingActionDetails.type === 'income' ? '+' : '-'} R$ {pendingActionDetails.amount?.toFixed(2)}
                </span>
                {pendingActionDetails.category && <span className="text-white/60"> ({pendingActionDetails.category})</span>}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={onCancel}
              variant="outline" 
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancelar
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Container fixo no bottom da página como WhatsApp */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(49, 81, 139, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px 16px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div 
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '25px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
                resize: 'none',
                minHeight: '44px',
                maxHeight: '120px',
                fontFamily: 'inherit',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'text',
                lineHeight: '1.4',
                boxSizing: 'border-box',
                width: '100%',
                minWidth: '0',
                overflow: 'hidden'
              }}
            />
            
            <div 
              className="input-actions"
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                alignItems: 'center',
                position: 'relative',
                flexShrink: 0
              }}
            >
              {/* Botões de anexo - aparecem apenas quando showAttachmentButtons é true */}
              {showAttachmentButtons && (
                <div 
                  className="attachment-options"
                  style={{
                    position: 'absolute',
                    bottom: '60px', // Posiciona acima do botão + (altura do botão + gap)
                    right: `${onAudioSend ? '86px' : '38px'}`, // Centralizado exatamente com o botão + (44px/2 = 22px do centro)
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: '8px',
                    alignItems: 'center', // Centraliza perfeitamente na vertical
                    zIndex: 1001,
                    animation: 'slideInFromBottom 0.3s ease-out'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachmentButtons(false);
                    }}
                    disabled={loading}
                    title="Anexar arquivo"
                    style={{
                      width: '44px',
                      height: '44px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      fontSize: '16px',
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    <Image size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      startCamera();
                      setShowAttachmentButtons(false);
                    }}
                    disabled={loading}
                    title="Tirar foto"
                    style={{
                      width: '44px',
                      height: '44px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      fontSize: '16px',
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    <Camera size={18} />
                  </button>
                </div>
              )}

              {/* Botão + para anexos */}
              <button
                type="button"
                onClick={() => setShowAttachmentButtons(!showAttachmentButtons)}
                disabled={loading}
                title="Anexar"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: showAttachmentButtons 
                    ? '2px solid rgba(255, 59, 48, 0.4)' 
                    : '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  opacity: loading ? 0.5 : 1,
                  transform: showAttachmentButtons ? 'rotate(45deg)' : 'rotate(0deg)'
                }}
              >
                <Plus size={18} />
              </button>

              {/* Botão de Áudio */}
              {onAudioSend && (
                <div style={{ position: 'relative' }}>
                  <VoiceRecorder
                    onAudioSend={onAudioSend}
                    isProcessing={isProcessingAudio}
                    disabled={loading || waitingConfirmation || !audioLimits?.canUseAudio()}
                    compact={true}
                  />
                  {audioLimits?.usage.warningLevel === 'warning' && (
                    <div style={{
                      position: 'absolute',
                      top: '-35px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255, 165, 0, 0.9)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 1001
                    }}>
                      ⚠️ {audioLimits.usage.remainingDaily} restantes
                    </div>
                  )}
                </div>
              )}

              {/* Botão de Enviar */}
              <button
                type="submit"
                disabled={loading || !message.trim()}
                title="Enviar"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: (loading || !message.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  opacity: (loading || !message.trim()) ? 0.5 : 1,
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9"></polygon>
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
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
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          {/* Header da câmera */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            zIndex: 1002
          }}>
            📷 Capturar Extrato
          </div>
          
          {/* Botão fechar */}
          <button
            onClick={stopCamera}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              zIndex: 1002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>

          {/* Vídeo da câmera */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              borderRadius: '15px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          />

          {/* Canvas oculto para captura */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />

          {/* Botão de captura */}
          <button
            onClick={capturePhoto}
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: '4px solid white',
              borderRadius: '50%',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
          >
            <Camera size={32} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .attachment-options {
          animation: slideInFromBottom 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChatInput;
