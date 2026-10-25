const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const MAX_BASE64_LENGTH = 8_000_000;

const prompt = `You are assisting with preliminary, single-image vehicle damage triage.
Report only observations that are visually supported. Do not diagnose hidden, structural, or mechanical damage.
Return one JSON object with: isVehicle, vehicleType, affectedArea, damageType, affectedComponents, severity, damage, estimatedCost, repairSuggestion, bodyCondition, paintCondition, safetyImpact, repairUrgency, resaleImpact, confidence, evidence and uncertaintyFlags.
Confidence is 0-1. Condition scores are 0-100 and higher is better. Include localized evidence. Use uncertainty when the image cannot support a conclusion. JSON only.`;

interface Environment {
  GROQ_API_KEY: string;
  ALLOWED_ORIGIN?: string;
}

function json(body: unknown, status = 200, origin = '*') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'cache-control': 'no-store',
    },
  });
}

export async function handleRequest(
  request: Request,
  env: Environment,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const origin = env.ALLOWED_ORIGIN || '*';
  if (request.method === 'OPTIONS') return json({}, 204, origin);
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin);
  if (!env.GROQ_API_KEY) return json({ error: 'Gateway is not configured.' }, 503, origin);

  let body: { imageBase64?: unknown };
  try { body = await request.json(); }
  catch { return json({ error: 'Request body must be valid JSON.' }, 400, origin); }
  const image = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
  if (!image || image.length > MAX_BASE64_LENGTH || !/^[A-Za-z0-9+/=]+$/.test(image)) {
    return json({ error: 'A valid image payload is required.' }, 400, origin);
  }

  const startedAt = Date.now();
  const upstream = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.GROQ_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
      ] }],
      temperature: 0,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    }),
  });
  const payload = await upstream.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
  if (!upstream.ok) return json({ error: payload.error?.message || 'Assessment provider failed.' }, upstream.status, origin);
  const text = payload.choices?.[0]?.message?.content;
  if (!text) return json({ error: 'Assessment provider returned an empty response.' }, 502, origin);
  return json({ text, model: MODEL, latencyMs: Date.now() - startedAt }, 200, origin);
}

export default { fetch: (request: Request, env: Environment) => handleRequest(request, env) };
