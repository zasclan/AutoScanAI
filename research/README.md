# Evaluation harness

`evaluation.ts` compares model predictions with an independently labelled set by stable case ID. It deliberately reports **coverage** separately from accuracy so that abstaining on difficult images cannot artificially improve the result.

The current metrics are:

- vehicle / non-vehicle accuracy;
- exact agreement for normalized damage type;
- exact agreement for severity;
- prediction coverage after abstention;
- Brier score for vehicle-decision confidence.

The test file uses synthetic records only to verify the metric implementation. It is not an accuracy result for AutoScan AI. A real study should store de-identified image IDs and annotations outside the public repository, document annotator agreement, freeze the prompt/model version and then pass exported predictions to this evaluator.
