# AutoScan AI

**Evidence-aware vehicle damage triage for mobile devices**

AutoScan AI is a final-year research prototype that studies how a vision-language model can support preliminary vehicle-damage triage from a single photograph. The application does more than forward an image to an API: it enforces a versioned assessment contract, validates every response, derives condition scores locally, records evidence and uncertainty, and rejects invalid output instead of fabricating a report.

> The output is decision support, not a mechanical, structural or safety diagnosis. Low-confidence and safety-related findings require professional inspection.

## Problem statement

Vision-language APIs can produce fluent but inconsistent descriptions. A useful inspection workflow must answer separate engineering questions:

- Is the response structurally valid?
- Which visible cue supports each finding?
- How confident is the assessment, and what cannot be inferred?
- Are scores reproducible, or generated freely by the model?
- What happens when the provider times out, rate-limits or returns malformed JSON?

AutoScan addresses those failure modes in the application layer.

## Assessment pipeline

```text
Camera/gallery image
        â†“
Versioned JSON contract + conservative visual prompt
        â†“
Groq vision request (timeout + transient retry)
        â†“
JSON extraction and strict schema validation
        â†“
Evidence/confidence checks + uncertainty flags
        â†“
Deterministic weighted condition score
        â†“
Reviewable report, local history and PDF export
```

## Implemented safeguards

- Server-side gateway option that keeps the provider key out of distributed clients
- Explicit gateway/API-key and image preconditions
- 30-second timeout and one retry for rate-limit/server failures
- Strict vehicle decision, enumerated severity/risk levels and bounded scores
- Localized evidence items with per-finding confidence
- Low-confidence and weak-evidence manual-review flags
- Locally derived overall score: body 40%, paint 25%, safety 35%
- Model, latency and assessment-version provenance
- Safe JSON-array parsing when opening saved or routed reports
- No synthetic fallback report when the API or parser fails

## Validation

```bash
npm install
npm test
npx tsc --noEmit
```

The automated suite verifies JSON extraction, malformed/missing-evidence rejection, confidence warnings and deterministic scoring. The executable [`research/evaluation.ts`](research/evaluation.ts) module measures coverage, vehicle accuracy, damage/severity agreement and confidence Brier score against labelled cases. Its tests use synthetic records to validate the metric calculations; they are not model-accuracy results.

AutoScan does **not** claim damage-detection accuracy. A labelled human-reviewed image dataset is required before accuracy, F1 or calibration results can be reported.

The complete research questions, proposed dataset design, metrics, threats to validity and safety position are documented in [`docs/RESEARCH.md`](docs/RESEARCH.md).

## Technology

- React Native, Expo Router and TypeScript
- Groq vision-language API
- AsyncStorage for local report history
- Expo Print and Sharing for PDF export
- Vitest for domain validation tests

## Configuration

For distributed builds, deploy the reference Worker in `server/` and point the app at it:

```env
EXPO_PUBLIC_ANALYSIS_API_URL=https://your-gateway.example
```

Store `GROQ_API_KEY` as a server-side Worker secret. For local experiments only, `EXPO_PUBLIC_GROQ_API_KEY` remains available as a fallback; Expo public variables are embedded in the client and must not be used for production distribution. The reference gateway validates payloads, restricts CORS when configured, prevents response caching and keeps the provider credential at the server boundary. An internet-facing deployment should add user authentication and durable rate limiting.

## Known limitations

- Single-view images cannot expose hidden or mechanical damage.
- Model confidence is not calibrated until evaluated against labelled data.
- PKR cost ranges are planning guidance, not workshop quotations.
- Local report storage is device-specific and is not an evidence-preservation system.

## Author

Muhammad Arbab Ahmed â€” BS Computer Science final-year project
