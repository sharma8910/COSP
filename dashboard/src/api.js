const API_BASE = import.meta.env.VITE_API_URL||'http://localhost:4000';

export async function apiFetch(path, details = {}) {
 const url = `${API_BASE}${path}`;

 const response = await fetch(url, {
  ...details,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    ...details.headers,
  }
 });

 if (!response.ok) {
  const error = await response.json().catch(() => ({}));
  throw new Error(error.error || `request failed: ${response.status}`);
 }
 if (response.status === 204) return null;

 return response.json();
}