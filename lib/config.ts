// Dynamic API base URL construction for different environments
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '');
    return host ? `https://${host}/api` : '/api';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_TIMEOUT = 10000; // 10 seconds