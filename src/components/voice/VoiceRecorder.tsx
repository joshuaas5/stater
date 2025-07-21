import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioSend: (audioBlob: Blob) => Promise<void>;
  isProcessing?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

interface AudioState {
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioSend,
  isProcessing = false,
  disabled = false,
  compact = false
}) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    recordingTime: 0,
    audioBlob: null
  });
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer para contar tempo de gravação
  useEffect(() => {
    if (audioState.isRecording) {
      timerRef.current = setInterval(() => {
        setAudioState(prev => ({
          ...prev,
          recordingTime: prev.recordingTime + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioState.isRecording]);

  const startRecording = useCallback(async () => {
    if (disabled || isProcessing || audioState.isRecording) return;

    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioState(prev => ({
          ...prev,
          isRecording: false,
          audioBlob
        }));

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (compact && audioBlob.size > 0) {
          try {
            await onAudioSend(audioBlob);
            setAudioState({
              isRecording: false,
              recordingTime: 0,
              audioBlob: null
            });
          } catch (error) {
            console.error('Erro ao enviar áudio:', error);
            setError('Erro ao enviar áudio');
          }
        }
      };

      mediaRecorder.start();
      setAudioState(prev => ({
        ...prev,
        isRecording: true,
        recordingTime: 0,
        audioBlob: null
      }));

      console.log('🎤 Gravação iniciada');
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setError('Erro ao acessar microfone. Verifique as permissões.');
    }
  }, [disabled, isProcessing, audioState.isRecording, compact, onAudioSend]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && audioState.isRecording) {
      mediaRecorderRef.current.stop();
      console.log('🎤 Gravação finalizada');
    }
  }, [audioState.isRecording]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!compact || disabled || isProcessing) return;
    
    e.preventDefault();
    isHoldingRef.current = true;
    
    // Inicia gravação imediatamente, sem delay
    startRecording();
  }, [compact, disabled, isProcessing, startRecording]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isHoldingRef.current = false;
    
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
    
    if (audioState.isRecording) {
      stopRecording();
    }
  }, [audioState.isRecording, stopRecording]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!compact || disabled || isProcessing) return;
    
    e.preventDefault();
    isHoldingRef.current = true;
    
    // Inicia gravação imediatamente no mobile também
    startRecording();
  }, [compact, disabled, isProcessing, startRecording]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    isHoldingRef.current = false;
    
    if (audioState.isRecording) {
      stopRecording();
    }
  }, [audioState.isRecording, stopRecording]);

  // Adicionar suporte para eventos globais (quando o usuário solta fora do botão)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isHoldingRef.current && audioState.isRecording) {
        isHoldingRef.current = false;
        stopRecording();
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isHoldingRef.current && audioState.isRecording) {
        isHoldingRef.current = false;
        stopRecording();
      }
    };

    if (audioState.isRecording) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
      document.addEventListener('touchcancel', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [audioState.isRecording, stopRecording]);

  useEffect(() => {
    return () => {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={disabled || isProcessing}
          title={audioState.isRecording ? `Gravando... ${formatTime(audioState.recordingTime)} - Solte para parar` : "🎤 Toque para gravar"}
          style={{
            width: '44px',
            height: '44px',
            background: audioState.isRecording 
              ? 'rgba(239, 68, 68, 0.3)' 
              : 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${audioState.isRecording ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: '50%',
            color: 'white',
            cursor: (disabled || isProcessing) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            fontSize: '18px',
            opacity: (disabled || isProcessing) ? 0.5 : 1,
            userSelect: 'none',
            transform: audioState.isRecording ? 'scale(1.1)' : 'scale(1)',
            boxShadow: audioState.isRecording 
              ? '0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.2)' 
              : '0 4px 15px rgba(0, 0, 0, 0.2)',
            animation: audioState.isRecording ? 'pulse 1.5s infinite' : 'none'
          }}
        >
          {isProcessing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : audioState.isRecording ? (
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#ef4444',
              borderRadius: '2px',
              animation: 'blink 1s infinite'
            }} />
          ) : (
            <Mic size={20} />
          )}
        </button>

        {/* Indicador de tempo de gravação */}
        {audioState.isRecording && (
          <div style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            🔴 {formatTime(audioState.recordingTime)}
          </div>
        )}

        {/* Texto de instrução quando não está gravando */}
        {!audioState.isRecording && !isProcessing && (
          <div style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            opacity: 0.8,
            pointerEvents: 'none'
          }}>
            Manter pressionado
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute',
            top: '-45px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            maxWidth: '150px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0% { transform: scale(1.1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1.1); }
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // Componente não-compacto (versão completa)
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <button
          onClick={audioState.isRecording ? stopRecording : startRecording}
          disabled={disabled || isProcessing}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: audioState.isRecording 
              ? 'linear-gradient(45deg, #ef4444, #dc2626)' 
              : 'linear-gradient(45deg, #3b82f6, #2563eb)',
            color: 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            opacity: disabled ? 0.5 : 1,
            transform: audioState.isRecording ? 'scale(1.1)' : 'scale(1)',
            boxShadow: audioState.isRecording 
              ? '0 0 20px rgba(239, 68, 68, 0.5)' 
              : '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}
        >
          {isProcessing ? (
            <Loader2 size={24} className="animate-spin" />
          ) : audioState.isRecording ? (
            <MicOff size={24} />
          ) : (
            <Mic size={24} />
          )}
        </button>

        {audioState.isRecording && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'white'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'blink 1s infinite'
            }} />
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}>
              {formatTime(audioState.recordingTime)}
            </span>
          </div>
        )}
      </div>

      {audioState.audioBlob && !audioState.isRecording && (
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => onAudioSend(audioState.audioBlob!)}
            disabled={isProcessing}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(45deg, #10b981, #059669)',
              color: 'white',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isProcessing ? 0.5 : 1
            }}
          >
            {isProcessing ? 'Enviando...' : 'Enviar'}
          </button>
          
          <button
            onClick={() => setAudioState(prev => ({ ...prev, audioBlob: null }))}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.8)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Descartar
          </button>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          textAlign: 'center',
          maxWidth: '200px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
