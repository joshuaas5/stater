import { registerPlugin } from '@capacitor/core';

export interface GoogleAuthInterceptorPlugin {
  openAuthUrl(options: { url: string }): Promise<void>;
}

const GoogleAuthInterceptor = registerPlugin<GoogleAuthInterceptorPlugin>('GoogleAuthInterceptor');

export default GoogleAuthInterceptor;
