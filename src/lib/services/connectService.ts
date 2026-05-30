import { apiFetch } from './apiFetch.js';
import type { StripeConnectStatus } from '../constants/marketplace.js';

export interface ConnectStatusResponse {
  status: StripeConnectStatus;
  accountId: string | null;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  devMode?: boolean;
}

export class ConnectService {
  static async startOnboarding(opts: {
    country?: string;
    refreshUrl?: string;
    returnUrl?: string;
  } = {}): Promise<{ url: string | null; accountId?: string }> {
    return apiFetch('/api/connect/onboard', { method: 'POST', body: opts });
  }

  static async getStatus(): Promise<ConnectStatusResponse> {
    return apiFetch('/api/connect/status');
  }

  static async getDashboardLink(): Promise<{ url: string | null }> {
    return apiFetch('/api/connect/dashboard-link', { method: 'POST', body: {} });
  }
}
