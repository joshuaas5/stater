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
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      if (!text.trim()) {
        resolve();
        return;
      }

      // Stop any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure utterance
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Use selected voice if available
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        // Fallback to Portuguese if available
        utterance.lang = 'pt-BR';
      }

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      utterance.onpause = () => {
        setIsSpeaking(false);
      };

      utterance.onresume = () => {
        setIsSpeaking(true);
      };

      // Start speaking
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        setIsSpeaking(false);
        reject(error);
      }
    });
  }, [isSupported, selectedVoice]);

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
