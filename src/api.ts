import { createObjectifyClient, ApiError } from '@objectify/sdk';
import type { ObjectifyClient } from '@objectify/sdk';
import { getBaseUrl, getToken } from './config.js';

export { ApiError };
export type { ObjectifyClient };

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

let _client: ObjectifyClient | null = null;

export function getClient(): ObjectifyClient {
  if (!_client) {
    _client = createObjectifyClient({
      baseUrl: getBaseUrl(),
      bearerToken: getToken() ?? undefined,
      maxRetries: 0,
    });
  }
  return _client;
}

export function resetClient(): void {
  _client = null;
}

export async function api<T = unknown>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    baseUrl?: string;
    token?: string;
  },
): Promise<ApiResponse<T>> {
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

  const init: RequestInit = { method, headers, signal: AbortSignal.timeout(30_000) };
  if (options?.body !== undefined) init.body = JSON.stringify(options.body);

  const res = await fetch(url, init);
  const json = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const envelope = json as Record<string, unknown> | null;
    const err = (typeof envelope?.error === 'object' && envelope?.error !== null ? envelope.error : {}) as Record<
      string,
      string
    >;
    const code = err.code || 'HTTP_ERROR';
    const message = err.message || (envelope?.message as string) || `HTTP ${res.status}`;
    throw new ApiError(res.status, code, message);
  }

  const envelope = json as { success?: boolean; data?: T } | null;
  const data = (envelope?.data !== undefined ? envelope.data : json) as T;
  return { ok: true, status: res.status, data };
}

export const get = <T = unknown>(path: string, query?: Record<string, string | number | undefined>) =>
  api<T>('GET', path, { query });
export const post = <T = unknown>(path: string, body?: unknown) => api<T>('POST', path, { body });
export const patch = <T = unknown>(path: string, body?: unknown) => api<T>('PATCH', path, { body });
export const del = <T = unknown>(path: string) => api<T>('DELETE', path);
