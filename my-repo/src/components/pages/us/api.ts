const API_ROOT =
  import.meta.env.PUBLIC_API_URL || 'https://kararspace-production.up.railway.app/api';
const BASE = `${API_ROOT}/us`;
const TOKEN_KEY = 'us:token';

export interface Note {
  id: string;
  body: string;
  photoUrl: string | null;
  spinLabel: string | null;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
}

export interface Settings {
  nameOne: string;
  nameTwo: string;
  anniversary: string | null;
  nextDate: string | null;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode — the session just will not stick */
  }
}

export class LockedError extends Error {
  constructor() {
    super('Locked');
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && typeof init.body === 'string') headers.set('Content-Type', 'application/json');

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    setToken(null);
    throw new LockedError();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || 'Something went wrong');
  return data as T;
}

export async function unlock(password: string): Promise<void> {
  const res = await fetch(`${BASE}/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || 'that is not it');
  setToken((data as { token: string }).token);
}

export const checkSession = () => request<{ ok: true }>('/session');

export const listNotes = () => request<Note[]>('/notes');

export const addNote = (input: { body: string; photoUrl?: string | null }) =>
  request<Note>('/notes', { method: 'POST', body: JSON.stringify(input) });

export const updateNote = (
  id: string,
  input: Partial<Pick<Note, 'done' | 'body' | 'spinLabel' | 'photoUrl'>>
) => request<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteNote = (id: string) =>
  request<{ success: true }>(`/notes/${id}`, { method: 'DELETE' });

export const getSettings = () => request<Settings>('/settings');

export const saveSettings = (input: Settings) =>
  request<Settings>('/settings', { method: 'PUT', body: JSON.stringify(input) });

export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('photo', file);
  const data = await request<{ url: string }>('/photo', { method: 'POST', body: form });
  return data.url;
}
