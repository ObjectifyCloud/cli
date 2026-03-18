import { getBaseUrl, getToken } from './config.js';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export async function api<T = unknown>(method: string, path: string, options?: {
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  baseUrl?: string;
  token?: string;
}): Promise<ApiResponse<T>> {
  const base = (options?.baseUrl || getBaseUrl()).replace(/\/$/, '');
  let url = `${base}${path}`;

  if (options?.query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined) params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = options?.token || getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init: RequestInit = { method, headers };
  if (options?.body !== undefined) init.body = JSON.stringify(options.body);

  const res = await fetch(url, init);
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const msg = (data as Record<string, string>)?.message || (data as Record<string, string>)?.error || `HTTP ${res.status}`;
    throw new Error(`${res.status}: ${msg}`);
  }

  return { ok: true, status: res.status, data: data as T };
}

export const get = <T = unknown>(path: string, query?: Record<string, string | number | undefined>) => api<T>('GET', path, { query });
export const post = <T = unknown>(path: string, body?: unknown) => api<T>('POST', path, { body });
export const patch = <T = unknown>(path: string, body?: unknown) => api<T>('PATCH', path, { body });
export const del = <T = unknown>(path: string) => api<T>('DELETE', path);
