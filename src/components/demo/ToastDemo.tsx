import React from 'react';
import { useCustomToast } from '@/hooks/useCustomToast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const ToastDemo: React.FC = () => {
  const { success, error, warning, info, default: defaultToast } = useCustomToast();

  return (
    <Card className="p-6 max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4">Sistema de Notificações</h3>
      
      <div className="space-y-3">
        <Button 
          onClick={() => success('Sucesso!', 'Transação adicionada com sucesso')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Toast de Sucesso
        </Button>
        
        <Button 
          onClick={() => error('Erro!', 'Falha ao processar transação')}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Toast de Erro
        </Button>
        
        <Button 
          onClick={() => warning('Atenção!', 'Limite de mensagens atingido')}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          Toast de Aviso
        </Button>
        
        <Button 
          onClick={() => info('Informação', 'Sistema atualizado com novas funcionalidades')}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Toast de Info
        </Button>
        
        <Button 
          onClick={() => defaultToast('Notificação', 'Esta é uma notificação padrão')}
          className="w-full bg-gray-600 hover:bg-gray-700"
        >
          Toast Padrão
        </Button>
      </div>
    </Card>
  );
};

export default ToastDemo;
