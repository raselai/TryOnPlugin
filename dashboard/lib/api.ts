const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

class ApiClient {
  private adminSecret: string | null = null;

  setAdminSecret(secret: string) {
    this.adminSecret = secret;
    if (typeof window !== "undefined") {
      localStorage.setItem("mhp_admin_secret", secret);
    }
  }

  getAdminSecret(): string | null {
    if (this.adminSecret) return this.adminSecret;
    if (typeof window !== "undefined") {
      this.adminSecret = localStorage.getItem("mhp_admin_secret");
    }
    return this.adminSecret;
  }

  clearAdminSecret() {
    this.adminSecret = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("mhp_admin_secret");
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const secret = this.getAdminSecret();
    if (secret) {
      headers["x-admin-secret"] = secret;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}`,
      }));
      throw new Error(error.error);
    }

    return response.json();
  }

  // Admin login verification
  async verifyAdmin() {
    return this.request<{ ok: boolean }>("/api/admin/login", { method: "POST" });
  }

  // --- Shade endpoints ---
  async getAdminShades() {
    return this.request<{ shades: any[] }>("/api/admin/shades");
  }

  async createShade(data: { name: string; hexColor: string; displayOrder?: number; shopifyVariantId?: string }) {
    return this.request<{ shade: any }>("/api/admin/shades", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateShade(id: string, data: any) {
    return this.request<{ shade: any }>(`/api/admin/shades/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteShade(id: string) {
    return this.request<{ success: boolean }>(`/api/admin/shades/${id}`, {
      method: "DELETE",
    });
  }

  // --- Length endpoints ---
  async getAdminLengths() {
    return this.request<{ lengths: any[] }>("/api/admin/lengths");
  }

  async createLength(data: { label: string; inches: number; bodyLandmark: string; displayOrder?: number }) {
    return this.request<{ length: any }>("/api/admin/lengths", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLength(id: string, data: any) {
    return this.request<{ length: any }>(`/api/admin/lengths/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteLength(id: string) {
    return this.request<{ success: boolean }>(`/api/admin/lengths/${id}`, {
      method: "DELETE",
    });
  }

  // --- Texture endpoints ---
  async getAdminTextures() {
    return this.request<{ textures: any[] }>("/api/admin/textures");
  }

  async createTexture(data: { name: string; displayOrder?: number }) {
    return this.request<{ texture: any }>("/api/admin/textures", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTexture(id: string, data: any) {
    return this.request<{ texture: any }>(`/api/admin/textures/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTexture(id: string) {
    return this.request<{ success: boolean }>(`/api/admin/textures/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
