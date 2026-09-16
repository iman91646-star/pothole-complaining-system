import { User, Complaint, ComplaintHistory, Notification, UserStats, AdminStats } from '../types';

const TOKEN_KEY = 'potholetrack_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || (typeof data === 'string' ? data : 'An error occurred');
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string; confirmPassword: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminLogin: (payload: { adminEmail: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  // Citizen complaints
  getUserComplaints: () =>
    request<{ complaints: Complaint[]; stats: UserStats }>('/api/user/complaints'),

  createComplaint: (payload: {
    location: string;
    area: string;
    city: string;
    landmark?: string;
    category: string;
    severity: string;
    description: string;
    imageUrl?: string | null;
  }) =>
    request<{ message: string; complaintId: string; complaint: Complaint }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getComplaintDetails: (idOrComplaintId: string) =>
    request<{ complaint: Complaint; history: ComplaintHistory[] }>(`/api/complaints/${idOrComplaintId}`),

  // Notifications
  getNotifications: () =>
    request<{ notifications: Notification[] }>('/api/user/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/user/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/user/notifications/read-all', {
      method: 'POST',
    }),

  // Admin endpoints
  getAdminComplaints: (params?: {
    search?: string;
    status?: string;
    severity?: string;
    priority?: string;
    category?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') searchParams.append(k, v);
      });
    }
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ complaints: Complaint[]; stats: AdminStats }>(`/api/admin/complaints${qs}`);
  },

  updateAdminComplaint: (
    idOrComplaintId: string,
    payload: {
      status?: string;
      priority?: string;
      adminResponse?: string;
    }
  ) =>
    request<{ message: string; complaint: Complaint; history: ComplaintHistory[] }>(
      `/api/admin/complaints/${idOrComplaintId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    ),
};
