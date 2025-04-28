
import React from 'react';
import AuthForm from '@/components/auth/AuthForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-galileo-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-galileo-text">Sprout</h1>
          <p className="text-galileo-secondaryText mt-2">
            Seu aplicativo para controle de finanças pessoais
          </p>
        </div>
        
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
