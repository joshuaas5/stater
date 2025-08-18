import React from 'react';

/**
 * Componente de tela de carregamento global para verificação de autenticação
 */
const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center z-50">
      {/* Spinner animado */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo ou ícone da aplicação */}
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        {/* Spinner principal */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>

        {/* Texto de carregamento */}
        <div className="text-center">
          <h2 className="text-white text-lg font-medium mb-1">ICTUS</h2>
          <p className="text-white/60 text-sm">Verificando autenticação...</p>
        </div>

        {/* Partículas flutuantes para consistência visual */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/15 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
