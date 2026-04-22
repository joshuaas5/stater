# Stater

A comprehensive personal finance management application combining AI-powered insights, voice commands, OCR document scanning, and cross-platform deployment (Web PWA + Mobile).

## Overview

Stater helps users take control of their finances through intelligent automation. The app features a conversational AI financial advisor, voice-activated expense logging, receipt scanning via OCR, and automated bill tracking with smart notifications.

## Key Features

- **AI Financial Advisor**: Gemini-powered conversational assistant for personalized financial insights
- **Voice Commands**: Hands-free expense logging using speech-to-text
- **OCR Receipt Scanner**: Extract transaction data from photos of receipts and invoices
- **Bill Management**: Track recurring bills with smart due-date notifications
- **Budget Planning**: Set and monitor budgets across multiple categories
- **Telegram Bot Integration**: Manage finances via Telegram messaging
- **Subscription Management**: Track and manage recurring subscriptions
- **Mobile App**: Native Android experience via Capacitor with OAuth 2.0 authentication
- **PWA Support**: Installable web app with offline capabilities

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query + Zustand
- **Mobile Framework**: Capacitor 6 (Android native)

### Backend & Services
- **Database**: Supabase (PostgreSQL + Realtime)
- **Authentication**: Supabase Auth with Google OAuth
- **AI Integration**: Google Gemini API
- **Payments**: Stripe (web) + Superwall (mobile subscriptions)
- **Notifications**: Telegram Bot API + Email (Resend)
- **Edge Functions**: Supabase Edge Functions (Deno/TypeScript)

### DevOps
- **Hosting**: Vercel (web) + Netlify (backup)
- **CI/CD**: GitHub Actions
- **Mobile Build**: Gradle + Android Studio

## Architecture

```
src/
├── components/        # Reusable UI components
├── pages/            # Route-level components
├── contexts/         # React contexts (Auth, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Utilities and API clients
├── utils/            # Helper functions
├── api/              # API route handlers
└── styles/           # Global styles and Tailwind config

android/              # Capacitor Android project
├── app/src/main/     # Native Android code
└── gradle/           # Build configuration

supabase/
├── functions/        # Edge Functions (Stripe, Telegram)
├── migrations/       # Database schema migrations
└── schema.sql        # Database schema definition

telegram-bot/         # Telegram Bot implementation
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Java 17+ (for Android builds)
- Android Studio (for mobile development)
- Supabase account
- Stripe account (for payments)
- Google Cloud account (for OAuth and Gemini)

### Environment Variables

Create a `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Stripe
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### Installation

```bash
# Clone the repository
git clone https://github.com/joshuaas5/stater.git

# Navigate to project
cd stater

# Install dependencies
npm install

# Start development server
npm run dev
```

### Mobile Development

```bash
# Sync Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK
npx cap build android
```

## Deployment

### Web (Vercel)
```bash
npm run build
vercel --prod
```

### Mobile (Google Play)
1. Generate signed APK/AAB in Android Studio
2. Upload to Google Play Console

## Security Considerations

- All API keys and secrets are managed via environment variables
- Row Level Security (RLS) enabled on all Supabase tables
- Service role keys are restricted to server-side operations only
- OAuth callbacks use PKCE flow for mobile security

## License

MIT

---

Built with attention to detail for users who value financial clarity.
