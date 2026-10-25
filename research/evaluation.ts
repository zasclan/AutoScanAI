export interface GroundTruthCase {
  id: string;
  isVehicle: boolean;
  damageType?: string;
  severity?: 'Minor' | 'Moderate' | 'Severe';
}

export interface PredictionCase {
  id: string;
  isVehicle: boolean;
  confidence: number;
  damageType?: string;
  severity?: 'Minor' | 'Moderate' | 'Severe';
  abstained?: boolean;
}

export interface EvaluationMetrics {
  sampleCount: number;
  evaluatedCount: number;
  coverage: number;
  vehicleAccuracy: number;
  damageTypeAccuracy: number | null;
  severityAccuracy: number | null;
  confidenceBrierScore: number;
}

const round = (value: number) => Math.round(value * 10_000) / 10_000;

export function evaluatePredictions(
  truth: GroundTruthCase[],
  predictions: PredictionCase[],
): EvaluationMetrics {
  if (truth.length === 0) throw new Error('Ground-truth data is empty.');
  const predictionById = new Map(predictions.map((item) => [item.id, item]));
  const paired = truth
    .map((expected) => ({ expected, predicted: predictionById.get(expected.id) }))
    .filter((pair): pair is { expected: GroundTruthCase; predicted: PredictionCase } =>
      Boolean(pair.predicted && !pair.predicted.abstained),
    );

  if (paired.length === 0) throw new Error('No non-abstained predictions match the labelled cases.');
  const vehicleCorrect = paired.filter(({ expected, predicted }) => expected.isVehicle === predicted.isVehicle).length;
  const damagePairs = paired.filter(({ expected }) => expected.isVehicle && expected.damageType);
  const severityPairs = paired.filter(({ expected }) => expected.isVehicle && expected.severity);

  const damageCorrect = damagePairs.filter(({ expected, predicted }) =>
    expected.damageType!.toLowerCase() === predicted.damageType?.toLowerCase(),
  ).length;
  const severityCorrect = severityPairs.filter(({ expected, predicted }) => expected.severity === predicted.severity).length;
  const brier = paired.reduce((sum, { expected, predicted }) => {
    const correctness = expected.isVehicle === predicted.isVehicle ? 1 : 0;
    const confidence = Math.min(1, Math.max(0, predicted.confidence));
    return sum + (confidence - correctness) ** 2;
  }, 0) / paired.length;

  return {
    sampleCount: truth.length,
    evaluatedCount: paired.length,
    coverage: round(paired.length / truth.length),
    vehicleAccuracy: round(vehicleCorrect / paired.length),
    damageTypeAccuracy: damagePairs.length ? round(damageCorrect / damagePairs.length) : null,
    severityAccuracy: severityPairs.length ? round(severityCorrect / severityPairs.length) : null,
    confidenceBrierScore: round(brier),
  };
}
