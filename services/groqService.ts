import * as FileSystem from 'expo-file-system/legacy';
import { ANALYSIS_API_URL, GROQ_API_KEY } from '../config/groq';
import { extractJsonObject, InspectionResult, normalizeInspection } from '../domain/inspection';

const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const TIMEOUT_MS = 30_000;

const prompt = `You are assisting with preliminary, single-image vehicle damage triage.
Report only observations that are visually supported. Do not diagnose hidden, structural, or mechanical damage.
Return exactly one JSON object with this contract:
{
  "isVehicle": true,
  "vehicleType": "sedan | hatchback | SUV | truck | van | motorcycle | unknown",
  "affectedArea": "specific visible area",
  "damageType": "scratch | dent | crack | broken light | paint damage | panel damage | no visible damage | uncertain",
  "affectedComponents": ["visible component"],
  "severity": "Minor | Moderate | Severe",
  "damage": ["concise visible finding"],
  "estimatedCost": "broad PKR range with uncertainty",
  "repairSuggestion": "inspection-first recommendation",
  "bodyCondition": 0,
  "paintCondition": 0,
  "safetyImpact": 0,
  "repairUrgency": "Low | Medium | High",
  "resaleImpact": "Low | Medium | High",
  "confidence": 0.0,
  "evidence": [{"observation":"visual cue","location":"image location","confidence":0.0}],
  "uncertaintyFlags": ["what cannot be concluded from this image"]
}
Rules:
- confidence values are between 0 and 1.
- condition scores are between 0 and 100; higher is better.
- set isVehicle=false for non-vehicle images. Keep the remaining fields structurally valid.
- include at least one localized evidence item for a vehicle assessment.
- if damage is unclear, use damageType="uncertain", lower confidence and request another view.
- cost is a preliminary range, not a quotation.
- JSON only; no markdown or prose outside the object.`;

async function requestAssessment(base64Image: string, attempt: number): Promise<{ text: string; latencyMs: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = Date.now();
  try {
    const usingGateway = Boolean(ANALYSIS_API_URL);
    const response = await fetch(usingGateway ? ANALYSIS_API_URL : ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        ...(usingGateway ? {} : { Authorization: `Bearer ${GROQ_API_KEY}` }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usingGateway ? { imageBase64: base64Image } : {
        model: MODEL,
        messages: [{ role: 'user', content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
        ] }],
        temperature: 0,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      const message = payload?.error?.message || `Assessment service returned HTTP ${response.status}.`;
      if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return requestAssessment(base64Image, 1);
      }
      throw new Error(message);
    }
    const text = usingGateway ? payload?.text : payload?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) throw new Error('Assessment service returned an empty response.');
    return { text, latencyMs: Date.now() - startedAt };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Assessment timed out. Try a smaller or clearer image.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeVehicleImageWithGroq(imageUri: string): Promise<InspectionResult> {
  if (!ANALYSIS_API_URL && !GROQ_API_KEY) throw new Error('Assessment gateway is not configured. See .env.example.');
  if (!imageUri) throw new Error('Select an image before starting an assessment.');
  const base64Image = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
  if (!base64Image) throw new Error('The selected image could not be read.');
  const response = await requestAssessment(base64Image, 0);
  return normalizeInspection(extractJsonObject(response.text), { model: MODEL, latencyMs: response.latencyMs });
}
