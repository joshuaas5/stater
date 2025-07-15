import React, { useState, useEffect, useRef, memo } from 'react';
import { Send, Image, Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import VoiceRecorder from '@/components/voice/VoiceRecorder';

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

const ChatInput: React.FC<ChatInputProps> = memo(({ 
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
      
      // Aguardar um pouco antes de definir o srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          console.log('Video srcObject definido');
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };
  const capturePhoto = () => {
    console.log('Tentando capturar foto...');
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Verificar se o vídeo está carregado
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Vídeo não está carregado ainda');
        toast({
          title: "Erro",
          description: "Aguarde o vídeo carregar completamente",
          variant: "destructive",
        });
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        console.log('Foto capturada, tamanho base64:', base64Data.length);
        
        if (onImageUpload) {
          onImageUpload(base64Data);
          toast({
            title: "Sucesso",
            description: "Foto capturada com sucesso!",
          });
        }
        stopCamera();
      } else {
        console.error('Não foi possível obter contexto do canvas');
        toast({
          title: "Erro",
          description: "Erro ao processar a foto",
          variant: "destructive",
        });
      }
    } else {
      console.error('Video ou Canvas não estão disponíveis');
      toast({
        title: "Erro",
        description: "Câmera não está pronta",
        variant: "destructive",
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

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <>      <div 
        className="input-container"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 20px', // Aumentado mais para 20px
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          width: '100vw',
          boxSizing: 'border-box',
          zIndex: 1000
        }}
      ><div 
          className="input-wrapper" 
          style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'flex-end',
            maxWidth: '900px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            padding: '0 20px'
          }}
        >
          <form 
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'flex-end',
              width: '100%'
            }}
          >            <textarea
              ref={inputRef}
              className="message-input"
              placeholder={loading ? "Enviando..." : "Digite sua mensagem..."}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(15px)',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '25px',
                padding: '16px 24px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease',
                resize: 'none',
                minHeight: '58px', // Aumentado mais para 58px
                maxHeight: '120px',
                fontFamily: 'inherit',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'text',
                lineHeight: '1.4',
                boxSizing: 'border-box',
                width: '100%',
                minWidth: '0', // Evita overflow
                overflow: 'hidden', // Evita scroll interno
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}            />
            
            <div 
              className="input-actions"
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}
            >              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Anexar arquivo"
                style={{
                  width: '58px', // Aumentado mais para 58px
                  height: '58px',
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
                  fontSize: '18px',
                  opacity: loading ? 0.5 : 1
                }}
              >
                📎
              </button>                <button
                type="button"
                onClick={startCamera}
                disabled={loading}
                title="Tirar foto"
                style={{
                  width: '58px', // Aumentado mais para 58px
                  height: '58px',
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
                  fontSize: '18px',
                  opacity: loading ? 0.5 : 1
                }}
              >
                📷
              </button>

              {/* Botão de Áudio - Pequeno como os outros */}
              {onAudioSend && (
                <div style={{ position: 'relative' }}>
                  <VoiceRecorder
                    onAudioSend={onAudioSend}
                    isProcessing={isProcessingAudio}
                    disabled={loading || waitingConfirmation || !audioLimits?.canUseAudio()}
                    compact={true} // Modo compacto para integrar com outros botões
                  />
                  {audioLimits?.usage.warningLevel === 'warning' && (
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255, 165, 0, 0.9)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none'
                    }}>
                      ⚠️ {audioLimits.usage.remainingDaily} restantes
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !message.trim()}
                title="Enviar"
                style={{
                  width: '58px', // Aumentado mais para 58px
                  height: '58px',
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      />      {/* Camera Modal - MELHORADO */}
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
            ✕
          </button>
          
          {/* Vídeo da câmera */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              maxWidth: '95%',
              maxHeight: '70vh',
              borderRadius: '15px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          />
            {/* Controles da câmera */}
          <div style={{ 
            marginTop: '25px', 
            display: 'flex', 
            gap: '20px',
            alignItems: 'center',
            flexDirection: 'column'
          }}>
            {/* Botão capturar */}
            <button
              onClick={capturePhoto}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                fontSize: '28px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px' // Espaço entre botão e texto
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
            >
              📷
            </button>
            
            {/* Dicas de uso - movido para dentro dos controles */}
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              fontSize: '13px',
              maxWidth: '280px',
              lineHeight: '1.3'
            }}>
              💡 Posicione o extrato bem iluminado e sem reflexos
            </div>
          </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}      {/* CSS Animations - CORRIGIDO */}
      <style dangerouslySetInnerHTML={{
        __html: `          .message-input::placeholder {
            color: rgba(255, 255, 255, 0.7) !important;
            text-align: left !important;
            padding-left: 0 !important;
            opacity: 1 !important;
          }
          .message-input:focus::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
          }
          .message-input:focus {
            border-color: rgba(255, 255, 255, 0.4) !important;
            background: rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
          }
          .input-actions button:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.25) !important;
            transform: scale(1.05);
            border-color: rgba(255, 255, 255, 0.35) !important;
          }
          .input-actions button[type="submit"]:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(59, 130, 246, 0.5) !important;
          }
            /* Responsividade mobile melhorada */
          @media (max-width: 768px) {
            .input-container {
              padding: 15px 10px !important;
            }
            .input-wrapper {
              gap: 10px !important;
              padding: 0 10px !important;
            }
            .input-actions button {
              width: 44px !important;
              height: 44px !important;
              font-size: 16px !important;
            }
            .message-input {
              font-size: 14px !important;
              padding: 12px 16px !important;
              min-height: 44px !important;
              border-width: 1px !important;
            }
          }
          
          /* Tablet */
          @media (max-width: 1024px) {
            .input-container {
              padding: 18px 15px !important;
            }
            .input-wrapper {
              padding: 0 15px !important;
            }
          }
          
          /* Dispositivos pequenos */
          @media (max-width: 480px) {
            .input-container {
              padding: 12px 8px !important;
            }
            .input-wrapper {
              gap: 8px !important;
              padding: 0 8px !important;
            }
            .input-actions button {
              width: 40px !important;
              height: 40px !important;
              font-size: 14px !important;
            }
            .message-input {
              font-size: 13px !important;
              padding: 10px 14px !important;
              min-height: 40px !important;
            }
          }
        `
      }} />
    </>
  );
});

export default memo(ChatInput);
