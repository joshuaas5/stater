import { useState, useCallback, useRef, useEffect } from 'react';

interface TTSHookReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  selectedVoice: SpeechSynthesisVoice | null;
}

export const useTextToSpeech = (): TTSHookReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Try to find a Portuguese voice
      const portugueseVoice = availableVoices.find(voice => 
        voice.lang.startsWith('pt') || 
        voice.name.toLowerCase().includes('portuguese') ||
        voice.name.toLowerCase().includes('brasileiro')
      );
      
      if (portugueseVoice && !selectedVoice) {
        setSelectedVoice(portugueseVoice);
      }
    };

    // Load voices immediately if available
    loadVoices();
    
    // Also listen for voices changed event (some browsers load voices asynchronously)
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported, selectedVoice]);

  const speak = useCallback(async (text: string): Promise<void> => {
    // DESABILITADO: Remover resposta automática por voz
    // Sistema deve responder apenas com texto, não com áudio
    console.log('🔇 TTS desabilitado - resposta apenas em texto:', text);
    return Promise.resolve();
  }, []);

  const stop = useCallback(() => {
    if (!isSupported) return;
    
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    setVoice,
    selectedVoice
  };
};
