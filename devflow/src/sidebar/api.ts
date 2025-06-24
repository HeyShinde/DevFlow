export const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiResponse {
  success?: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export async function callApi(endpoint: string, data: any, method: string = 'POST'): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  let finalUrl = url;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (method === 'GET' && data && Object.keys(data).length > 0) {
    // Append data as query parameters
    const params = new URLSearchParams();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        params.append(key, String(data[key]));
      }
    }
    finalUrl += `?${params.toString()}`;
  } else if (method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(finalUrl, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
} 