import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  isRetrying: boolean;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  maxRetries?: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries: number;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries || 3;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isRetrying: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Gera um ID único para o erro
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para monitoramento
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📋 Error info:', errorInfo);

    // Atualiza o estado com informações do erro
    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Chama callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log para analytics/monitoring (pode ser enviado para serviços externos)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Aqui você pode implementar logging para serviços externos
    // como Sentry, LogRocket, etc.
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getCurrentUserId(),
        retryCount: this.state.retryCount
      };

      // Log no localStorage para análise posterior
      const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errorLogs.push(errorData);
      
      // Mantém apenas os últimos 50 erros
      if (errorLogs.length > 50) {
        errorLogs.splice(0, errorLogs.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(errorLogs));

      // Aqui você pode enviar para seu serviço de monitoramento
      // await fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorData) });
    } catch (logError) {
      console.error('Erro ao registrar erro:', logError);
    }
  };

  private getCurrentUserId = (): string | null => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      return user?.id || null;
    } catch {
      return null;
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    // Pequeno delay antes de tentar novamente
    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      });
    }, 1000);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReportError = () => {
    const errorData = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    };

    // Cria um mailto com detalhes do erro
    const subject = encodeURIComponent('Erro no Stater IA - Relatório Automático');
    const body = encodeURIComponent(`
Relatório de Erro Automático

ID do Erro: ${this.state.errorId}
Mensagem: ${this.state.error?.message || 'Não especificado'}
Hora: ${new Date().toLocaleString()}
Página: ${window.location.href}
Navegador: ${navigator.userAgent}

Detalhes técnicos:
${this.state.error?.stack || 'Stack trace não disponível'}

Este é um relatório automático gerado pelo sistema de tratamento de erros.
    `);

    window.open(`mailto:suporte@stater.ai?subject=${subject}&body=${body}`);
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Se um fallback customizado foi fornecido, usa ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Interface de erro padrão
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-white">Oops! Algo deu errado</CardTitle>
              <CardDescription className="text-white/70">
                Encontramos um erro inesperado. Não se preocupe, estamos aqui para ajudar!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-50/10 border-red-200/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-100">
                  <strong>Erro ID:</strong> {this.state.errorId}
                </AlertDescription>
              </Alert>

              {this.props.showDetails && this.state.error && (
                <Alert className="bg-yellow-50/10 border-yellow-200/20">
                  <Bug className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-100 text-sm">
                    <strong>Detalhes:</strong> {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                {this.state.retryCount < this.maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {this.state.isRetrying ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Tentando novamente...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tentar Novamente ({this.state.retryCount}/{this.maxRetries})
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar Página
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>

                <Button
                  onClick={this.handleReportError}
                  variant="ghost"
                  className="w-full text-white/70 hover:bg-white/5"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Reportar Erro
                </Button>
              </div>

              <div className="text-center text-sm text-white/50">
                Este erro foi registrado automaticamente para análise.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
