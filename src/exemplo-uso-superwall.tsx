import { SuperwallPlugin } from '../plugins/superwall';

// Em qualquer componente onde você quer verificar premium
const handlePremiumFeature = async () => {
  const userIsPremium = await checkUserPremiumStatus(); // Sua lógica
  
  if (userIsPremium) {
    // Executar funcionalidade premium
    executeAdvancedAnalysis();
  } else {
    // Mostrar paywall
    await SuperwallPlugin.presentPaywall({ name: 'premium_features' });
  }
};

// Para configurar usuário (fazer na autenticação)
const setupUser = async (userId: string, email: string) => {
  await SuperwallPlugin.setUserAttributes({
    attributes: {
      user_id: userId,
      email: email,
      signup_date: new Date().toISOString(),
      plan: 'free' // ou 'premium'
    }
  });
};
