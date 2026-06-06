# AutoScan AI 🚗🔍

AI-Powered Mobile Vehicle Damage Assessment and Repair Solution

AutoScan AI is an intelligent mobile application developed using React Native and Expo that automates vehicle damage inspection using Artificial Intelligence and Computer Vision technologies. The application enables users to capture or upload vehicle images, analyze visible damage using the Groq AI Vision API, estimate repair costs, generate professional inspection reports, and export results as PDF documents.

This project was developed as a Final Year Project (FYP) for the Department of Computer Science, University of Agriculture Faisalabad.

---

## 📌 Project Overview

Traditional vehicle inspections require manual assessment by automotive experts, which can be time-consuming, expensive, and inconsistent. AutoScan AI provides a faster and more accessible alternative by utilizing AI-powered image analysis to perform preliminary vehicle damage assessments directly from a smartphone.

The application allows users to:

* Upload vehicle damage images
* Analyze vehicle condition using AI
* Detect visible damages
* Estimate repair costs
* Generate inspection reports
* Export reports as PDF files
* Maintain inspection history
* View vehicle health scores

---

## ✨ Key Features

### 🚘 Vehicle Inspection

* Enter vehicle details
* Vehicle make
* Vehicle model
* Manufacturing year
* Mileage
* City / Location

### 📸 Image Acquisition

* Capture image using device camera
* Select image from gallery
* Image validation before analysis

### 🤖 AI Damage Analysis

* Groq AI Vision integration
* Damage identification
* Severity classification
* Affected component detection
* Vehicle condition scoring

### 💰 Repair Cost Estimation

* Estimated repair cost range
* Severity-based recommendations
* Maintenance suggestions
* Repair priority guidance

### 📄 PDF Report Generation

* Professional inspection reports
* Export reports as PDF
* Share reports through mobile device

### 📊 Inspection History

* Save reports locally
* Search reports
* Filter reports
* Delete reports
* View previous inspections

### 📈 Dashboard Analytics

* Total inspections
* Damage distribution
* Average vehicle health score
* Inspection statistics

---

## 🏗 System Architecture

User
↓
React Native Mobile Application
↓
Groq AI Vision API
↓
Damage Analysis Engine
↓
Result Processing
↓
AsyncStorage (Local Storage)
↓
PDF Report Generation

---

## 🛠 Technologies Used

| Technology         | Purpose                 |
| ------------------ | ----------------------- |
| React Native       | Mobile App Development  |
| Expo SDK           | Development Framework   |
| TypeScript         | Programming Language    |
| Expo Router        | Navigation              |
| Groq AI Vision API | Vehicle Damage Analysis |
| AsyncStorage       | Local Data Storage      |
| Expo Print         | PDF Generation          |
| Expo Sharing       | PDF Sharing             |
| Visual Studio Code | Development Environment |

---

## 📱 Application Modules

### 1. Home Dashboard

Provides system overview and quick access to inspection functionality.

### 2. Vehicle Inspection

Collects vehicle information and image data for analysis.

### 3. AI Analysis Engine

Processes uploaded images and generates inspection results.

### 4. Damage Assessment Report

Displays:

* Damage severity
* Condition scores
* Damage findings
* Repair recommendations
* Repair cost estimation

### 5. Report Management

Stores inspection reports locally and allows users to manage historical records.

### 6. Profile & Statistics

Displays application information and inspection analytics.

---

## 📂 Project Structure

AutoScanAI/
│
├── app/
│ ├── (tabs)/
│ ├── dashboard/
│ ├── inspect/
│ ├── reports/
│ ├── profile/
│ └── result/
│
├── components/
│
├── services/
│ ├── groqService.ts
│ └── pdfService.ts
│
├── storage/
│ └── AsyncStorageManager.ts
│
├── assets/
│ ├── images/
│ └── icons/
│
├── constants/
│
├── hooks/
│
├── utils/
│
└── package.json

---

## 🚀 Installation

### Clone Repository

git clone https://github.com/yourusername/AutoScanAI.git

cd AutoScanAI

### Install Dependencies

npm install

### Start Application

npx expo start

### Run on Android

npx expo run:android

---

## 🔑 Environment Configuration

Create a .env file in the project root:

EXPO_PUBLIC_GROQ_API_KEY=YOUR_GROQ_API_KEY

Replace YOUR_GROQ_API_KEY with your actual Groq API key.

---

## 📸 Screenshots

### Home Dashboard

Displays inspection statistics and quick access to analysis features.

### Vehicle Inspection

Allows vehicle information entry and image upload.

### AI Analysis Results

Shows detected damage, severity score, and vehicle condition assessment.

### Repair Cost Estimation

Provides estimated repair costs and repair recommendations.

### Report Management

Displays saved inspection reports and report history.

---

## 🧪 Testing

The application was tested for:

✔ Vehicle Information Entry

✔ Image Upload

✔ AI Damage Analysis

✔ Severity Classification

✔ Repair Cost Estimation

✔ Report Generation

✔ PDF Export

✔ Report Management

✔ User Interface Responsiveness

✔ Local Data Storage

---

## 🎯 Objectives Achieved

* Automated vehicle damage assessment
* AI-powered image analysis
* Repair cost estimation
* PDF report generation
* Inspection history management
* Mobile-first user experience
* Local report storage
* Professional reporting system

---

## 🔒 Limitations

* Requires internet connection for AI analysis
* Limited to visible external vehicle damage
* Does not perform internal mechanical diagnostics
* Repair costs are approximate estimates
* Analysis accuracy depends on image quality

---

## 🚀 Future Enhancements

* Multi-image inspection support
* Cloud database integration
* User authentication
* Workshop recommendation system
* Insurance claim integration
* Vehicle VIN scanning
* Real-time damage comparison
* Advanced analytics dashboard
* Multi-language support
* AI model fine-tuning

---



---

## 📄 License

This project was developed for academic and educational purposes as a Final Year Project.

© Muhammad Arbab Ahmed
