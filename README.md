# AutoScan AI

Mobile vehicle-damage assessment prototype built with React Native, Expo, and TypeScript.

AutoScan AI lets a user capture or select a vehicle image, submit it to the Groq Vision API, review a structured damage assessment, save the result locally, and export a shareable PDF report. It was developed as a BS Computer Science final-year project at the University of Agriculture Faisalabad.

> AutoScan AI provides a preliminary visual assessment. It does not replace an inspection by a qualified mechanic, body-repair specialist, or insurance assessor.

## Core features

- Camera and gallery image input
- Vehicle information capture
- AI-assisted identification of visible damage
- Severity, affected-area, and condition summaries
- Approximate repair-cost guidance
- Local inspection history with search and filtering
- PDF report generation and native sharing
- Dashboard statistics for saved inspections

## Technology

| Area | Technology |
|---|---|
| Mobile application | React Native, Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| AI service | Groq Vision API |
| Local persistence | AsyncStorage |
| Reports | Expo Print, Expo Sharing |

## Application flow

```text
Vehicle details and image
          |
          v
React Native application
          |
          v
Groq Vision API
          |
          v
Response validation and result processing
          |
          +--> Local inspection history
          |
          +--> PDF report and sharing
```

## Run locally

### Requirements

- Node.js 20 or newer
- npm
- Expo Go or an Android/iOS development environment
- A Groq API key

### Setup

```bash
git clone https://github.com/zasclan/AutoScanAI.git
cd AutoScanAI
npm install
```

Copy the environment template and add your own development key:

```bash
copy .env.example .env
```

```env
EXPO_PUBLIC_GROQ_API_KEY=your_development_key
```

Start the application:

```bash
npx expo start
```

Never commit a real API key. An `EXPO_PUBLIC_` value is included in the client bundle, so a production deployment should call the AI service through a secured backend instead.

## Project structure

```text
app/          Screens and Expo Router navigation
components/   Reusable interface components
config/       Environment-backed application configuration
services/     AI analysis and PDF services
assets/       Application images and icons
constants/    Shared theme values
hooks/        Reusable React hooks
```

## Current limitations

- Analysis is limited to visible external damage in the submitted image.
- Results depend on image quality, lighting, and viewpoint.
- Repair costs are approximate and location-dependent.
- Inspection history is stored locally on the device.
- The current prototype requires an internet connection for AI analysis.

## Planned improvements

- Multi-image inspections
- User authentication and cloud synchronization
- Workshop and repair-service recommendations
- VIN capture
- Automated tests for response parsing and report generation
- Secured backend proxy for production API access

## Author

Muhammad Arbab Ahmed<br>
BS Computer Science, University of Agriculture Faisalabad

## License

Created as an academic final-year project. No open-source licence has been granted yet.
