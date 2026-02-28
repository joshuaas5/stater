/**
 * Sistema de logging centralizado
 * Em produção: ZERO logs no console
 * Em desenvolvimento: logs controlados
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

// Flag para ativar logs temporariamente (para debug remoto)
// Mude para true quando precisar debugar em produção
const FORCE_LOGS = false;

const shouldLog = isDev || FORCE_LOGS;

export const logger = {
  // Log normal - só em dev
  log: (...args: unknown[]) => {
    if (shouldLog) console.log(...args);
  },
  
  // Informações - só em dev
  info: (...args: unknown[]) => {
    if (shouldLog) console.info(...args);
  },
  
  // Avisos - só em dev
  warn: (...args: unknown[]) => {
    if (shouldLog) console.warn(...args);
  },
  
  // Erros - só em dev (erros críticos de verdade ainda aparecem via throw)
  error: (...args: unknown[]) => {
    if (shouldLog) console.error(...args);
  },
  
  // Debug detalhado - só em dev
  debug: (...args: unknown[]) => {
    if (shouldLog) console.debug(...args);
  },
  
  // Dados sensíveis - NUNCA loga (mesmo em dev)
  security: (..._args: unknown[]) => {
    // Nunca loga dados sensíveis
  },
  
  // Grupo de logs - só em dev
  group: (label: string) => {
    if (shouldLog) console.group(label);
  },
  
  groupEnd: () => {
    if (shouldLog) console.groupEnd();
  },
  
  // Table - só em dev
  table: (data: unknown) => {
    if (shouldLog) console.table(data);
  }
};

// Substitui console global em produção para silenciar tudo
if (!shouldLog) {
  const noop = () => {};
  
  // Salva referências originais caso precise restaurar
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    debug: console.debug,
    error: console.error,
    group: console.group,
    groupEnd: console.groupEnd,
    table: console.table,
  };
  
  // Sobrescreve em produção
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.debug = noop;
  // Mantém console.error para erros críticos não tratados
  // console.error = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.table = noop;
  
  // Disponibiliza forma de restaurar se necessário via console do browser
  (window as any).__restoreConsole = () => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.debug = originalConsole.debug;
    console.error = originalConsole.error;
    console.group = originalConsole.group;
    console.groupEnd = originalConsole.groupEnd;
    console.table = originalConsole.table;
    originalConsole.log('✅ Console restaurado!');
  };
}

export default logger;
