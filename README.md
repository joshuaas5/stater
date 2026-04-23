# Stater

A personal finance management application combining AI-powered insights, voice commands, OCR document scanning, and cross-platform deployment (Web PWA + Mobile).

## Overview

Stater helps users take control of their finances through intelligent automation. The app features a conversational AI financial advisor, voice-activated expense logging, receipt scanning via OCR, automated bill tracking with smart notifications, and a Telegram Bot for managing finances on the go.

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

## Access

[https://stater.app](https://stater.app)

---

Built with attention to detail for users who value financial clarity.
