
import React, { useState } from 'react';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const SecurityPage: React.FC = () => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Campos vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação não são iguais.",
        variant: "destructive"
      });
      return;
    }
    
    // Here would typically go the actual password change logic
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Segurança" />
      
      <div className="p-4 space-y-6">
        <div className="bg-galileo-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-galileo-text mb-4">Alterar Senha</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
              />
            </div>
            
            <Button type="submit" className="w-full bg-galileo-accent hover:bg-galileo-accent/80">
              Alterar Senha
            </Button>
          </form>
        </div>
        
        <div className="bg-galileo-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-galileo-text mb-4">Autenticação</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="biometric" className="block text-galileo-text">Biometria</Label>
                <p className="text-sm text-galileo-secondaryText">Use sua digital para acessar o aplicativo</p>
              </div>
              <Switch 
                id="biometric" 
                checked={biometricEnabled} 
                onCheckedChange={setBiometricEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pin" className="block text-galileo-text">PIN de Segurança</Label>
                <p className="text-sm text-galileo-secondaryText">Use um PIN de 4 dígitos para acessar o aplicativo</p>
              </div>
              <Switch 
                id="pin" 
                checked={pinEnabled} 
                onCheckedChange={setPinEnabled}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-galileo-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-galileo-text mb-4">Dispositivos Conectados</h2>
          
          <div className="space-y-2">
            <p className="text-galileo-text">Smartphone - São Paulo</p>
            <p className="text-sm text-galileo-secondaryText">Último acesso: hoje, 09:45</p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4 border-galileo-negative text-galileo-negative hover:text-white hover:bg-galileo-negative"
          >
            Encerrar Todas as Sessões
          </Button>
        </div>
      </div>
      
      <NavBar />
    </div>
  );
};

export default SecurityPage;
