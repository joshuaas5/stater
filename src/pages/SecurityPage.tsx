
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import { isLoggedIn, getCurrentUser, saveUser } from '@/utils/localStorage';
import { 
  KeyRound, Lock, Fingerprint, LogOut, 
  AlertCircle, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SecuritySettings {
  requirePasswordOnOpen: boolean;
  enableBiometric: boolean;
  emailNotifications: boolean;
  autoLogout: boolean;
  autoLogoutTime: number;
}

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings>({
    requirePasswordOnOpen: false,
    enableBiometric: false,
    emailNotifications: true,
    autoLogout: true,
    autoLogoutTime: 30,
  });
  
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    // Carregar configurações de segurança (aqui apenas simulando)
    const user = getCurrentUser();
    if (user) {
      // Aqui você carregaria as configurações reais do usuário
      const savedSettings = localStorage.getItem(`security_${user.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [navigate]);
  
  const handleSaveSettings = () => {
    const user = getCurrentUser();
    if (user) {
      localStorage.setItem(`security_${user.id}`, JSON.stringify(settings));
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de segurança foram atualizadas com sucesso."
      });
    }
  };
  
  const handleLogout = () => {
    // Limpar dados da sessão
    localStorage.removeItem('currentUser');
    
    // Redirecionar para login
    navigate('/login');
  };
  
  const handleChangePassword = () => {
    // Validar senhas
    if (!passwords.current) {
      toast({
        title: "Campo obrigatório",
        description: "Digite sua senha atual.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwords.new.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Senhas não conferem",
        description: "A confirmação não corresponde à nova senha.",
        variant: "destructive"
      });
      return;
    }
    
    // Simular alteração de senha
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso."
    });
    
    setShowChangePasswordDialog(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };
  
  const handleSwitchChange = (key: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Segurança" showSearch={false} showBack />
      
      <div className="p-4 pb-20">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-galileo-text mb-2 flex items-center">
              <Lock size={18} className="mr-2" /> Acesso e Autenticação
            </h2>
            <div className="bg-galileo-card p-4 rounded-lg border border-galileo-border">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="require-password" className="cursor-pointer">Solicitar senha ao abrir</Label>
                <Switch 
                  id="require-password" 
                  checked={settings.requirePasswordOnOpen}
                  onCheckedChange={() => handleSwitchChange('requirePasswordOnOpen')}
                />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="enable-biometric" className="cursor-pointer">Permitir acesso por biometria</Label>
                <Switch 
                  id="enable-biometric" 
                  checked={settings.enableBiometric}
                  onCheckedChange={() => handleSwitchChange('enableBiometric')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-logout" className="cursor-pointer">Logout automático por inatividade</Label>
                <Switch 
                  id="auto-logout" 
                  checked={settings.autoLogout}
                  onCheckedChange={() => handleSwitchChange('autoLogout')}
                />
              </div>
              
              {settings.autoLogout && (
                <div className="mt-3 pl-6">
                  <Label htmlFor="auto-logout-time" className="block mb-1 text-sm">
                    Tempo de inatividade (minutos)
                  </Label>
                  <Input 
                    id="auto-logout-time"
                    type="number" 
                    min="1" 
                    max="60"
                    value={settings.autoLogoutTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoLogoutTime: parseInt(e.target.value) || 30 }))}
                    className="w-full"
                  />
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-galileo-border">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={() => setShowChangePasswordDialog(true)}
                >
                  <KeyRound size={16} className="mr-2" /> Alterar senha
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-galileo-text mb-2 flex items-center">
              <AlertCircle size={18} className="mr-2" /> Alertas de Segurança
            </h2>
            <div className="bg-galileo-card p-4 rounded-lg border border-galileo-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="cursor-pointer">Receber alertas por email</Label>
                <Switch 
                  id="email-notifications" 
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleSwitchChange('emailNotifications')}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2 pb-4">
            <Button 
              onClick={handleSaveSettings}
              className="w-full bg-galileo-accent hover:bg-galileo-accent/80 text-white"
            >
              <ShieldCheck size={16} className="mr-2" /> Salvar Configurações
            </Button>
          </div>
          
          <div className="pt-4 border-t border-galileo-border">
            <Button 
              variant="destructive"
              className="w-full"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut size={16} className="mr-2" /> Sair da Conta
            </Button>
          </div>
        </div>
      </div>
      
      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha para confirmar a alteração.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswordFields ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-galileo-secondaryText"
                >
                  {showPasswordFields ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type={showPasswordFields ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type={showPasswordFields ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} className="bg-galileo-accent hover:bg-galileo-accent/80">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
};

export default SecurityPage;
