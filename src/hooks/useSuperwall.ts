// hooks/useSuperwall.ts
import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export const useSuperwall = () => {
  const isNative = Capacitor.isNativePlatform();

  const register = useCallback(async (event: string) => {
    if (!isNative) {
      console.log('Superwall: Running on web, paywall simulation for:', event);
      return { result: 'noRuleMatch' as const, message: 'Web simulation' };
    }

    try {
      const result = await window.SuperwallPlugin.register({ event });
      console.log('Superwall register result:', result);
      return result;
    } catch (error) {
      console.error('Superwall register error:', error);
      throw error;
    }
  }, [isNative]);

  const setUserAttributes = useCallback(async (attributes: Record<string, any>) => {
    if (!isNative) {
      console.log('Superwall: Setting user attributes on web:', attributes);
      return { success: true };
    }

    try {
      return await window.SuperwallPlugin.setUserAttributes({ attributes });
    } catch (error) {
      console.error('Superwall setUserAttributes error:', error);
      throw error;
    }
  }, [isNative]);

  const track = useCallback(async (event: string, parameters?: Record<string, any>) => {
    if (!isNative) {
      console.log('Superwall: Tracking event on web:', event, parameters);
      return { success: true };
    }

    try {
      return await window.SuperwallPlugin.track({ event, parameters });
    } catch (error) {
      console.error('Superwall track error:', error);
      throw error;
    }
  }, [isNative]);

  return {
    register,
    setUserAttributes,
    track,
    isNative
  };
};
