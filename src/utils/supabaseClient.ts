// Wrapper para Supabase com tratamento de erros robusto
import { supabase } from '@/lib/supabase';
import { errorHandler, ErrorType, withRetry, withTimeout } from './errorHandler';
import { PostgrestError } from '@supabase/supabase-js';

interface SupabaseOperation<T> {
  data: T | null;
  error: PostgrestError | null;
  success: boolean;
  errorMessage?: string;
}

interface SupabaseAuthOperation<T> {
  data: T | null;
  error: any;
  success: boolean;
  errorMessage?: string;
}

class SupabaseClient {
  private retryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 5000
  };

  // Wrapper para operações SELECT
  async select<T>(
    table: string,
    columns: string = '*',
    filters?: Record<string, any>,
    options?: {
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      single?: boolean;
      timeout?: number;
    }
  ): Promise<SupabaseOperation<T>> {
    try {
      return await withTimeout(
        withRetry(async () => {
          let query = supabase.from(table).select(columns);

          // Aplicar filtros
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }

          // Aplicar ordenação
          if (options?.orderBy) {
            query = query.order(options.orderBy.column, {
              ascending: options.orderBy.ascending ?? true
            });
          }

          // Aplicar limite
          if (options?.limit) {
            query = query.limit(options.limit);
          }

          // Executar query
          const result = options?.single ? await query.single() : await query;

          if (result.error) {
            throw new Error(this.formatSupabaseError(result.error));
          }

          return {
            data: result.data as T,
            error: null,
            success: true
          };
        }, this.retryConfig),
        options?.timeout || 10000,
        `Timeout na consulta à tabela ${table}`
      );
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, {
        type: ErrorType.SUPABASE,
        context: { table, columns, filters, options },
        showToast: true
      });

      return {
        data: null,
        error: error as PostgrestError,
        success: false,
        errorMessage: appError.userFriendlyMessage
      };
    }
  }

  // Wrapper para operações INSERT
  async insert<T>(
    table: string,
    data: any,
    options?: {
      returning?: string;
      timeout?: number;
      upsert?: boolean;
    }
  ): Promise<SupabaseOperation<T>> {
    try {
      return await withTimeout(
        withRetry(async () => {
          let result;

          if (options?.upsert) {
            result = await supabase.from(table).upsert(data);
          } else {
            result = await supabase.from(table).insert(data);
          }

          if (options?.returning) {
            result = await supabase.from(table).insert(data).select(options.returning);
          }

          if (result.error) {
            throw new Error(this.formatSupabaseError(result.error));
          }

          return {
            data: result.data as T,
            error: null,
            success: true
          };
        }, this.retryConfig),
        options?.timeout || 10000,
        `Timeout na inserção na tabela ${table}`
      );
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, {
        type: ErrorType.SUPABASE,
        context: { table, data, options },
        showToast: true
      });

      return {
        data: null,
        error: error as PostgrestError,
        success: false,
        errorMessage: appError.userFriendlyMessage
      };
    }
  }

  // Wrapper para operações UPDATE
  async update<T>(
    table: string,
    data: any,
    filters: Record<string, any>,
    options?: {
      returning?: string;
      timeout?: number;
    }
  ): Promise<SupabaseOperation<T>> {
    try {
      return await withTimeout(
        withRetry(async () => {
          let query = supabase.from(table).update(data);

          // Aplicar filtros
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });

          let result;
          if (options?.returning) {
            result = await query.select(options.returning);
          } else {
            result = await query;
          }

          if (result.error) {
            throw new Error(this.formatSupabaseError(result.error));
          }

          return {
            data: result.data as T,
            error: null,
            success: true
          };
        }, this.retryConfig),
        options?.timeout || 10000,
        `Timeout na atualização da tabela ${table}`
      );
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, {
        type: ErrorType.SUPABASE,
        context: { table, data, filters, options },
        showToast: true
      });

      return {
        data: null,
        error: error as PostgrestError,
        success: false,
        errorMessage: appError.userFriendlyMessage
      };
    }
  }

  // Wrapper para operações DELETE
  async delete<T>(
    table: string,
    filters: Record<string, any>,
    options?: {
      returning?: string;
      timeout?: number;
    }
  ): Promise<SupabaseOperation<T>> {
    try {
      return await withTimeout(
        withRetry(async () => {
          let query = supabase.from(table).delete();

          // Aplicar filtros
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });

          let result;
          if (options?.returning) {
            result = await query.select(options.returning);
          } else {
            result = await query;
          }

          if (result.error) {
            throw new Error(this.formatSupabaseError(result.error));
          }

          return {
            data: result.data as T,
            error: null,
            success: true
          };
        }, this.retryConfig),
        options?.timeout || 10000,
        `Timeout na exclusão da tabela ${table}`
      );
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, {
        type: ErrorType.SUPABASE,
        context: { table, filters, options },
        showToast: true
      });

      return {
        data: null,
        error: error as PostgrestError,
        success: false,
        errorMessage: appError.userFriendlyMessage
      };
    }
  }

  // Wrapper para operações RPC
  async rpc<T>(
    functionName: string,
    parameters?: any,
    options?: {
      timeout?: number;
    }
  ): Promise<SupabaseOperation<T>> {
    try {
      return await withTimeout(
        withRetry(async () => {
          const result = await supabase.rpc(functionName, parameters);

          if (result.error) {
            throw new Error(this.formatSupabaseError(result.error));
          }

          return {
            data: result.data,
            error: null,
            success: true
          };
        }, this.retryConfig),
        options?.timeout || 15000,
        `Timeout na função RPC ${functionName}`
      );
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, {
        type: ErrorType.SUPABASE,
        context: { functionName, parameters, options },
        showToast: true
      });

      return {
        data: null,
        error: error as PostgrestError,
        success: false,
        errorMessage: appError.userFriendlyMessage
      };
    }
  }

  // Operações de autenticação
  async signUp(email: string, password: string, options?: any): Promise<SupabaseAuthOperation<any>> {
    try {
      return await withTimeout(
        withRetry(async () => {
          const result = await supabase.auth.signUp({
            email,
            password,
            options
          });

          if (result.error) {
            throw new Error(this.formatAuthError(result.error));
          }

          return {
            data: result.data,
            error: null,
            success: true
          };
        }, { ...this.retryConfig, maxRetries: 1 }), // Menos retries para auth
        10000,
        'Timeout no cadastro'
      );
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, {
        type: ErrorType.AUTHENTICATION,
        context: { email, options },
        showToast: true
      });

      return {
        data: null,
        error: error,
        success: false,
        errorMessage: appError.userFriendlyMessage
      };
    }
  }

  async signIn(email: string, password: string): Promise<SupabaseAuthOperation<any>> {
    try {
      return await withTimeout(
        withRetry(async () => {
          const result = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (result.error) {
            throw new Error(this.formatAuthError(result.error));
          }

          return {
            data: result.data,
            error: null,
            success: true
          };
        }, { ...this.retryConfig, maxRetries: 1 }), // Menos retries para auth
        10000,
        'Timeout no login'
      );
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, {
        type: ErrorType.AUTHENTICATION,
        context: { email },
        showToast: true
      });

      return {
        data: null,
        error: error,
        success: false,
        errorMessage: appError.userFriendlyMessage
      };
    }
  }

  async signOut(): Promise<SupabaseAuthOperation<any>> {
    try {
      const result = await supabase.auth.signOut();

      if (result.error) {
        throw new Error(this.formatAuthError(result.error));
      }

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, {
        type: ErrorType.AUTHENTICATION,
        showToast: true
      });

      return {
        data: null,
        error: error,
        success: false,
        errorMessage: appError.userFriendlyMessage
      };
    }
  }

  // Formatar erros do Supabase
  private formatSupabaseError(error: PostgrestError): string {
    const errorMap: Record<string, string> = {
      'PGRST116': 'Nenhum registro encontrado',
      '23505': 'Registro já existe',
      '23503': 'Violação de chave estrangeira',
      '23502': 'Campo obrigatório não preenchido',
      '42501': 'Permissão negada',
      'PGRST301': 'Não foi possível inserir/atualizar registro',
      'PGRST204': 'Nenhum registro foi modificado'
    };

    return errorMap[error.code] || error.message || 'Erro no banco de dados';
  }

  // Formatar erros de autenticação
  private formatAuthError(error: any): string {
    const errorMap: Record<string, string> = {
      'invalid_credentials': 'Email ou senha inválidos',
      'email_not_confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
      'weak_password': 'Senha muito fraca. Use pelo menos 8 caracteres.',
      'signup_disabled': 'Cadastro desabilitado',
      'user_already_exists': 'Usuário já existe',
      'invalid_email': 'Email inválido',
      'email_address_not_authorized': 'Email não autorizado'
    };

    return errorMap[error.message] || error.message || 'Erro de autenticação';
  }

  // Obter cliente original para operações específicas
  getClient() {
    return supabase;
  }
}

// Instância singleton
export const supabaseClient = new SupabaseClient();

// Exportar tipos
export type { SupabaseOperation, SupabaseAuthOperation };
