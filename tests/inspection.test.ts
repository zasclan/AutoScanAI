import { describe, expect, it } from 'vitest';
import { deriveOverallScore, extractJsonObject, InspectionValidationError, normalizeInspection } from '../domain/inspection';

const valid = {
  isVehicle: true,
  vehicleType: 'sedan',
  affectedArea: 'front bumper',
  damageType: 'scratch',
  affectedComponents: ['bumper cover', 'paint layer'],
  severity: 'Minor',
  damage: ['Horizontal surface scratch visible on the bumper'],
  estimatedCost: 'PKR 8,000 - 14,000',
  repairSuggestion: 'Confirm paint depth and inspect mounting points before refinishing.',
  bodyCondition: 82,
  paintCondition: 68,
  safetyImpact: 92,
  repairUrgency: 'Low',
  resaleImpact: 'Low',
  confidence: 0.78,
  evidence: [{ observation: 'paint discontinuity', location: 'front bumper centre', confidence: 0.81 }],
  uncertaintyFlags: ['Single exterior image; hidden damage cannot be assessed.'],
};

describe('inspection domain', () => {
  it('extracts JSON from a fenced model response', () => {
    expect(extractJsonObject(`result:\n\`\`\`json\n${JSON.stringify(valid)}\n\`\`\``).vehicleType).toBe('sedan');
  });

  it('derives the score locally instead of trusting a model score', () => {
    expect(deriveOverallScore(80, 60, 100)).toBe(82);
    const result = normalizeInspection({ ...valid, overallScore: 4 }, { model: 'fixture', latencyMs: 123.6 });
    expect(result.overallScore).toBe(82);
    expect(result.latencyMs).toBe(124);
  });

  it('marks low-confidence assessments for human review', () => {
    const result = normalizeInspection({ ...valid, confidence: 0.4 }, { model: 'fixture', latencyMs: 10 });
    expect(result.uncertaintyFlags.some((flag) => flag.includes('professional inspection'))).toBe(true);
  });

  it('rejects responses without evidence rather than inventing findings', () => {
    expect(() => normalizeInspection({ ...valid, evidence: [] }, { model: 'fixture', latencyMs: 10 })).toThrow(InspectionValidationError);
  });
});
