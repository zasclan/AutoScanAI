import * as FileSystem from 'expo-file-system/legacy';
import { GEMINI_API_KEY } from '../config/gemini';

export const analyzeVehicleImage = async (imageUri: string) => {
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  const prompt = `
You are an automotive vehicle damage inspection assistant.

Analyze this vehicle image and return ONLY valid JSON in this format:

{
  "vehicleType": "car, truck, motorcycle, SUV, van, or unknown",
  "severity": "Minor, Moderate, or Severe",
  "damage": ["damage 1", "damage 2"],
  "estimatedCost": "PKR amount range",
  "repairSuggestion": "short repair suggestion"
}

Rules:
- Detect visible scratches, dents, cracks, broken lights, paint damage, bumper damage, or panel damage.
- If damage is not clearly visible, say "No major visible damage detected".
- Estimate repair cost in Pakistani Rupees.
- Do not include markdown.
- Do not include explanation outside JSON.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    }
  );

 const data = await response.json();

console.log('GEMINI RAW RESPONSE:', JSON.stringify(data, null, 2));

if (!response.ok) {
  throw new Error(data.error?.message || 'Gemini API request failed');
}

const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

if (!text) {
  throw new Error('No text response from Gemini AI');
}

  const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  return JSON.parse(cleanedText);
};