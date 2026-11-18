import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PassThrough } from 'node:stream';

let store: Record<string, unknown> = {};
vi.mock('conf', () => ({
  default: class MockConf {
    constructor(opts: { defaults?: Record<string, unknown> } = {}) {
      store = { ...(opts.defaults ?? {}), ...store };
    }
    get(key: string) {
      return store[key];
    }
    set(key: string, value: unknown) {
      store[key] = value;
    }
    delete(key: string) {
      delete store[key];
    }
  },
}));
vi.mock('ora', () => ({
  default: () => {
    const s = { start: () => s, stop: () => s };
    return s;
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const ok = (data: unknown, status = 200) => new Response(JSON.stringify({ success: true, data }), { status });
const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message } }), { status });
const sentBody = (i = 0) => JSON.parse(mockFetch.mock.calls[i][1].body);

let logs: string[];
let errors: string[];

beforeEach(() => {
  vi.resetModules();
  mockFetch.mockReset();
  store = { baseUrl: 'http://api.test', token: 't', tokenType: 'admin_key' };
  logs = [];
  errors = [];
  vi.spyOn(console, 'log').mockImplementation((...a) => void logs.push(a.join(' ')));
  vi.spyOn(console, 'error').mockImplementation((...a) => void errors.push(a.join(' ')));
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = 0;
});

describe('logout', () => {
  it('clears the stored token (used to throw "require is not defined" in ESM)', async () => {
    const { logoutCmd } = await import('../src/commands/login.js');
    await logoutCmd.parseAsync([], { from: 'user' });
    expect(store.token).toBeUndefined();
    expect(store.tokenType).toBeUndefined();
    expect(logs.join('\n')).toContain('Logged out.');
  });
});

describe('promptHidden', () => {
  it('resolves when the password and newline arrive in one chunk (pipe or paste)', async () => {
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const { promptHidden } = await import('../src/commands/login.js');
    const input = new PassThrough();
    const p = promptHidden('Password: ', input as unknown as NodeJS.ReadStream);
    input.write('s3cr=t\r\n');
    await expect(p).resolves.toBe('s3cr=t');
  });

  it('resolves when stdin ends without a newline', async () => {
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const { promptHidden } = await import('../src/commands/login.js');
    const input = new PassThrough();
    const p = promptHidden('Password: ', input as unknown as NodeJS.ReadStream);
    input.end('abc');
    await expect(p).resolves.toBe('abc');
  });

  it('resumes stdin that the email prompt (readline close) left paused', async () => {
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const { promptHidden } = await import('../src/commands/login.js');
    const input = new PassThrough();
    input.pause();
    const p = promptHidden('Password: ', input as unknown as NodeJS.ReadStream);
    input.write('pw\n');
    await expect(p).resolves.toBe('pw');
  });
});

describe('objects', () => {
  it('search --filter sends property_id and keeps "=" inside the value', async () => {
    mockFetch.mockResolvedValueOnce(ok({ results: [{ object_id: 'o1', created_at: 'c1' }], next_cursor: null }));
    const { objectsCmd } = await import('../src/commands/objects.js');
    await objectsCmd.parseAsync(['search', 'type1', '--filter', 'formula=a=b'], { from: 'user' });
    expect(sentBody().filters).toEqual([{ property_id: 'formula', operator: 'eq', value: 'a=b' }]);
    expect(logs.join('\n')).toContain('o1');
  });

  it('list renders a table from data.results', async () => {
    mockFetch.mockResolvedValueOnce(ok({ results: [{ object_id: 'o9', created_at: 'c', updated_at: 'u' }] }));
    const { objectsCmd } = await import('../src/commands/objects.js');
    await objectsCmd.parseAsync(['list', 'type1'], { from: 'user' });
    expect(logs.some((l) => l.startsWith('o9'))).toBe(true);
  });
});

describe('tables over object-shaped list responses', () => {
  it('tenants list reads data.tenants', async () => {
    mockFetch.mockResolvedValueOnce(ok({ tenants: [{ tenant_id: 'demo-company', plan_tier: 'pro' }], total: 1 }));
    const { tenantsCmd } = await import('../src/commands/tenants.js');
    await tenantsCmd.parseAsync(['list'], { from: 'user' });
    expect(logs.some((l) => l.startsWith('demo-company'))).toBe(true);
  });

  it('files list reads data.results', async () => {
    mockFetch.mockResolvedValueOnce(ok({ results: [{ file_id: 'f1', filename: 'a.txt' }], next_cursor: null }));
    const { filesCmd } = await import('../src/commands/files.js');
    await filesCmd.parseAsync(['list'], { from: 'user' });
    expect(logs.join('\n')).not.toContain('No results.');
    expect(logs.some((l) => l.startsWith('f1'))).toBe(true);
  });
});

describe('keys create', () => {
  it('prints the key id and the one-time token from {key, token}', async () => {
    mockFetch.mockResolvedValueOnce(ok({ key: { key_id: 'key_1' }, token: 'obj_tok' }, 201));
    const { keysCmd } = await import('../src/commands/keys.js');
    await keysCmd.parseAsync(['create', '--tenant', 'demo', '--name', 'n'], { from: 'user' });
    const out = logs.join('\n');
    expect(out).toContain('key_1');
    expect(out).toContain('obj_tok');
    expect(out).not.toContain('undefined');
  });
});

describe('tenants create', () => {
  it('posts only tenant_id and prints the new tenant and its API key', async () => {
    mockFetch.mockResolvedValueOnce(ok({ route: { tenant_id: 'acme' }, api_key: 'obj_new' }, 201));
    const { tenantsCmd } = await import('../src/commands/tenants.js');
    await tenantsCmd.parseAsync(['create', '--tenant-id', 'acme'], { from: 'user' });
    expect(mockFetch.mock.calls[0][0]).toBe('http://api.test/admin/tenants');
    expect(sentBody()).toEqual({ tenant_id: 'acme' });
    const out = logs.join('\n');
    expect(out).toContain('acme');
    expect(out).toContain('obj_new');
  });
});

describe('exit code', () => {
  it('is non-zero after an API error', async () => {
    mockFetch.mockResolvedValueOnce(fail(404, 'Object x not found'));
    const { objectsCmd } = await import('../src/commands/objects.js');
    await objectsCmd.parseAsync(['get', 'type1', 'x'], { from: 'user' });
    expect(errors.join('\n')).toContain('not found');
    expect(process.exitCode).toBe(1);
  });

  it('is non-zero for an unknown config key', async () => {
    const { configCmd } = await import('../src/commands/config.js');
    await configCmd.parseAsync(['get', 'nope'], { from: 'user' });
    expect(process.exitCode).toBe(1);
  });
});
