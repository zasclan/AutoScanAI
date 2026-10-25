import { describe, expect, it } from 'vitest';
import { evaluatePredictions } from '../research/evaluation';

describe('research evaluation', () => {
  it('reports coverage, agreement and confidence calibration separately', () => {
    const metrics = evaluatePredictions(
      [
        { id: 'a', isVehicle: true, damageType: 'scratch', severity: 'Minor' },
        { id: 'b', isVehicle: true, damageType: 'dent', severity: 'Moderate' },
        { id: 'c', isVehicle: false },
      ],
      [
        { id: 'a', isVehicle: true, damageType: 'scratch', severity: 'Minor', confidence: 0.9 },
        { id: 'b', isVehicle: true, damageType: 'scratch', severity: 'Minor', confidence: 0.8 },
        { id: 'c', isVehicle: false, confidence: 0.95, abstained: true },
      ],
    );

    expect(metrics.coverage).toBe(0.6667);
    expect(metrics.vehicleAccuracy).toBe(1);
    expect(metrics.damageTypeAccuracy).toBe(0.5);
    expect(metrics.severityAccuracy).toBe(0.5);
    expect(metrics.confidenceBrierScore).toBe(0.025);
  });

  it('fails when predictions cannot be paired with labelled cases', () => {
    expect(() => evaluatePredictions([{ id: 'a', isVehicle: true }], [])).toThrow(/No non-abstained/);
  });
});
