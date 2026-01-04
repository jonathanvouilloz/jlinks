// import { PUBLIC_API_URL } from '$env/static/public';
const PUBLIC_API_URL = '/api';
import type {
  Client,
  Link,
  User,
  Session,
  SocialPresetKey,
  CreateLinkInput,
  UpdateLinkInput,
  ReorderLinksInput,
  PublishStatus,
  PublishResponse,
  BackgroundType,
  LayoutType,
  ButtonStyle,
  PlanType
} from '@noko/shared/types';

// API Error class
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Base fetch wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${PUBLIC_API_URL}${endpoint}`;
  console.log('[API] Fetching:', url);

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    // Handle rate limiting (429)
    if (response.status === 429) {
      const retryAfter = response.headers.get('X-Retry-After') || response.headers.get('Retry-After');
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      throw new ApiError(
        429,
        `Trop de tentatives. Réessayez dans ${seconds} secondes.`,
        'RATE_LIMITED'
      );
    }

    let message = 'An error occurred';
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(response.status, message);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

// Auth API
export const auth = {
  async signIn(email: string, password: string): Promise<{ user: User; client: Client | null }> {
    return request('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signOut(): Promise<{ success: boolean }> {
    return request('/auth/sign-out', {
      method: 'POST',
    });
  },

  async getSession(): Promise<Session> {
    return request('/auth/session');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async deleteAccount(password: string): Promise<{ success: boolean }> {
    return request('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },

  async register(data: {
    email: string;
    password: string;
    slug: string;
    socialLinks?: Array<{
      url: string;
      title: string;
      socialPreset?: SocialPresetKey;
    }>;
  }): Promise<{ user: User; client: Client }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Client API (current user's client)
export const client = {
  async getMe(): Promise<Client> {
    return request('/clients/me');
  },

  async updateMe(data: {
    name?: string;
    bio?: string;
    meta_title?: string;
    meta_description?: string;
  }): Promise<Client> {
    return request('/clients/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateSettings(data: {
    primary_color?: string;
    secondary_color?: string;
    button_opacity?: number;
    background_type?: BackgroundType;
    background_value?: string;
    outer_background_color?: string;
    font_preset?: string | null;
    font_title?: string;
    font_text?: string;
    layout_type?: LayoutType;
    button_style?: ButtonStyle;
  }): Promise<Client> {
    return request('/clients/me/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateBranding(data: {
    logo_url?: string;
    profile_image_url?: string;
  }): Promise<Client> {
    return request('/clients/me/branding', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateVCard(data: {
    vcard_enabled?: boolean;
    vcard_name?: string;
    vcard_email?: string;
    vcard_phone?: string;
    vcard_company?: string;
    vcard_website?: string;
  }): Promise<Client> {
    return request('/clients/me/vcard', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Links API
export const links = {
  async list(): Promise<Link[]> {
    return request('/links');
  },

  async get(id: string): Promise<Link> {
    return request(`/links/${id}`);
  },

  async create(data: CreateLinkInput): Promise<Link> {
    return request('/links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateLinkInput): Promise<Link> {
    return request(`/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return request(`/links/${id}`, {
      method: 'DELETE',
    });
  },

  async reorder(order: ReorderLinksInput['order']): Promise<{ success: boolean }> {
    return request('/links/reorder', {
      method: 'PUT',
      body: JSON.stringify({ order }),
    });
  },

  async toggle(id: string): Promise<Link> {
    return request(`/links/${id}/toggle`, {
      method: 'POST',
    });
  },
};

// Publish API
export const publish = {
  async trigger(): Promise<PublishResponse> {
    return request('/publish', {
      method: 'POST',
    });
  },

  async getStatus(): Promise<PublishStatus> {
    return request('/publish/status');
  },
};

// QR Code API
export const qrcode = {
  getPreviewUrl(): string {
    return `${PUBLIC_API_URL}/qrcode/preview`;
  },

  getDownloadUrl(format: 'png' | 'svg'): string {
    return `${PUBLIC_API_URL}/qrcode/${format}`;
  },
};

// Admin API (super-admin only)
export const admin = {
  async listClients(): Promise<Client[]> {
    return request('/clients');
  },

  async getClient(id: string): Promise<Client & { links: Link[] }> {
    return request(`/clients/${id}`);
  },

  async createClient(data: {
    slug: string;
    name: string;
    email: string;
    password: string;
  }): Promise<{ client: Client; user: { id: string; email: string } }> {
    return request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateClient(id: string, data: {
    slug?: string;
    name?: string;
    plan?: PlanType;
  }): Promise<Client> {
    return request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteClient(id: string): Promise<{ success: boolean }> {
    return request(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export all API modules
export const api = {
  auth,
  client,
  links,
  publish,
  qrcode,
  admin,
};

export default api;
