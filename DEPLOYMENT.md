# Exposé-App - Vercel Deployment

## 🚀 Live-Demo
Die App ist deployed auf: [Wird nach Deployment verfügbar sein]

## 📋 Deployment-Anleitung

### Voraussetzungen
- Node.js 18+ installiert
- Vercel Account (kostenlos bei vercel.com)
- Git Repository (bereits vorhanden)

### Lokaler Build-Test
```bash
npm install
npm run build:production
npm run preview
```

### Vercel Deployment

#### Option 1: Vercel CLI (Empfohlen)
```bash
# Vercel CLI installieren
npm i -g vercel

# Im Projektverzeichnis
vercel

# Folgen Sie den Anweisungen:
# - Link to existing project? No
# - Project name: expose-app
# - Directory: ./
# - Override settings? No
```

#### Option 2: GitHub Integration
1. Push den Code zu GitHub
2. Gehe zu https://vercel.com
3. "New Project" → GitHub Repository importieren
4. expose-app auswählen
5. Deploy (verwendet automatisch vercel.json Konfiguration)

## ✅ Implementierte Features

- **Kamera-Integration**: Direkte Bildaufnahme im Browser
- **KI-Textgenerierung**: Automatische Exposé-Texterstellung  
- **Entwurfs-Management**: Speicherung und Versionierung
- **Energieausweis-Import**: PDF-Parser und Datenextraktion
- **Design-System**: Material-UI Integration

## 🛠 Technische Details

- **Framework**: React + TypeScript + Vite
- **Deployment**: Vercel (Serverless)
- **Build-Output**: Static Site Generation
- **Domain**: Automatisch von Vercel bereitgestellt

## 📁 Projektstruktur
```
expose-app/
├── src/
│   ├── components/     # React-Komponenten
│   ├── hooks/         # Custom React Hooks
│   ├── services/      # Business Logic
│   ├── types/         # TypeScript Definitionen
│   └── main.tsx       # App Entry Point
├── public/            # Statische Assets
├── dist/              # Build Output (nach npm run build)
├── vercel.json        # Vercel Konfiguration
└── package.json       # Dependencies & Scripts
```