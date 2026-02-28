// Wrapper para APIs com tratamento de erro completo
import { errorHandler, ErrorType, withRetry, withTimeout } from './errorHandler';

interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private headers: Record<string, string>;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.timeout = config.timeout || 15000;
    this.retries = config.retries || 3;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }

  // Método GET
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // Método POST
  async post<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  // Método PUT
  async put<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  // Método DELETE
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Método PATCH
  async patch<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  // Método principal de requisição
  private async request<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const config = this.buildConfig(options);

    return withRetry(async () => {
      return withTimeout(
        this.makeRequest<T>(url, config),
        this.timeout,
        `Timeout na requisição para ${endpoint}`
      );
    }, { maxRetries: this.retries });
  }

  // Fazer a requisição HTTP
  private async makeRequest<T>(url: string, config: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, config);

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        await this.handleHttpError(response, url);
      }

      // Tentar fazer parse do JSON
      let data: T;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : ({} as T);
      } catch (parseError) {
        throw errorHandler.handleError(
          new Error(`Erro ao fazer parse da resposta: ${parseError}`),
          {
            type: ErrorType.API,
            context: { url, status: response.status }
          }
        );
      }

      return {
        data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw errorHandler.handleError(
          new Error('Erro de conexão. Verifique sua internet e tente novamente.'),
          {
            type: ErrorType.NETWORK,
            context: { url, originalError: error }
          }
        );
      }

      throw error;
    }
  }

  // Tratar erros HTTP
  private async handleHttpError(response: Response, url: string): Promise<never> {
    let errorMessage = `Erro HTTP ${response.status}`;
    let errorDetails: any = null;

    try {
      const errorBody = await response.text();
      if (errorBody) {
        try {
          errorDetails = JSON.parse(errorBody);
          errorMessage = errorDetails.message || errorDetails.error || errorMessage;
        } catch {
          errorMessage = errorBody;
        }
      }
    } catch {
      // Ignorar erros ao ler o corpo da resposta
    }

    // Determinar tipo de erro baseado no status
    let errorType = ErrorType.API;
    if (response.status === 401) {
      errorType = ErrorType.AUTHENTICATION;
    } else if (response.status === 400) {
      errorType = ErrorType.VALIDATION;
    } else if (response.status >= 500) {
      errorType = ErrorType.API;
    }

    throw errorHandler.handleError(
      new Error(errorMessage),
      {
        type: errorType,
        context: {
          url,
          status: response.status,
          statusText: response.statusText,
          details: errorDetails
        }
      }
    );
  }

  // Construir URL completa
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  }

  // Construir configuração da requisição
  private buildConfig(options: RequestInit): RequestInit {
    return {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };
  }

  // Definir token de autenticação
  setAuthToken(token: string) {
    this.headers.Authorization = `Bearer ${token}`;
  }

  // Remover token de autenticação
  removeAuthToken() {
    delete this.headers.Authorization;
  }

  // Atualizar headers
  updateHeaders(headers: Record<string, string>) {
    this.headers = { ...this.headers, ...headers };
  }
}

// Instância padrão do cliente API
export const apiClient = new ApiClient();

// Função para criar cliente customizado
export const createApiClient = (config: ApiConfig) => new ApiClient(config);

// Cliente específico para a API do Gemini
export const geminiApiClient = new ApiClient({
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  timeout: 30000,
  retries: 2
});

// Cliente específico para APIs do Supabase
export const supabaseApiClient = new ApiClient({
  timeout: 20000,
  retries: 3
});

export type { ApiConfig, ApiResponse, ApiError };
