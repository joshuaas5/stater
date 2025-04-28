
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c5c7eb29837843cda374c0aaea44ef12',
  appName: 'sprout-spending-hub',
  webDir: 'dist',
  server: {
    url: "https://c5c7eb29-8378-43cd-a374-c0aaea44ef12.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
