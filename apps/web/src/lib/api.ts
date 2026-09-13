const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('ebike_token');
  }

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization' as keyof HeadersInit]) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type' as keyof HeadersInit]) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        ...data,
      };
    }

    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    return {
      success: false,
      message: err.message || 'Unable to connect to government portal service',
    };
  }
}
