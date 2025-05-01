
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/use-translation';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-galileo-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-galileo-accent"></div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title={t('profile')} showSearch={false} />
      
      <div className="flex flex-col items-center py-8">
        <div className="bg-galileo-accent rounded-full p-4 mb-4">
          <UserIcon size={64} className="text-galileo-text" />
        </div>
        <h2 className="text-2xl font-bold text-galileo-text">
          {user.user_metadata?.username || user.email?.split('@')[0]}
        </h2>
        <p className="text-galileo-secondaryText">{user.email}</p>
      </div>
      
      <div className="px-4 py-6 space-y-6">
        <div className="bg-galileo-card rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold text-galileo-text mb-4">{t('settings')}</h3>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full border-galileo-border text-galileo-text justify-start"
              onClick={() => navigate('/preferences')}
            >
              {t('preferences')}
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-galileo-border text-galileo-text justify-start"
              onClick={() => navigate('/notifications')}
            >
              {t('notifications')}
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-galileo-border text-galileo-text justify-start"
              onClick={() => navigate('/security')}
            >
              {t('security')}
            </Button>
          </div>
        </div>
        
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('logout')}
        </Button>
      </div>
      
      <NavBar />
    </div>
  );
};

export default Profile;
