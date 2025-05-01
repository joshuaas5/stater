
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';

export interface BiometricCredentials {
  username: string;
  password: string;
}

export class BiometricService {
  private static readonly SERVER_KEY = 'sprout.app.biometric';

  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  static async getBiometryType(): Promise<BiometryType | null> {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.biometryType;
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  }

  static async saveCredentials(username: string, password: string): Promise<boolean> {
    try {
      await NativeBiometric.setCredentials({
        username,
        password,
        server: this.SERVER_KEY,
      });
      return true;
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
      return false;
    }
  }

  static async getCredentials(): Promise<BiometricCredentials | null> {
    try {
      const result = await NativeBiometric.getCredentials({
        server: this.SERVER_KEY,
      });
      
      return {
        username: result.username,
        password: result.password,
      };
    } catch (error) {
      console.error('Error retrieving biometric credentials:', error);
      return null;
    }
  }

  static async deleteCredentials(): Promise<boolean> {
    try {
      await NativeBiometric.deleteCredentials({
        server: this.SERVER_KEY,
      });
      return true;
    } catch (error) {
      console.error('Error deleting biometric credentials:', error);
      return false;
    }
  }

  static async verifyIdentity(): Promise<boolean> {
    try {
      const result = await NativeBiometric.verifyIdentity({
        reason: "Para fazer login no Sprout",
        title: "Autenticação Biométrica",
        subtitle: "Use sua biometria para acessar o aplicativo",
        description: "Este aplicativo está usando autenticação biométrica para proteger seus dados",
      });
      return result.verified;
    } catch (error) {
      console.error('Biometric verification failed:', error);
      return false;
    }
  }
}
