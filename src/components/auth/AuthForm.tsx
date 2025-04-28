
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { registerUser, loginUser, saveUser } from '@/utils/localStorage';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    // Limpar os campos ao alternar entre modos
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'register') {
        // Validar os campos de registro
        if (!username || !email || !password || !confirmPassword) {
          toast({
            title: "Todos os campos são obrigatórios",
            variant: "destructive"
          });
          return;
        }
        
        if (password !== confirmPassword) {
          toast({
            title: "Senhas não coincidem",
            variant: "destructive"
          });
          return;
        }
        
        // Registrar o usuário
        const user = registerUser({ username, email, password });
        saveUser(user);
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao Sprout"
        });
        
        navigate('/');
      } else {
        // Validar campos de login
        if (!username || !password) {
          toast({
            title: "Por favor, preencha todos os campos",
            variant: "destructive"
          });
          return;
        }
        
        // Login do usuário
        const user = loginUser(username, password);
        
        if (!user) {
          toast({
            title: "Falha no login",
            description: "Nome de usuário ou senha incorretos",
            variant: "destructive"
          });
          return;
        }
        
        saveUser(user);
        toast({
          title: "Login bem-sucedido!",
          description: "Bem-vindo de volta"
        });
        
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-galileo-card rounded-lg shadow-lg max-w-md w-full mx-auto animate-scale-in">
      <h2 className="text-2xl font-bold mb-6 text-center text-galileo-text">
        {mode === 'login' ? 'Entrar' : 'Criar Conta'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-galileo-secondaryText mb-1">
            Nome de Usuário
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-galileo-background text-galileo-text border-galileo-border"
            placeholder="Seu nome de usuário"
          />
        </div>
        
        {mode === 'register' && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-galileo-secondaryText mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-galileo-background text-galileo-text border-galileo-border"
              placeholder="seu@email.com"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-galileo-secondaryText mb-1">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-galileo-background text-galileo-text border-galileo-border"
            placeholder="********"
          />
        </div>
        
        {mode === 'register' && (
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-galileo-secondaryText mb-1">
              Confirmar Senha
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-galileo-background text-galileo-text border-galileo-border"
              placeholder="********"
            />
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-galileo-accent hover:bg-galileo-secondaryText text-galileo-text"
          disabled={loading}
        >
          {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Registrar'}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <button 
          onClick={toggleMode}
          className="text-galileo-secondaryText hover:text-galileo-text text-sm"
        >
          {mode === 'login' 
            ? 'Não tem uma conta? Registre-se' 
            : 'Já tem uma conta? Faça login'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
