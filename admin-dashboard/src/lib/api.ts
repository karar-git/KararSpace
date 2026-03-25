// Use Railway backend URL in production, proxy in development
const API_BASE = import.meta.env.PROD 
  ? 'https://kararspace-production.up.railway.app/api'
  : '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return res.json();
}

// Generic CRUD operations
export const api = {
  // Projects
  getProjects: () => request<any[]>('/admin/projects'),
  createProject: (data: any) => request<any>('/admin/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => request<any>(`/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<any>(`/admin/projects/${id}`, { method: 'DELETE' }),

  // Articles
  getArticles: () => request<any[]>('/admin/articles'),
  createArticle: (data: any) => request<any>('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id: string, data: any) => request<any>(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id: string) => request<any>(`/admin/articles/${id}`, { method: 'DELETE' }),

  // Certificates
  getCertificates: () => request<any[]>('/admin/certificates'),
  createCertificate: (data: any) => request<any>('/admin/certificates', { method: 'POST', body: JSON.stringify(data) }),
  updateCertificate: (id: string, data: any) => request<any>(`/admin/certificates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCertificate: (id: string) => request<any>(`/admin/certificates/${id}`, { method: 'DELETE' }),

  // Research
  getResearch: () => request<any[]>('/admin/research'),
  createResearch: (data: any) => request<any>('/admin/research', { method: 'POST', body: JSON.stringify(data) }),
  updateResearch: (id: string, data: any) => request<any>(`/admin/research/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResearch: (id: string) => request<any>(`/admin/research/${id}`, { method: 'DELETE' }),

  // Ideas
  getIdeas: () => request<any[]>('/admin/ideas'),
  createIdea: (data: any) => request<any>('/admin/ideas', { method: 'POST', body: JSON.stringify(data) }),
  updateIdea: (id: string, data: any) => request<any>(`/admin/ideas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIdea: (id: string) => request<any>(`/admin/ideas/${id}`, { method: 'DELETE' }),

  // Life Content
  getLifeContent: () => request<any[]>('/admin/life'),
  createLifeContent: (data: any) => request<any>('/admin/life', { method: 'POST', body: JSON.stringify(data) }),
  updateLifeContent: (id: string, data: any) => request<any>(`/admin/life/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLifeContent: (id: string) => request<any>(`/admin/life/${id}`, { method: 'DELETE' }),

  // Now Focus
  getNowFocus: () => request<any[]>('/admin/now'),
  createNowFocus: (data: any) => request<any>('/admin/now', { method: 'POST', body: JSON.stringify(data) }),
  updateNowFocus: (id: string, data: any) => request<any>(`/admin/now/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNowFocus: (id: string) => request<any>(`/admin/now/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) => request<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
