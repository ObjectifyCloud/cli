import { describe, it, expect, beforeEach, vi } from 'vitest';

let store: Record<string, unknown> = {};

vi.mock('conf', () => {
  return {
    default: class MockConf {
      private defaults: Record<string, unknown>;
      constructor(opts: { defaults?: Record<string, unknown> } = {}) {
        this.defaults = opts.defaults ?? {};
        store = { ...this.defaults };
      }
      get(key: string) {
        return store[key] ?? this.defaults[key];
      }
      set(key: string, value: unknown) {
        store[key] = value;
      }
      delete(key: string) {
        delete store[key];
      }
    },
  };
});

beforeEach(() => {
  store = {};
  vi.resetModules();
});

describe('config', () => {
  it('returns default base URL', async () => {
    const { getBaseUrl } = await import('../src/config.js');
    expect(getBaseUrl()).toBe('https://api.objectify.cloud');
  });

  it('sets and gets base URL', async () => {
    const { getBaseUrl, setBaseUrl } = await import('../src/config.js');
    setBaseUrl('http://localhost:8787');
    expect(getBaseUrl()).toBe('http://localhost:8787');
  });

  it('stores and retrieves token', async () => {
    const { getToken, setToken } = await import('../src/config.js');
    expect(getToken()).toBeUndefined();
    setToken('tok_abc', 'api_key');
    expect(getToken()).toBe('tok_abc');
  });

  it('clears token', async () => {
    const { getToken, setToken, clearToken } = await import('../src/config.js');
    setToken('tok_abc', 'jwt');
    clearToken();
    expect(getToken()).toBeUndefined();
  });

  it('manages active tenant', async () => {
    const { getActiveTenant, setActiveTenant } = await import('../src/config.js');
    expect(getActiveTenant()).toBeUndefined();
    setActiveTenant('t_123');
    expect(getActiveTenant()).toBe('t_123');
  });

  it('returns full auth info', async () => {
    const { getAuthInfo, setToken, setActiveTenant } = await import('../src/config.js');
    setToken('tok_x', 'admin_key');
    setActiveTenant('t_456');
    const info = getAuthInfo();
    expect(info.baseUrl).toBe('https://api.objectify.cloud');
    expect(info.token).toBe('tok_x');
    expect(info.tokenType).toBe('admin_key');
    expect(info.activeTenant).toBe('t_456');
  });
});
