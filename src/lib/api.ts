// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Auth API
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string }) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { username?: string; email?: string; password: string }) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email || credentials.username, // Support both username and email
        password: credentials.password,
      }),
    });
  },

  getCurrentUser: async () => {
    return makeRequest('/auth/me');
  },

  refreshToken: async () => {
    return makeRequest('/auth/refresh', { method: 'POST' });
  },
};

// Manga API
export const mangaAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; genre?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.genre) searchParams.append('genre', params.genre);
    
    const query = searchParams.toString();
    return makeRequest(`/manga${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return makeRequest(`/manga/${id}`);
  },

  getChapters: async (mangaId: string) => {
    return makeRequest(`/manga/${mangaId}/chapters`);
  },

  getChapter: async (mangaId: string, chapterId: string) => {
    return makeRequest(`/manga/${mangaId}/chapters/${chapterId}`);
  },
};

// Comments API
export const commentsAPI = {
  getComments: async (mangaId: string, chapterId?: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    const endpoint = chapterId 
      ? `/comments/${mangaId}/${chapterId}${query ? `?${query}` : ''}`
      : `/comments/${mangaId}${query ? `?${query}` : ''}`;
    
    return makeRequest(endpoint);
  },

  createComment: async (commentData: { 
    content: string; 
    mangaId: string; 
    chapterId?: string; 
    parentId?: string 
  }) => {
    return makeRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  updateComment: async (commentId: string, content: string) => {
    return makeRequest(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  deleteComment: async (commentId: string) => {
    return makeRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  likeComment: async (commentId: string) => {
    return makeRequest(`/comments/${commentId}/like`, {
      method: 'POST',
    });
  },
};

// Health check
export const healthCheck = async () => {
  return makeRequest('/health');
};

// Default export for backward compatibility
const api = {
  auth: authAPI,
  manga: mangaAPI,
  comments: commentsAPI,
  healthCheck,
};

export default api;