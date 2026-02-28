
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.timothy.stater',
  appName: 'Stater',
  webDir: 'dist',
  // Removido server config para usar recursos locais no APK
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: "#020617",
      showSpinner: false
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // Web Client ID (mesmo projeto Firebase) para troca de tokens no backend
      serverClientId: '1011686437516-r63t3ba5gvjg4m7m7vrvcsb80ccqb25a.apps.googleusercontent.com',
      // Android-specific client ID for native sign-in
      androidClientId: '1011686437516-msfgio4ev9jdu3ck4hj0vb2s4bvvcq8e.apps.googleusercontent.com',
      // Offline tokens não são necessários (evita uso incorreto de server client ID)
      forceCodeForRefreshToken: false,
      additionalScopes: ['openid'],
      selectAccount: true
    },
    // ✅ CONFIGURAÇÃO OTIMIZADA PARA OAUTH MAIS NATIVO
    // Browser plugin removed to prevent WebView fallback during auth
    CapacitorCookies: {
      enabled: true                        // Necessário para auth flow
    }
  },
  server: {
    androidScheme: 'https',                 // Esquema seguro
    cleartext: true,                        // Permitir HTTP para dev
    allowNavigation: ['*']                  // Permitir navegação para atualização
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#020617',
    webContentsDebuggingEnabled: true      // Habilitar debug no Chrome
  },
  ios: {
    backgroundColor: '#020617',
    contentInset: 'automatic'
  }
};

export default config;

