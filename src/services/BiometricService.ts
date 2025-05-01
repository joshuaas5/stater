
import { NativeBiometric } from 'capacitor-native-biometric';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/utils/localStorage';

class BiometricServiceClass {
  async isBiometricsAvailable(): Promise<boolean> {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      console.error('Error checking biometrics availability:', error);
      return false;
    }
  }

  async saveCredentials(email: string, password: string): Promise<boolean> {
    try {
      const user = getCurrentUser();
      if (!user) return false;

      const result = await NativeBiometric.setCredentials({
        username: email,
        password: password,
        server: 'https://sprout-finance-app.com',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
      return false;
    }
  }

  async deleteCredentials(): Promise<boolean> {
    try {
      await NativeBiometric.deleteCredentials({
        server: 'https://sprout-finance-app.com',
      });
      return true;
    } catch (error) {
      console.error('Error deleting biometric credentials:', error);
      return false;
    }
  }

  async getCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await NativeBiometric.getCredentials({
        server: 'https://sprout-finance-app.com',
      });
      
      return {
        username: credentials.username,
        password: credentials.password,
      };
    } catch (error) {
      console.error('Error retrieving biometric credentials:', error);
      return null;
    }
  }

  async verifyIdentity(): Promise<boolean> {
    try {
      // The NativeBiometric.verifyIdentity returns an object with a verified property
      const result: { verified: boolean } = await NativeBiometric.verifyIdentity({
        reason: "Para acessar sua conta",
        title: "Autenticação Biométrica",
        subtitle: "Use sua biometria para acessar o aplicativo",
        description: "Autenticação com biometria para acesso seguro"
      }) as { verified: boolean };
      
      return result?.verified === true;
    } catch (error) {
      console.error('Error verifying biometric identity:', error);
      return false;
    }
  }
}

export const BiometricService = new BiometricServiceClass();
