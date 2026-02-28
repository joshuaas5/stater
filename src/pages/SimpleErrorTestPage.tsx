import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorHandler, useNetworkStatus } from '@/hooks/useErrorHandler';
import { ErrorType } from '@/utils/errorHandler';
import { ArrowLeft, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

const SimpleErrorTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError, clearError, error } = useErrorHandler();
  const { isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(false);

  // Simular erro de rede
  const simulateNetworkError = () => {
    setLoading(true);
    setTimeout(() => {
      handleError(new Error('Falha na conexão com o servidor'), {
        type: ErrorType.NETWORK,
        context: { operation: 'test_network' }
      });
      setLoading(false);
    }, 1000);
  };

  // Simular erro de API
  const simulateApiError = () => {
    setLoading(true);
    setTimeout(() => {
      handleError(new Error('Erro na API de transações'), {
        type: ErrorType.API,
        context: { operation: 'test_api' }
      });
      setLoading(false);
    }, 1000);
  };

  // Simular erro de validação
  const simulateValidationError = () => {
    handleError(new Error('Dados de entrada inválidos'), {
      type: ErrorType.VALIDATION,
      context: { field: 'amount', value: 'invalid' }
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/financial-advisor')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white mb-2">
              Sistema de Tratamento de Erros
            </h1>
            <p className="text-gray-600">
              Teste o sistema de proteção contra erros do ICTUS
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-500/30 bg-red-500/100/10">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Erro Capturado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-red-700">
                    <strong>Mensagem:</strong> {error.message}
                  </p>
                  <p className="text-xs text-red-600">
                    <strong>Tipo:</strong> {error.type} | 
                    <strong>Horário:</strong> {error.timestamp.toLocaleString()}
                  </p>
                </div>
                <Button 
                  onClick={clearError}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Limpar Erro
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Test Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Testes de Erro</CardTitle>
              <CardDescription>
                Clique nos botões para simular diferentes tipos de erro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={simulateNetworkError}
                  disabled={loading}
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                >
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm">Erro de Rede</span>
                </Button>
                
                <Button
                  onClick={simulateApiError}
                  disabled={loading}
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Erro de API</span>
                </Button>
                
                <Button
                  onClick={simulateValidationError}
                  disabled={loading}
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Erro de Validação</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-green-500/100/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-800">✅ Sistema Ativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-800">Proteções Ativas:</h4>
                  <ul className="space-y-1 text-green-700">
                    <li>• Error Boundaries</li>
                    <li>• Tratamento Global</li>
                    <li>• Retry Automático</li>
                    <li>• Fallbacks de API</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-800">Benefícios:</h4>
                  <ul className="space-y-1 text-green-700">
                    <li>• Sem crashes visíveis</li>
                    <li>• Mensagens amigáveis</li>
                    <li>• Recuperação automática</li>
                    <li>• Experiência estável</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SimpleErrorTestPage;
