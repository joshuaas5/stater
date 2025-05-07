
// BiometricService.ts
// Service for handling biometric authentication

class BiometricServiceClass {
  async isBiometricsAvailable(): Promise<boolean> {
    try {
      // On web, biometrics are not natively available
      if (typeof window !== 'undefined' && window.Capacitor === undefined) {
        console.log('Biometrics not available in web environment');
        return false;
      }
      
      // For mobile, we would check using capacitor-native-biometric
      // But we'll return false for now to avoid errors
      return false;
    } catch (error) {
      console.error('Error checking biometrics availability:', error);
      return false;
    }
  }

  async verifyIdentity(): Promise<boolean> {
    try {
      // Web fallback - always return false
      if (typeof window !== 'undefined' && window.Capacitor === undefined) {
        console.log('Biometric verification not available in web environment');
        return false;
      }
      
      // In a real mobile app, this would use the native plugin
      return false;
    } catch (error) {
      console.error('Error verifying identity with biometrics:', error);
      return false;
    }
  }

  async saveCredentials(username: string, password: string): Promise<boolean> {
    try {
      // Web fallback - always return false
      if (typeof window !== 'undefined' && window.Capacitor === undefined) {
        console.log('Saving biometric credentials not available in web environment');
        return false;
      }
      
      // In a real mobile app, this would use the native plugin
      return false;
    } catch (error) {
      console.error('Error saving credentials for biometrics:', error);
      return false;
    }
  }

  async getCredentials(): Promise<{ username: string, password: string } | null> {
    try {
      // Web fallback - always return null
      if (typeof window !== 'undefined' && window.Capacitor === undefined) {
        console.log('Getting biometric credentials not available in web environment');
        return null;
      }
      
      // In a real mobile app, this would use the native plugin
      return null;
    } catch (error) {
      console.error('Error getting credentials with biometrics:', error);
      return null;
    }
  }
}

export const BiometricService = new BiometricServiceClass();
