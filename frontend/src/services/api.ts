const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('dairyflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const data = await res.json();
      errMessage = data.error || data.message || errMessage;
    } catch {
      errMessage = res.status === 500
        ? 'Internal Server Error (500). Please check backend server logs.'
        : `${res.status} ${res.statusText || 'Error'}`.trim();
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  async get<T>(url: string): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<T>(res);
  },

  async post<T>(url: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    return handleResponse<T>(res);
  },

  async put<T>(url: string, body: any): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse<T>(res);
  },

  async delete<T>(url: string): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<T>(res);
  },

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const token = localStorage.getItem('dairyflow_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    return handleResponse<{ url: string; filename: string }>(res);
  }
};
