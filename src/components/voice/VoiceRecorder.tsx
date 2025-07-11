import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioSend: (audioBlob: Blob) => Promise<void>;
  isProcessing?: boolean;
  disabled?: boolean;
}

interface AudioState {
  isRecording: boolean;
  isPlaying: boolean;
  recordingTime: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onAudioSend, 
  isProcessing = false,
  disabled = false 
}) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    isPlaying: false,
    recordingTime: 0,
    audioUrl: null,
    audioBlob: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false
        }));
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      
      setAudioState(prev => ({
        ...prev,
        isRecording: true,
        recordingTime: 0,
        audioUrl: null,
        audioBlob: null
      }));

      // Start timer
      intervalRef.current = setInterval(() => {
        setAudioState(prev => ({
          ...prev,
          recordingTime: prev.recordingTime + 1
        }));
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && audioState.isRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [audioState.isRecording]);

  const playRecording = useCallback(() => {
    if (audioState.audioUrl) {
      const audio = new Audio(audioState.audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      };
      
      audio.play();
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [audioState.audioUrl]);

  const stopPlaying = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const sendAudio = useCallback(async () => {
    if (audioState.audioBlob) {
      await onAudioSend(audioState.audioBlob);
      
      // Reset state
      setAudioState({
        isRecording: false,
        isPlaying: false,
        recordingTime: 0,
        audioUrl: null,
        audioBlob: null
      });
    }
  }, [audioState.audioBlob, onAudioSend]);

  const discardRecording = useCallback(() => {
    if (audioState.audioUrl) {
      URL.revokeObjectURL(audioState.audioUrl);
    }
    
    setAudioState({
      isRecording: false,
      isPlaying: false,
      recordingTime: 0,
      audioUrl: null,
      audioBlob: null
    });
  }, [audioState.audioUrl]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      {/* Recording State */}
      {audioState.isRecording && (
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Gravando...</span>
          </div>
          <div className="text-white/80 text-lg font-mono">
            {formatTime(audioState.recordingTime)}
          </div>
        </div>
      )}

      {/* Preview State */}
      {audioState.audioBlob && !audioState.isRecording && (
        <div className="text-center mb-4">
          <div className="text-white/80 mb-2">
            Áudio gravado ({formatTime(audioState.recordingTime)})
          </div>
          <div className="flex justify-center gap-2 mb-3">
            <button
              onClick={audioState.isPlaying ? stopPlaying : playRecording}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              disabled={isProcessing}
            >
              {audioState.isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {audioState.isPlaying ? 'Parar' : 'Ouvir'}
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!audioState.audioBlob ? (
          <button
            onClick={audioState.isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              audioState.isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {audioState.isRecording ? (
              <>
                <MicOff size={20} />
                Parar
              </>
            ) : (
              <>
                <Mic size={20} />
                Gravar
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={discardRecording}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              ❌ Descartar
            </button>
            <button
              onClick={sendAudio}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  🎤 Enviar Áudio
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!audioState.isRecording && !audioState.audioBlob && (
        <div className="text-center mt-3 text-white/60 text-sm">
          <p>🎤 Pressione para gravar sua mensagem de voz</p>
          <p className="text-xs mt-1">Exemplos: "Adicionar gasto de R$ 50 em alimentação"</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
