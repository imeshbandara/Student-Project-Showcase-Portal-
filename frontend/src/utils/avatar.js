const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getAvatarUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}
