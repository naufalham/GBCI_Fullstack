const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async register(data: { email: string; username: string; password: string }) {
    return this.request<{ message: string }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; username: string; password: string }) {
    const result = await this.request<{ access_token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
    }
    return result;
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Profile
  async getProfile() {
    return this.request<any>('/api/getProfile');
  }

  async createProfile(data: any) {
    return this.request<any>('/api/createProfile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(data: any) {
    return this.request<any>('/api/updateProfile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Chat
  async sendMessage(data: { receiverId: string; content: string }) {
    return this.request<any>('/api/sendMessage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async viewMessages(receiverId: string, page = 1, limit = 50) {
    return this.request<{ messages: any[]; total: number; page: number }>(
      `/api/viewMessages?receiverId=${receiverId}&page=${page}&limit=${limit}`,
    );
  }

  async getConversations() {
    return this.request<any[]>('/api/conversations');
  }
}

export const api = new ApiClient(API_BASE);
