import React, { useState, useRef, memo } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onImageUpload?: (imageBase64: string) => void;
  loading: boolean;
  waitingConfirmation: boolean;
  pendingActionDetails: { description?: string; category?: string; type?: string; amount?: number; date?: string; ocrTransactions?: any[] } | null;
  onConfirm: () => void;
  onCancel: () => void;
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
  onAudioSend,
  isProcessingAudio = false,
  audioLimits
}) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-1000">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={loading ? "Enviando..." : "Escreva sua mensagem..."}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '120px'
            }}
          />
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              title="Anexar arquivo"
            >
              📎
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (onImageUpload) {
                  toast({
                    title: "Câmera",
                    description: "Funcionalidade de câmera em desenvolvimento",
                  });
                }
              }}
              disabled={loading}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              title="Tirar foto"
            >
              📷
            </button>
            
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
              title="Enviar"
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
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.xlsm,image/*"
        onChange={handleFileSelect}
      />
    </div>
  );
});

export default ChatInput;
