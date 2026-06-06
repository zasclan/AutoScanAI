import * as FileSystem from 'expo-file-system/legacy';
import { GROQ_API_KEY } from '../config/groq';

export const analyzeVehicleImageWithGroq = async (imageUri: string) => {
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  const prompt = `
You are an expert automotive vehicle inspection engineer.

Analyze the uploaded vehicle image carefully and create a professional damage inspection result.

Return ONLY valid JSON in this exact format:

{
"isVehicle": true,
  "vehicleType": "specific vehicle category such as sedan, hatchback, SUV, truck, van, motorcycle, or unknown",
  "affectedArea": "specific visible area such as front bumper, rear bumper, left fender, right door, hood, roof, side panel, headlight, taillight, or unknown",
  "damageType": "specific damage type such as scratch, dent, crack, broken light, paint damage, bumper damage, panel damage, or no visible major damage",
  "affectedComponents": ["component 1", "component 2"],
  "severity": "Minor, Moderate, or Severe",
  "damage": ["detailed damage finding 1", "detailed damage finding 2", "detailed damage finding 3"],
  "estimatedCost": "PKR amount range",
  "repairSuggestion": "professional repair recommendation with practical repair steps",
  "bodyCondition": 75,
  "paintCondition": 80,
  "safetyImpact": 90,
  "repairUrgency": "Low, Medium, or High",
  "resaleImpact": "Low, Medium, or High",
  "overallScore": 82
}

Rules:
First determine whether the uploaded image contains a vehicle.

A vehicle includes:
- Car
- Sedan
- SUV
- Truck
- Van
- Motorcycle

If no vehicle is visible:

"isVehicle": false

and set remaining fields to best effort values.

If a vehicle is visible:

"isVehicle": true
- Be specific and inspection-style, not generic.
- Identify the most likely affected vehicle area from the image.
- Mention affected components such as bumper cover, paint layer, fender, door panel, light assembly, hood, grille, or side panel.
- If damage is not clearly visible, still return a careful inspection result and say "No major visible damage detected" in damage array.
- Estimate repair cost in Pakistani Rupees based on visible damage severity.
- bodyCondition, paintCondition, safetyImpact, and overallScore must be numbers from 0 to 100.
- Lower score means worse condition.
- safetyImpact should be high if the visible damage does not affect driving safety.
- Do not include markdown.
- Do not include explanation outside JSON.
- Return JSON only.
`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1200,
    }),
  });

  const data = await response.json();

  console.log('GROQ RAW RESPONSE:', JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.error?.message || 'Groq API request failed');
  }

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('No response from Groq AI');
  }

  const cleanedText = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(cleanedText);

  return {
    isVehicle: parsed.isVehicle ?? true,
    vehicleType: parsed.vehicleType || 'Passenger Vehicle',
    affectedArea: parsed.affectedArea || 'Unknown Area',
    damageType: parsed.damageType || 'Surface Damage',
    affectedComponents: parsed.affectedComponents || [],
    severity: parsed.severity || 'Moderate',
    damage: parsed.damage || ['Visible body damage detected'],
    estimatedCost: parsed.estimatedCost || 'PKR 18,000 - 25,000',
    repairSuggestion:
      parsed.repairSuggestion ||
      'Recommended repair includes workshop inspection, dent correction, repainting, and polishing where required.',
    bodyCondition: parsed.bodyCondition || 80,
    paintCondition: parsed.paintCondition || 75,
    safetyImpact: parsed.safetyImpact || 90,
    repairUrgency: parsed.repairUrgency || 'Medium',
    resaleImpact: parsed.resaleImpact || 'Low',
    overallScore: parsed.overallScore || 82,
  };
};