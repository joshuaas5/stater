import React, { useState } from 'react';
import { testSupabaseIntegration } from '@/utils/testSupabaseIntegration';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const TestIntegrationButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Sobrescrever console.log para capturar os logs
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  const runTest = async () => {
    setIsLoading(true);
    setResult(null);
    setLogs([]);

    // Sobrescrever console.log e console.error para capturar os logs
    const capturedLogs: string[] = [];
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      capturedLogs.push(message);
      setLogs(prev => [...prev, message]);
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      const message = `ERRO: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`;
      capturedLogs.push(message);
      setLogs(prev => [...prev, message]);
      originalConsoleError(...args);
    };

    try {
      await testSupabaseIntegration();
      setResult({ 
        success: true, 
        message: 'Todos os testes foram concluídos! Verifique os logs para mais detalhes.' 
      });
    } catch (error) {
      setResult({ 
        success: false, 
        message: `Erro ao executar os testes: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      // Restaurar console.log e console.error
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">
        Teste de Integração com Supabase
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Este teste verificará se todas as funcionalidades de integração com o Supabase estão funcionando corretamente.
        Serão testadas transações, contas a pagar, notificações e outras funcionalidades.
      </p>
      
      <Button 
        variant="default" 
        onClick={runTest} 
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? 'Executando testes...' : 'Executar Testes de Integração'}
      </Button>
      
      {result && (
        <Alert 
          variant={result.success ? "default" : "destructive"} 
          className="mt-4"
        >
          <AlertDescription>
            {result.message}
          </AlertDescription>
        </Alert>
      )}
      
      {logs.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">
            Logs de Execução:
          </h4>
          <div 
            className="max-h-[300px] overflow-y-auto p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap"
          >
            {logs.map((log, index) => (
              <div key={index} className={`mb-1 ${log.startsWith('ERRO') ? 'text-destructive' : 
                       log.includes('sucesso') ? 'text-green-600' : 
                       ''}`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestIntegrationButton;
