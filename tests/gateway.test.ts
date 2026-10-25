import { describe, expect, it, vi } from 'vitest';
import { handleRequest } from '../server/worker';

describe('assessment gateway', () => {
  it('rejects malformed images before calling upstream', async () => {
    const upstream = vi.fn();
    const response = await handleRequest(
      new Request('https://example.test', { method: 'POST', body: JSON.stringify({ imageBase64: 'not base64!' }) }),
      { GROQ_API_KEY: 'secret' }, upstream,
    );
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('keeps the provider key at the gateway boundary', async () => {
    const upstream = vi.fn(async (_url, init: RequestInit) => {
      expect(new Headers(init.headers).get('authorization')).toBe('Bearer server-secret');
      return new Response(JSON.stringify({ choices: [{ message: { content: '{"isVehicle":true}' } }] }), { status: 200 });
    });
    const response = await handleRequest(
      new Request('https://example.test', { method: 'POST', body: JSON.stringify({ imageBase64: 'YWJjZA==' }) }),
      { GROQ_API_KEY: 'server-secret', ALLOWED_ORIGIN: 'https://app.example' }, upstream as typeof fetch,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('https://app.example');
    expect((await response.json()).text).toBe('{"isVehicle":true}');
  });

  it('marks assessment responses as non-cacheable', async () => {
    const upstream = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }), { status: 200 }));
    const response = await handleRequest(
      new Request('https://example.test', { method: 'POST', body: JSON.stringify({ imageBase64: 'YWJjZA==' }) }),
      { GROQ_API_KEY: 'secret' }, upstream as typeof fetch,
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
