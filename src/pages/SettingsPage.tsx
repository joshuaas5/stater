import React from 'react';
import TestIntegrationButton from '@/components/TestIntegrationButton';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="my-8">
        <h1 className="text-3xl font-bold mb-4">
          Configurações
        </h1>
        <hr className="mb-8" />

        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Informações do Usuário
          </h2>
          {user ? (
            <div>
              <p className="mb-2"><strong>Nome de usuário:</strong> {user.user_metadata?.username || user.email?.split('@')[0] || 'N/A'}</p>
              <p className="mb-2"><strong>Email:</strong> {user.email || 'N/A'}</p>
              <p className="mb-2"><strong>ID:</strong> {user.id}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Você precisa estar logado para ver suas informações.
            </p>
          )}
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Sincronização de Dados
          </h2>
          <p className="mb-4">
            Seus dados são sincronizados automaticamente com o Supabase sempre que você realiza uma operação.
            Isso permite que você acesse seus dados de qualquer dispositivo em que esteja logado.
          </p>
          
          <TestIntegrationButton />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
