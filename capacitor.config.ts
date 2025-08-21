
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.timothy.stater',
  appName: 'Stater',
  webDir: 'dist',
  server: {
    url: 'https://stater.app',
    hostname: 'stater.app',
    androidScheme: 'https',
    allowNavigation: [
      'tmucbwlhkffrhtexmjze.supabase.co',
      'accounts.google.com',
      'oauth.googleusercontent.com',
      'googleapis.com',
      'gstatic.com',
      'google.com'
    ]
  },
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: "#31518b",
      showSpinner: false
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    overrideUserAgent: 'StaterApp/1.0.0 Mobile',
    appendUserAgent: 'StaterApp/1.0.0',
    backgroundColor: '#31518b',
    // Forçar que todas as navegações permaneçam no WebView
    useLegacyBridge: false
  }
};

export default config;
