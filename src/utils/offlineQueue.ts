import { v4 as uuidv4 } from 'uuid';

// Tipos de operações que podem ser enfileiradas
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

// Tipos de entidades que podem ser sincronizadas
export enum EntityType {
  TRANSACTION = 'transaction',
  BILL = 'bill',
  USER_PREFERENCE = 'user_preference',
  CONSULTANT_MESSAGE = 'consultant_message'
}

// Interface para operações na fila
export interface QueuedOperation {
  id: string;
  userId: string;
  entityType: EntityType;
  operationType: OperationType;
  entityId: string;
  entityData: any;
  timestamp: number;
  retryCount: number;
  lastRetry?: number;
}

// Armazenar a fila de operações no IndexedDB
class OfflineQueue {
  private dbName = 'ictus_offline_queue';
  private dbVersion = 1;
  private storeName = 'operations';
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncInterval: number = 30000; // 30 segundos
  private maxRetries: number = 5;
  private retryDelay: number = 5000; // 5 segundos inicial, aumenta exponencialmente
  private syncTimer: number | null = null;

  constructor() {
    // Inicializar o banco de dados
    this.initDatabase();

    // Adicionar event listeners para mudanças de conectividade
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Verificar o estado inicial da conexão
    this.isOnline = navigator.onLine;
    console.log(`Estado inicial da conexão: ${this.isOnline ? 'online' : 'offline'}`);
  }

