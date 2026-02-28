import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorHandler, useNetworkStatus, useRetryableOperation } from '@/hooks/useErrorHandler';
import { ErrorType } from '@/utils/errorHandler';
import { apiClient } from '@/utils/apiClient';
import { supabaseClient } from '@/utils/supabaseClient';

const ErrorHandlingDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [crashTrigger, setCrashTrigger] = useState(false);
  
  // Hooks de tratamento de erros
  const { handleError, clearError, error } = useErrorHandler();
  const { isOnline } = useNetworkStatus();
  const { executeWithRetry } = useRetryableOperation();

  // Simular erro de API
  const simulateApiError = async () => {
    setLoading(true);
    try {
      await apiClient.get('/simulate-error');
    } catch (error) {
      handleError(error as Error, {
        type: ErrorType.API,
        context: { operation: 'simulate_api_error' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Simular erro de rede
  const simulateNetworkError = async () => {
    setLoading(true);
    try {
      await executeWithRetry(
        () => fetch('https://non-existent-api.com/data'),
        { maxRetries: 3 }
      );
    } catch (error) {
      handleError(error as Error, {
        type: ErrorType.NETWORK,
        context: { operation: 'simulate_network_error' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Simular erro de validação
  const simulateValidationError = () => {
    const validationError = new Error('Dados inválidos fornecidos');
    handleError(validationError, {
      type: ErrorType.VALIDATION,
      context: { field: 'email', value: 'invalid-email' }
    });
  };

  // Simular crash de componente
  const simulateCrash = () => {
    setCrashTrigger(true);
  };

  // Simular erro de banco de dados
  const simulateDatabaseError = async () => {
    setLoading(true);
    try {
      await supabaseClient.select('non_existent_table', '*');
    } catch (error) {
      handleError(error as Error, {
        type: ErrorType.NETWORK,
        context: { operation: 'simulate_database_error', table: 'non_existent_table' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Componente que vai crashar
  if (crashTrigger) {
    throw new Error('Simulando crash de componente!');
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Sistema de Tratamento de Erros</CardTitle>
        <CardDescription>
          Demonstração do sistema de tratamento de erros implementado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da conexão */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            Status: {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Erro atual */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-600">
              <strong>Erro:</strong> {error.message}
            </p>
            <p className="text-xs text-red-500 mt-1">
              Tipo: {error.type} | Ocorreu em: {error.timestamp.toLocaleString()}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="mt-2"
            >
              Limpar Erro
            </Button>
          </div>
        )}

        {/* Botões de teste */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={simulateApiError}
            disabled={loading}
            variant="outline"
          >
            Erro de API
          </Button>
          
          <Button
            onClick={simulateNetworkError}
            disabled={loading}
            variant="outline"
          >
            Erro de Rede
          </Button>
          
          <Button
            onClick={simulateValidationError}
            disabled={loading}
            variant="outline"
          >
            Erro de Validação
          </Button>
          
          <Button
            onClick={simulateDatabaseError}
            disabled={loading}
            variant="outline"
          >
            Erro de Banco
          </Button>
          
          <Button
            onClick={simulateCrash}
            disabled={loading}
            variant="destructive"
            className="col-span-2"
          >
            Simular Crash
          </Button>
        </div>

        {/* Instruções */}
        <div className="text-sm text-gray-600 space-y-2">
          <h4 className="font-semibold">Como funciona:</h4>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Erro de API:</strong> Simula falha na comunicação com API</li>
            <li>• <strong>Erro de Rede:</strong> Simula perda de conexão com retry automático</li>
            <li>• <strong>Erro de Validação:</strong> Simula dados inválidos</li>
            <li>• <strong>Erro de Banco:</strong> Simula falha no banco de dados</li>
            <li>• <strong>Crash:</strong> Simula crash do componente (capturado pelo ErrorBoundary)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorHandlingDemo;
