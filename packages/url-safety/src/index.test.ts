import { lookup } from 'dns/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assertSafeHttpUrl, normalizeHttpUrl, safeFetch, UnsafeUrlError } from './index';

vi.mock('dns/promises', () => ({
  lookup: vi.fn(),
}));

const lookupMock = vi.mocked(lookup);

function mockLookupAddresses(addresses: Array<{ address: string; family: 4 | 6 }>) {
  lookupMock.mockResolvedValue(addresses as never);
}

describe('normalizeHttpUrl', () => {
  it('normalizes HTTP URLs and strips fragments', () => {
    expect(normalizeHttpUrl(' HTTPS://Example.com/path#token ')).toBe('https://example.com/path');
  });

  it('rejects non-HTTP protocols', () => {
    expect(() => normalizeHttpUrl('file:///tmp/secret')).toThrow('Only HTTP and HTTPS URLs are supported');
  });

  it('rejects URL credentials', () => {
    expect(() => normalizeHttpUrl('https://user:pass@example.com')).toThrow('URL credentials are not allowed');
  });
});

describe('assertSafeHttpUrl', () => {
  beforeEach(() => {
    mockLookupAddresses([{ address: '93.184.216.34', family: 4 }]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('allows public DNS results', async () => {
    await expect(assertSafeHttpUrl('https://example.com')).resolves.toBe('https://example.com/');
  });

  it.each([
    'http://localhost',
    'http://service.localhost',
    'http://printer.local',
    'http://127.0.0.1',
    'http://10.0.0.1',
    'http://172.16.0.1',
    'http://192.168.0.1',
    'http://169.254.169.254',
    'http://[::1]',
    'http://[fc00::1]',
    'http://[fe80::1]',
    'http://[::ffff:127.0.0.1]',
  ])('blocks private or local target %s', async (url) => {
    await expect(assertSafeHttpUrl(url)).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it('blocks hostnames that resolve to private addresses', async () => {
    mockLookupAddresses([{ address: '192.168.1.10', family: 4 }]);

    await expect(assertSafeHttpUrl('https://internal.example.com')).rejects.toThrow(
      'Private, local, or reserved network addresses are not allowed',
    );
  });
});

describe('safeFetch', () => {
  const abortController = new AbortController();

  beforeEach(() => {
    mockLookupAddresses([{ address: '93.184.216.34', family: 4 }]);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns a successful public response', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('ok', { status: 200 }));

    await expect(
      safeFetch('https://example.com', {
        method: 'GET',
        timeoutMs: 1000,
        signal: abortController.signal,
      }),
    ).resolves.toEqual({ status: 200, url: 'https://example.com/' });
  });

  it('blocks redirects to local or private addresses', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { location: 'http://127.0.0.1/admin' },
      }),
    );

    await expect(
      safeFetch('https://example.com', {
        method: 'GET',
        timeoutMs: 1000,
        signal: abortController.signal,
      }),
    ).rejects.toThrow('Private, local, or reserved network addresses are not allowed');
  });

  it('limits redirect chains', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { location: '/next' },
      }),
    );

    await expect(
      safeFetch('https://example.com', {
        method: 'GET',
        timeoutMs: 1000,
        signal: abortController.signal,
      }),
    ).rejects.toThrow('Too many redirects');
  });
});
