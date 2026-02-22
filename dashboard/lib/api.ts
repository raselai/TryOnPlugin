const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface ApiError {
  error: string;
  code: string;
}

class ApiClient {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== "undefined") {
      localStorage.setItem("tryon_api_key", key);
    }
  }

  getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    if (typeof window !== "undefined") {
      this.apiKey = localStorage.getItem("tryon_api_key");
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("tryon_api_key");
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const apiKey = this.getApiKey();
    if (apiKey) {
      headers["x-tryon-api-key"] = apiKey;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}`,
        code: `HTTP_${response.status}`,
      }));
      throw new Error(error.error);
    }

    return response.json();
  }

  // Store endpoints
  async createStore(data: {
    name: string;
    email: string;
    domain: string;
  }) {
    return this.request<{
      store: {
        id: string;
        name: string;
        email: string;
        domain: string;
        planId: string;
        monthlyQuota: number;
      };
      apiKey: {
        id: string;
        key: string;
        prefix: string;
        name: string;
      };
      embedCode: string;
    }>("/api/stores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStore() {
    return this.request<{
      id: string;
      name: string;
      email: string;
      domain: string;
      allowedDomains: string[];
      planId: string;
      planName: string;
      monthlyQuota: number;
      usedQuota: number;
      quotaResetAt: string;
      status: string;
      createdAt: string;
    }>("/api/stores/me");
  }

  async updateStore(data: {
    name?: string;
    domain?: string;
    allowedDomains?: string[];
  }) {
    return this.request<{
      id: string;
      name: string;
      domain: string;
      allowedDomains: string[];
    }>("/api/stores/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // API Keys endpoints
  async getApiKeys() {
    return this.request<{
      apiKeys: Array<{
        id: string;
        keyPrefix: string;
        name: string;
        isActive: boolean;
        lastUsedAt: string | null;
        createdAt: string;
      }>;
    }>("/api/stores/me/api-keys");
  }

  async createApiKey(name?: string) {
    return this.request<{
      id: string;
      key: string;
      prefix: string;
      name: string;
    }>("/api/stores/me/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async revokeApiKey(keyId: string) {
    return this.request<{ success: boolean }>(
      `/api/stores/me/api-keys/${keyId}`,
      { method: "DELETE" }
    );
  }

  // Usage endpoints
  async getUsage() {
    return this.request<{
      summary: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        byEventType: Record<string, number>;
        byStatus: Record<string, number>;
      };
      daily: Array<{ date: string; count: number }>;
    }>("/api/stores/me/usage");
  }

  async getEmbedCode() {
    return this.request<{
      embedCode: string;
      note: string;
    }>("/api/stores/me/embed-code");
  }

  // Billing endpoints
  async getPlans() {
    return this.request<{
      plans: Array<{
        id: string;
        name: string;
        priceMonthly: number;
        monthlyQuota: number;
        requestsPerMin: number;
        overagePrice: number;
      }>;
    }>("/api/billing/plans");
  }

  async createCheckout(planId: string, successUrl: string, cancelUrl: string) {
    return this.request<{ url: string }>("/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ planId, successUrl, cancelUrl }),
    });
  }

  async getBillingPortal(returnUrl: string) {
    return this.request<{ url: string }>("/api/billing/portal", {
      method: "POST",
      body: JSON.stringify({ returnUrl }),
    });
  }

  async getSubscription() {
    return this.request<{
      planId: string;
      planName: string;
      status: string;
      monthlyQuota: number;
      usedQuota: number;
      quotaResetAt: string;
      subscription: {
        planId: string;
        status: string;
        currentPeriodEnd?: string;
        cancelAtPeriodEnd?: boolean;
      } | null;
    }>("/api/billing/subscription");
  }

  async getBillingUsage() {
    return this.request<{
      periodStart: string;
      periodEnd: string;
      quota: {
        limit: number;
        used: number;
        remaining: number;
      };
      overage: {
        count: number;
        pricePerUnit: number;
        estimatedCost: number;
      };
    }>("/api/billing/usage");
  }
}

export const api = new ApiClient();
