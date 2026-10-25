# Research and evaluation protocol

## Problem

Single-image vehicle-damage triage is an uncertain visual reasoning task. A vision-language model can describe visible damage, but it cannot inspect hidden components, measure paint depth, verify structural alignment, or quote a workshop. AutoScan therefore treats model output as a **preliminary, evidence-aware triage result**, not a diagnosis.

## Research questions

1. Can structured prompting produce inspection records that pass a strict application schema?
2. How often are visible-damage findings supported by a localized observation and confidence value?
3. Does deterministic post-processing reduce inconsistent scores across otherwise similar responses?
4. Which image conditions lead to abstention or a manual-review warning?

## Pipeline

1. The mobile client checks that a key and image are available.
2. The image is encoded and sent with a versioned JSON contract.
3. The request uses a timeout and one retry for transient network/server failures.
4. The response parser extracts one JSON object and validates every required field.
5. Condition scores are clamped; the overall score is calculated locally with fixed weights.
6. Low-confidence evidence produces explicit uncertainty flags.
7. Invalid output is rejected. The application never substitutes a fabricated damage report.

## Evaluation design

Build a consented, de-identified image set covering:

- vehicle / non-vehicle images;
- scratches, dents, cracks, broken lamps and no-visible-damage controls;
- daylight, low light, blur, occlusion and multiple viewing distances;
- at least two independent human annotations per image.

Measure:

- vehicle-detection precision and recall;
- exact/partial agreement for damage type and affected area;
- weighted F1 for severity;
- calibration error and Brier score for confidence;
- schema-valid response rate;
- abstention/manual-review rate;
- median and p95 request latency.

Do not report accuracy until a labelled dataset has been evaluated. Unit tests in this repository measure parser, validation and scoring behaviour only.

## Threats to validity

- A single photograph cannot establish structural or mechanical condition.
- Repair prices depend on location, vehicle, parts and workshop inspection.
- Vision-language models can be sensitive to lighting, framing and prompt changes.
- Confidence is model-reported and must be calibrated against labelled data.
- API model updates can change results; reports record the model and assessment version.

## Safety position

The output is decision support for preliminary triage. Safety-related damage, low confidence and ambiguous evidence require inspection by a qualified automotive professional.
