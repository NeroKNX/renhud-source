import { getUserId } from './store';

const BASE = '/api';

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export interface ChatRequest {
  message: string;
  user_id: string;
  deep: boolean;
  history: { role: string; content: string }[];
  active_skill?: string;
  files?: { name: string; type: string; data: string }[] | null;
}

export interface ChatResponse {
  text: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  model?: string;
  isDeep?: boolean;
  files?: { name: string; type: string; data: string }[];
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username: string, email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
  return request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getSessions(): Promise<Session[]> {
  const data = await request<{ sessions: Session[] }>(`/sessions?user_id=${getUserId()}`);
  return data.sessions || [];
}

export async function getSession(id: string): Promise<Session | null> {
  const data = await request<{ session: Session }>(`/sessions/${id}?user_id=${getUserId()}`);
  return data.session || null;
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  await request('/sessions/save', {
    method: 'POST',
    body: JSON.stringify({ user_id: getUserId(), sessions }),
  });
}

export async function createSession(): Promise<{ id: string }> {
  return request<{ id: string }>('/nueva_sesion', {
    method: 'POST',
    body: JSON.stringify({ user_id: getUserId() }),
  });
}

export async function deleteSession(id: string): Promise<void> {
  await request(`/sessions/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
}
