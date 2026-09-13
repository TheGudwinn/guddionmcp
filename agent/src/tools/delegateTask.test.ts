import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { delegateTask } from './delegateTask.js';

describe('delegateTask', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.GUDDION_BACKEND_URL = 'https://backend.example.com';
    process.env.GUDDION_BACKEND_TOKEN = 'test-token';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.GUDDION_BACKEND_URL;
    delete process.env.GUDDION_BACKEND_TOKEN;
  });

  it('posts to /api/delegate with a bearer token and returns the parsed result', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: 'done', model: 'cheap-model', costCents: 3 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await delegateTask('summarize this file', { hint: 'fast' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/delegate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body);
    expect(body).toEqual({ prompt: 'summarize this file', hint: 'fast' });
    expect(result).toEqual({ output: 'done', model: 'cheap-model', costCents: 3 });
  });

  it('throws with status and body text on a non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      text: async () => 'balance exhausted',
    }) as unknown as typeof fetch;

    await expect(delegateTask('do something')).rejects.toThrow(/402/);
  });

  it('throws a clear error when GUDDION_BACKEND_URL or GUDDION_BACKEND_TOKEN is not configured', async () => {
    delete process.env.GUDDION_BACKEND_URL;
    await expect(delegateTask('do something')).rejects.toThrow(/GUDDION_BACKEND_URL/);
  });
});
