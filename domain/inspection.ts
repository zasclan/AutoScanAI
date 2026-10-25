export type Severity = 'Minor' | 'Moderate' | 'Severe';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface DamageEvidence {
  observation: string;
  location: string;
  confidence: number;
}

export interface InspectionResult {
  isVehicle: boolean;
  vehicleType: string;
  affectedArea: string;
  damageType: string;
  affectedComponents: string[];
  severity: Severity;
  damage: string[];
  estimatedCost: string;
  repairSuggestion: string;
  bodyCondition: number;
  paintCondition: number;
  safetyImpact: number;
  repairUrgency: RiskLevel;
  resaleImpact: RiskLevel;
  overallScore: number;
  confidence: number;
  evidence: DamageEvidence[];
  uncertaintyFlags: string[];
  assessmentVersion: string;
  model: string;
  latencyMs: number;
}

export class InspectionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InspectionValidationError';
  }
}

const severityValues = new Set<Severity>(['Minor', 'Moderate', 'Severe']);
const riskValues = new Set<RiskLevel>(['Low', 'Medium', 'High']);

function clampNumber(value: unknown, minimum: number, maximum: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new InspectionValidationError('A numeric score is missing or invalid.');
  return Math.round(Math.min(maximum, Math.max(minimum, number)) * 100) / 100;
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length < 2) {
    throw new InspectionValidationError(`${field} is missing or too short.`);
  }
  return value.trim();
}

function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) throw new InspectionValidationError(`${field} must be an array.`);
  const items = value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) throw new InspectionValidationError(`${field} contains no usable observations.`);
  return items;
}

function parseEvidence(value: unknown): DamageEvidence[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InspectionValidationError('The model returned no visual evidence.');
  }
  return value.slice(0, 6).map((item, index) => {
    if (!item || typeof item !== 'object') throw new InspectionValidationError(`Evidence item ${index + 1} is invalid.`);
    const record = item as Record<string, unknown>;
    return {
      observation: requiredText(record.observation, 'Evidence observation'),
      location: requiredText(record.location, 'Evidence location'),
      confidence: clampNumber(record.confidence, 0, 1),
    };
  });
}

export function extractJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new InspectionValidationError('The model response did not contain a JSON object.');
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    throw new InspectionValidationError('The model response contained malformed JSON.');
  }
}

export function deriveOverallScore(body: number, paint: number, safety: number): number {
  return Math.round((body * 0.4 + paint * 0.25 + safety * 0.35) * 10) / 10;
}

export function normalizeInspection(
  raw: Record<string, unknown>,
  metadata: { model: string; latencyMs: number },
): InspectionResult {
  if (typeof raw.isVehicle !== 'boolean') throw new InspectionValidationError('Vehicle detection decision is missing.');
  if (!raw.isVehicle) {
    throw new InspectionValidationError('No vehicle was detected in the submitted image.');
  }

  const evidence = parseEvidence(raw.evidence);
  const confidence = clampNumber(raw.confidence, 0, 1);
  const bodyCondition = clampNumber(raw.bodyCondition, 0, 100);
  const paintCondition = clampNumber(raw.paintCondition, 0, 100);
  const safetyImpact = clampNumber(raw.safetyImpact, 0, 100);
  const severity = raw.severity as Severity;
  const repairUrgency = raw.repairUrgency as RiskLevel;
  const resaleImpact = raw.resaleImpact as RiskLevel;
  if (!severityValues.has(severity)) throw new InspectionValidationError('Severity is outside the supported scale.');
  if (!riskValues.has(repairUrgency) || !riskValues.has(resaleImpact)) {
    throw new InspectionValidationError('Risk level is outside the supported scale.');
  }

  const uncertaintyFlags = Array.isArray(raw.uncertaintyFlags)
    ? raw.uncertaintyFlags.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];
  if (confidence < 0.55) uncertaintyFlags.push('Low model confidence; professional inspection required.');
  if (evidence.some((item) => item.confidence < 0.5)) uncertaintyFlags.push('One or more visual findings have weak evidence.');

  return {
    isVehicle: true,
    vehicleType: requiredText(raw.vehicleType, 'Vehicle type'),
    affectedArea: requiredText(raw.affectedArea, 'Affected area'),
    damageType: requiredText(raw.damageType, 'Damage type'),
    affectedComponents: stringArray(raw.affectedComponents, 'Affected components'),
    severity,
    damage: stringArray(raw.damage, 'Damage findings'),
    estimatedCost: requiredText(raw.estimatedCost, 'Estimated cost'),
    repairSuggestion: requiredText(raw.repairSuggestion, 'Repair suggestion'),
    bodyCondition,
    paintCondition,
    safetyImpact,
    repairUrgency,
    resaleImpact,
    overallScore: deriveOverallScore(bodyCondition, paintCondition, safetyImpact),
    confidence,
    evidence,
    uncertaintyFlags: [...new Set(uncertaintyFlags)],
    assessmentVersion: '2.0',
    model: metadata.model,
    latencyMs: Math.max(0, Math.round(metadata.latencyMs)),
  };
}
