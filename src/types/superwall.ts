// types/superwall.ts
export interface SuperwallResult {
  result: 'eventNotFound' | 'noRuleMatch' | 'paywallPresented';
  message: string;
}

export interface SuperwallResponse {
  success: boolean;
}

declare global {
  interface Window {
    SuperwallPlugin: {
      register: (options: { event: string }) => Promise<SuperwallResult>;
      setUserAttributes: (options: { attributes: Record<string, any> }) => Promise<SuperwallResponse>;
      track: (options: { event: string; parameters?: Record<string, any> }) => Promise<SuperwallResponse>;
    };
  }
}
