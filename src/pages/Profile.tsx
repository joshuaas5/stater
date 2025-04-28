
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { User } from '@/types';
import { getCurrentUser, isLoggedIn, logout } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    // Carregar os dados do usuário
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, [navigate]);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Você saiu",
      description: "Logout realizado com sucesso"
    });
    navigate('/login');
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Perfil" showSearch={false} />
      
      <div className="flex flex-col items-center py-8">
        <div className="bg-galileo-accent rounded-full p-4 mb-4">
          <UserIcon size={64} className="text-galileo-text" />
        </div>
        <h2 className="text-2xl font-bold text-galileo-text">{user.username}</h2>
        <p className="text-galileo-secondaryText">{user.email}</p>
      </div>
      
      <div className="px-4 py-6 space-y-6">
        <div className="bg-galileo-card rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold text-galileo-text mb-4">Configurações da Conta</h3>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full border-galileo-border text-galileo-text justify-start"
              onClick={() => toast({
                title: "Preferências",
                description: "Esta funcionalidade será implementada em breve"
              })}
            >
              Preferências
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-galileo-border text-galileo-text justify-start"
              onClick={() => toast({
                title: "Notificações",
                description: "Esta funcionalidade será implementada em breve"
              })}
            >
              Notificações
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-galileo-border text-galileo-text justify-start"
              onClick={() => toast({
                title: "Segurança",
                description: "Esta funcionalidade será implementada em breve"
              })}
            >
              Segurança
            </Button>
          </div>
        </div>
        
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
      
      <NavBar />
    </div>
  );
};

export default Profile;
