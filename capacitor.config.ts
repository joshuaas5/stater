
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.joshua.stater',
  appName: 'Stater',
  webDir: 'dist',
  server: {
    url: "https://c5c7eb29-8378-43cd-a374-c0aaea44ef12.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  bundledWebRuntime: false,
  plugins: {
    WebView: {
      android: {
        cache: "DISABLED"
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
    BiometricAuth: {
      allowDeviceCredentials: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