  // Inicializar o banco de dados IndexedDB
  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('Erro ao abrir o banco de dados IndexedDB:', event);
        reject(new Error('Falha ao abrir o banco de dados offline'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Banco de dados IndexedDB inicializado com sucesso');
        resolve();

        // Iniciar a sincronização se estiver online
        if (this.isOnline) {
          this.startSync();
        }
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Criar o object store para operações offline
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // Criar índices para facilitar consultas
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('entityType', 'entityType', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('retryCount', 'retryCount', { unique: false });
          
          console.log('Object store para operações offline criado');
        }
      };
    });
  }

  // Manipulador para quando a conexão voltar
  private handleOnline(): void {
    console.log('Conexão restabelecida');
    this.isOnline = true;
    
    // Notificar a aplicação
    window.dispatchEvent(new CustomEvent('ictus:online'));
    
    // Iniciar a sincronização
    this.startSync();
  }

  // Manipulador para quando a conexão cair
  private handleOffline(): void {
    console.log('Conexão perdida');
    this.isOnline = false;
    
    // Notificar a aplicação
    window.dispatchEvent(new CustomEvent('ictus:offline'));
    
    // Parar a sincronização
    this.stopSync();
  }

  // Iniciar a sincronização periódica
  private startSync(): void {
    if (this.syncTimer !== null) return;
    
    // Tentar sincronizar imediatamente
    this.syncQueue();
    
    // Configurar sincronização periódica
    this.syncTimer = window.setInterval(() => {
      this.syncQueue();
    }, this.syncInterval);
    
    console.log('Sincronização periódica iniciada');
  }

  // Parar a sincronização periódica
  private stopSync(): void {
    if (this.syncTimer !== null) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('Sincronização periódica parada');
    }
  }

  // Adicionar uma operação à fila
  public async enqueue(userId: string, entityType: EntityType, operationType: OperationType, entityId: string, entityData: any): Promise<string> {
    await this.initDatabase();
    
    const operation: QueuedOperation = {
      id: uuidv4(),
      userId,
      entityType,
      operationType,
      entityId,
      entityData,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Banco de dados não inicializado'));
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.add(operation);
      
      request.onsuccess = () => {
        console.log(`Operação ${operationType} para ${entityType} adicionada à fila offline`, operation);
        
        // Se estiver online, tentar sincronizar imediatamente
        if (this.isOnline && !this.syncInProgress) {
          this.syncQueue();
        }
        
        resolve(operation.id);
      };
      
      request.onerror = (event) => {
        console.error('Erro ao adicionar operação à fila offline:', event);
        reject(new Error('Falha ao adicionar operação à fila offline'));
      };
    });
  }

  // Obter todas as operações na fila para um usuário
  public async getQueuedOperations(userId: string): Promise<QueuedOperation[]> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Banco de dados não inicializado'));
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      
      const request = index.getAll(IDBKeyRange.only(userId));
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('Erro ao obter operações da fila:', event);
        reject(new Error('Falha ao obter operações da fila'));
      };
    });
  }

  // Remover uma operação da fila
  public async removeFromQueue(operationId: string): Promise<void> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Banco de dados não inicializado'));
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(operationId);
      
      request.onsuccess = () => {
        console.log(`Operação ${operationId} removida da fila`);
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Erro ao remover operação da fila:', event);
        reject(new Error('Falha ao remover operação da fila'));
      };
    });
  }

  // Atualizar uma operação na fila (para incrementar contagem de tentativas)
  private async updateOperation(operation: QueuedOperation): Promise<void> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Banco de dados não inicializado'));
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.put(operation);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Erro ao atualizar operação na fila:', event);
        reject(new Error('Falha ao atualizar operação na fila'));
      };
    });
  }

  // Sincronizar a fila de operações com o servidor
  public async syncQueue(): Promise<void> {
    // Se não estiver online ou já estiver sincronizando, não fazer nada
    if (!this.isOnline || this.syncInProgress) {
      return;
    }
    
    this.syncInProgress = true;
    console.log('Iniciando sincronização da fila offline...');
    
    try {
      await this.initDatabase();
      
      if (!this.db) {
        throw new Error('Banco de dados não inicializado');
      }
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      // Ordenar por timestamp para processar na ordem correta
      const index = store.index('timestamp');
      const request = index.getAll();
      
      request.onsuccess = async () => {
        const operations: QueuedOperation[] = request.result;
        
        if (operations.length === 0) {
          console.log('Nenhuma operação na fila para sincronizar');
          this.syncInProgress = false;
          return;
        }
        
        console.log(`Encontradas ${operations.length} operações para sincronizar`);
        
        // Processar operações sequencialmente
        for (const operation of operations) {
          try {
            // Verificar se já excedeu o número máximo de tentativas
            if (operation.retryCount >= this.maxRetries) {
              console.warn(`Operação ${operation.id} excedeu o número máximo de tentativas e será removida da fila`);
              await this.removeFromQueue(operation.id);
              continue;
            }
            
            // Tentar executar a operação
            const success = await this.processOperation(operation);
            
            if (success) {
              // Se teve sucesso, remover da fila
              await this.removeFromQueue(operation.id);
              console.log(`Operação ${operation.id} sincronizada com sucesso e removida da fila`);
            } else {
              // Se falhou, incrementar contagem de tentativas
              operation.retryCount++;
              operation.lastRetry = Date.now();
              await this.updateOperation(operation);
              console.warn(`Falha ao sincronizar operação ${operation.id}, incrementada contagem de tentativas para ${operation.retryCount}`);
            }
          } catch (error) {
            console.error(`Erro ao processar operação ${operation.id}:`, error);
            
            // Incrementar contagem de tentativas
            operation.retryCount++;
            operation.lastRetry = Date.now();
            await this.updateOperation(operation);
          }
          
          // Pequeno intervalo entre operações para não sobrecarregar o servidor
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Notificar que a sincronização foi concluída
        window.dispatchEvent(new CustomEvent('ictus:syncCompleted'));
      };
      
      request.onerror = (event) => {
        console.error('Erro ao obter operações para sincronização:', event);
      };
    } catch (error) {
      console.error('Erro durante a sincronização da fila:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Processar uma operação específica
  private async processOperation(operation: QueuedOperation): Promise<boolean> {
    // Este método será implementado pelo módulo de sincronização
    // que conhece os detalhes de como executar cada tipo de operação
    // Aqui apenas disparamos um evento para que o módulo apropriado possa processar
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        // Se não receber resposta em 10 segundos, considerar como falha
        console.warn(`Timeout ao processar operação ${operation.id}`);
        resolve(false);
      }, 10000);
      
      // Criar um listener único para esta operação
      const listener = (event: CustomEvent) => {
        if (event.detail.operationId === operation.id) {
          clearTimeout(timeoutId);
          window.removeEventListener('ictus:operationProcessed', listener as EventListener);
          resolve(event.detail.success);
        }
      };
      
      // Adicionar o listener
      window.addEventListener('ictus:operationProcessed', listener as EventListener);
      
      // Disparar o evento para processamento
      window.dispatchEvent(new CustomEvent('ictus:processOperation', {
        detail: operation
      }));
    });
  }

  // Verificar se há operações pendentes para uma entidade específica
  public async hasPendingOperations(entityType: EntityType, entityId: string): Promise<boolean> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Banco de dados não inicializado'));
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      // Usar cursor para encontrar qualquer operação que corresponda
      const request = store.openCursor();
      
      let found = false;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (cursor) {
          const op = cursor.value as QueuedOperation;
          
          if (op.entityType === entityType && op.entityId === entityId) {
            found = true;
            resolve(true);
            return;
          }
          
          cursor.continue();
        } else {
          // Nenhuma operação encontrada
          resolve(found);
        }
      };
      
      request.onerror = (event) => {
        console.error('Erro ao verificar operações pendentes:', event);
        reject(new Error('Falha ao verificar operações pendentes'));
      };
    });
  }
}

// Exportar uma instância singleton
export const offlineQueue = new OfflineQueue();
