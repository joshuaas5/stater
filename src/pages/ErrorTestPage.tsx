import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import ErrorHandlingDemo from '@/components/ErrorHandlingDemo';
import ErrorBoundary from '@/components/ErrorBoundary';

const ErrorTestPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/financial-advisor">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Tratamento de Erros
              </h1>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Sistema Ativo</span>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Error Boundaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Captura crashes de componentes React e exibe UI de fallback
                </p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Implementado
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-600" />
                  Retry Logic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Tentativas automáticas para operações que falharam
                </p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Implementado
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Error Handling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Tratamento global de erros com notificações para usuário
                </p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Implementado
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features List */}
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades Implementadas</CardTitle>
              <CardDescription>
                Tier 1, Item 3 - Tratamento de Erros Completo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">✅ Problemas Resolvidos:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Usuário não vê mais erros técnicos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Fallbacks implementados para todas as APIs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Crashes são capturados e tratados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Error Boundaries em todos os componentes</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">🔧 Componentes:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>ErrorBoundary:</strong> Captura crashes React</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Global Handler:</strong> Tratamento centralizado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>API Client:</strong> Wrapper com retry</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Hooks:</strong> Gerenciamento reativo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Supabase Wrapper:</strong> DB com tratamento</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Component */}
          <ErrorHandlingDemo />

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Como Usar</CardTitle>
              <CardDescription>
                Instruções para desenvolvedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Usar ErrorBoundary</h4>
                  <code className="text-sm bg-gray-100 p-2 rounded block">
                    {'<ErrorBoundary><YourComponent /></ErrorBoundary>'}
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Usar hooks de erro</h4>
                  <code className="text-sm bg-gray-100 p-2 rounded block">
                    {'const { handleError } = useErrorHandler();'}
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Usar API Client</h4>
                  <code className="text-sm bg-gray-100 p-2 rounded block">
                    {'const result = await apiClient.get("/api/data");'}
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">4. Usar Supabase Wrapper</h4>
                  <code className="text-sm bg-gray-100 p-2 rounded block">
                    {'const result = await supabaseClient.select("table", "*");'}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ErrorTestPage;
