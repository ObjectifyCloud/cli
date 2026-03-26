import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('conf', () => ({
  default: class MockConf {
    private store: Record<string, unknown>;
    constructor(opts: { defaults?: Record<string, unknown> } = {}) {
      this.store = { ...(opts.defaults ?? {}) };
    }
    get(key: string) { return this.store[key]; }
    set(key: string, value: unknown) { this.store[key] = value; }
    delete(key: string) { delete this.store[key]; }
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('api', () => {
  it('constructs URL with path and query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: { id: '1' } }),
    });

    const { get } = await import('../src/api.js');
    await get('/v1/objects/type1/list', { limit: '10', cursor: 'abc' });

    expect(mockFetch).toHaveBeenCalledOnce();
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('/v1/objects/type1/list');
    expect(url).toContain('limit=10');
    expect(url).toContain('cursor=abc');
  });

  it('includes Authorization header when token is set', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: null }),
    });

    const { api } = await import('../src/api.js');
    await api('GET', '/health', { token: 'my-token' });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer my-token');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { get } = await import('../src/api.js');
    await expect(get('/health')).rejects.toThrow('401');
  });

  it('sends JSON body for POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: { id: 'new' } }),
    });

    const { post } = await import('../src/api.js');
    await post('/v1/objects/t1', { name: 'Test' });

    const init = mockFetch.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ name: 'Test' });
  });

  it('unwraps envelope success data into ApiResponse.data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: { id: '1', name: 'test' } }),
    });

    const { api } = await import('../src/api.js');
    const result = await api<{ id: string; name: string }>('GET', '/v1/example');

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ id: '1', name: 'test' });
  });

  it('parses nested error code and message on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: { code: 'NOT_FOUND', message: 'Object not found' } }),
    });

    const { api, ApiError } = await import('../src/api.js');
    await expect(api('GET', '/v1/objects/missing')).rejects.toSatisfy((e: unknown) => {
      return (
        e instanceof ApiError &&
        e.status === 404 &&
        e.code === 'NOT_FOUND' &&
        e.message === 'Object not found'
      );
    });
  });

  it('falls back to envelope message when nested error is absent', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Something failed' }),
    });

    const { api, ApiError } = await import('../src/api.js');
    await expect(api('GET', '/v1/broken')).rejects.toSatisfy((e: unknown) => {
      return (
        e instanceof ApiError &&
        e.status === 500 &&
        e.code === 'HTTP_ERROR' &&
        e.message === 'Something failed'
      );
    });
  });

  it('returns null data for 204 No Content with no body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { api } = await import('../src/api.js');
    const result = await api('DELETE', '/v1/resource/1');

    expect(result.ok).toBe(true);
    expect(result.status).toBe(204);
    expect(result.data).toBeNull();
  });

  it('omits undefined query params from the URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    const { get } = await import('../src/api.js');
    await get('/v1/list', { limit: '10', cursor: undefined, offset: '0' });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('limit=10');
    expect(url).toContain('offset=0');
    expect(url).not.toContain('cursor');
  });

  it('sends PATCH method via patch()', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: { updated: true } }),
    });

    const { patch } = await import('../src/api.js');
    await patch('/v1/objects/t1/o1', { name: 'Patched' });

    expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');
  });

  it('sends DELETE method via del()', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: null }),
    });

    const { del } = await import('../src/api.js');
    await del('/v1/objects/t1/o1');

    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
  });
});
