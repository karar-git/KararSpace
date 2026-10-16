const API_ROOT =
  import.meta.env.PUBLIC_API_URL || 'https://kararspace-production.up.railway.app/api';
const BASE = `${API_ROOT}/us`;
const TOKEN_KEY = 'us:token';

export type Theme = 'deck' | 'someday' | 'places' | 'ritual' | 'dates';

export interface NoteList {
  id: string;
  name: string;
  position: number;
  theme: Theme;
  createdAt: string;
}

export interface Note {
  id: string;
  listId: string | null;
  body: string;
  photoUrl: string | null;
  spinLabel: string | null;
  done: boolean;
  doneAt: string | null;
  position: number;
  mapX: number | null;
  mapY: number | null;
  createdAt: string;
}

export interface Settings {
  nameOne: string;
  nameTwo: string;
  anniversary: string | null;
  nextDate: string | null;
}

export type PhotoViewer = 'stack' | 'film' | 'polaroids';
export type DateView = 'thread' | 'book' | 'calendar';

export interface Views {
  photoViewer: PhotoViewer | null;
  dateView: DateView | null;
}

export type Author = 'karar' | 'dania';
export type Category = 'fun' | 'romantic' | 'food' | 'place';
export type Scores = Record<Category, number>;

export interface DatePhoto {
  id?: string;
  url: string;
  caption: string | null;
}

export interface UsDate {
  id: string;
  place: string;
  date: string | null;
  position: number;
  numbered: boolean;
  /** The diary note it was copied from, if any */
  sourceNoteId: string | null;
  photos: DatePhoto[];
  notes: { author: Author; body: string; updatedAt: string }[];
  ratings: { author: Author; category: Category; score: number }[];
  createdAt: string;
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

export const addNote = (input: { body: string; photoUrl?: string | null; listId?: string | null }) =>
  request<Note>('/notes', { method: 'POST', body: JSON.stringify(input) });

export const updateNote = (
  id: string,
  input: Partial<Pick<Note, 'done' | 'body' | 'spinLabel' | 'photoUrl' | 'listId' | 'mapX' | 'mapY'>>
) => request<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const reorderNotes = (listId: string, ids: string[]) =>
  request<{ success: true }>('/notes/order', {
    method: 'PUT',
    body: JSON.stringify({ listId, ids }),
  });

export const deleteNote = (id: string) =>
  request<{ success: true }>(`/notes/${id}`, { method: 'DELETE' });

// Hands back a fresh token, so this device stays unlocked and the other one
// gets asked for the new word
export async function changePassword(current: string, next: string): Promise<void> {
  const data = await request<{ token: string }>('/password', {
    method: 'PUT',
    body: JSON.stringify({ current, next }),
  });
  setToken(data.token);
}

export const listLists = () => request<NoteList[]>('/lists');

export const addList = (name: string) =>
  request<NoteList>('/lists', { method: 'POST', body: JSON.stringify({ name }) });

export const updateList = (id: string, input: { name?: string; theme?: Theme }) =>
  request<NoteList>(`/lists/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const reorderLists = (ids: string[]) =>
  request<NoteList[]>('/lists/order', { method: 'PUT', body: JSON.stringify({ ids }) });

export const deleteList = (id: string) =>
  request<{ success: true }>(`/lists/${id}`, { method: 'DELETE' });

export const getSettings = () => request<Settings & Views>('/settings');

export const saveViews = (input: Partial<Views>) =>
  request<Partial<Views>>('/settings/views', { method: 'PUT', body: JSON.stringify(input) });

export const saveSettings = (input: Settings) =>
  request<Settings>('/settings', { method: 'PUT', body: JSON.stringify(input) });

// Photos come back as a path under the API; older ones may be absolute
export function photoSrc(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${BASE}${url.replace(/^\/us/, '')}`;
}

export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('photo', file);
  const data = await request<{ url: string }>('/photo', { method: 'POST', body: form });
  return data.url;
}

// ---- our dates ----------------------------------------------------------

export const listDates = () => request<UsDate[]>('/dates');

export const addDate = (input: { place: string; date: string | null }) =>
  request<UsDate>('/dates', { method: 'POST', body: JSON.stringify(input) });

export const updateDate = (
  id: string,
  input: Partial<{ place: string; date: string | null; numbered: boolean }>
) => request<UsDate>(`/dates/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteDate = (id: string) =>
  request<{ success: true }>(`/dates/${id}`, { method: 'DELETE' });

/** `placed`: a question-mark date that was just dragged into the thread */
export const reorderDates = (ids: string[], placed?: string) =>
  request<UsDate[]>('/dates/order', { method: 'PUT', body: JSON.stringify({ ids, placed }) });

export const saveDatePhotos = (id: string, photos: DatePhoto[]) =>
  request<UsDate>(`/dates/${id}/photos`, { method: 'PUT', body: JSON.stringify({ photos }) });

export const saveDateNote = (id: string, author: Author, body: string) =>
  request<UsDate>(`/dates/${id}/notes/${author}`, {
    method: 'PUT',
    body: JSON.stringify({ body }),
  });

export const saveDateRatings = (id: string, author: Author, scores: Partial<Scores>) =>
  request<UsDate>(`/dates/${id}/ratings/${author}`, {
    method: 'PUT',
    body: JSON.stringify(scores),
  });

/** Copies a notes list that was used as a diary into real dates. The notes stay. */
export const importDates = (listId: string) =>
  request<{ added: number; dates: UsDate[] }>('/dates/import', {
    method: 'POST',
    body: JSON.stringify({ listId }),
  });
