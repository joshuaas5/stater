
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSubmit: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit }) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  
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
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite uma mensagem, despesa ou receita..."
          className="w-full py-2.5 px-4 pr-10 rounded-full bg-galileo-card border border-galileo-border text-galileo-text placeholder-galileo-placeholder text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm transition-all"
        />

      </div>
      <Button 
        type="submit" 
        size="icon"
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 p-2.5"
      >
        <Send size={18} className="transform transition-transform group-hover:translate-x-1" />
      </Button>
    </form>
  );
};

export default ChatInput;
