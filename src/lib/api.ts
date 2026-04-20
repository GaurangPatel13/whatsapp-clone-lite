const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    const h = options.headers as Record<string, string>;
    Object.assign(headers, h);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export const login = (email: string, password: string) =>
  fetchAPI<{ token: string; user: any }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (email: string, password: string, displayName: string) =>
  fetchAPI<{ token: string; user: any }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });

export const getMe = (token: string) =>
  fetchAPI<any>('/api/auth/me', { token });

// Users
export const getUsers = (token: string) =>
  fetchAPI<any[]>('/api/users', { token });

export const getUser = (token: string, userId: string) =>
  fetchAPI<any>(`/api/users/${userId}`, { token });

// Conversations
export const getConversations = (token: string) =>
  fetchAPI<any[]>('/api/conversations', { token });

export const getConversation = (token: string, conversationId: string) =>
  fetchAPI<any>(`/api/conversations/${conversationId}`, { token });

export const createConversation = (token: string, participantId: string) =>
  fetchAPI<any>('/api/conversations', {
    method: 'POST',
    token,
    body: JSON.stringify({ participantId }),
  });

// Messages
export const getMessages = (token: string, conversationId: string) =>
  fetchAPI<any[]>(`/api/messages/${conversationId}`, { token });

export const markMessageRead = (token: string, messageId: string) =>
  fetchAPI<any>(`/api/messages/${messageId}/read`, {
    method: 'PUT',
    token,
  });
