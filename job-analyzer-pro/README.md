# Job Analyzer Pro

AI-Powered Resume Optimization Platform - Multi-tenant web application for analyzing job postings and optimizing resumes.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📋 Project Overview

Job Analyzer Pro helps job seekers optimize their resumes by:
- Analyzing multiple job postings
- Identifying the most in-demand skills
- Using AI to generate tailored, ATS-optimized resumes
- Supporting 7 different optimization strategies
- Integrating with 6 AI providers (OpenAI, Anthropic, Gemini, DeepSeek, Groq, Grok)

## 🛠 Technology Stack

### Core
- **React 19** - UI framework
- **TypeScript 5** - Type safety
- **Vite** - Build tool & dev server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Accessible component library
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### State & Data
- **Zustand** - State management
- **Dexie.js** - IndexedDB wrapper
- **React Router** - Client-side routing

### Forms & Validation
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### AI Integration
- **OpenAI SDK** - GPT models
- **Anthropic SDK** - Claude models
- **Google Generative AI** - Gemini models
- **Axios** - HTTP client for other providers

### Utilities
- **date-fns** - Date formatting
- **clsx** - Class name utilities
- **react-hot-toast** - Notifications
- **file-saver** - File downloads

## 📁 Project Structure

```
job-analyzer-pro/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── features/        # Feature-specific components
│   │   │   ├── auth/
│   │   │   ├── jobs/
│   │   │   ├── skills/
│   │   │   ├── resume/
│   │   │   └── admin/
│   │   └── layouts/         # Layout components
│   ├── lib/
│   │   ├── db.ts            # Dexie database config
│   │   └── utils.ts         # Utility functions
│   ├── stores/
│   │   └── user-store.ts    # Zustand stores
│   ├── types/
│   │   └── ai.ts            # TypeScript types
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
└── package.json
```

## 🎯 Features (Planned)

### Phase 1: MVP
- ✅ Project initialization
- ⏳ User authentication & multi-tenancy
- ⏳ Job description management
- ⏳ Skills extraction & analysis
- ⏳ Basic resume optimization
- ⏳ Persistent storage

### Phase 2: Full Features
- ⏳ All 7 optimization strategies
- ⏳ Strategy comparison tool
- ⏳ Cost calculator
- ⏳ Export functionality

### Phase 3: Admin Panel
- ⏳ Admin dashboard
- ⏳ User management
- ⏳ AI model management
- ⏳ Activity logs

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint

# Code Quality
pnpm format       # Format with Prettier (when configured)
pnpm type-check   # TypeScript type checking
```

### Environment Variables

Create a `.env` file for local development:

```env
# Not needed for MVP (browser-only)
# Future: Add backend API URL here
```

## 📚 Documentation

- [PRD](../README.md) - Product Requirements Document
- [Tech Stack](../TECH_STACK.md) - Technology decisions and architecture

## 🔐 Security Notes

⚠️ **Important**: This is a browser-only application for MVP. API keys are stored in localStorage with basic encryption. For production use:
- Move to backend API
- Store API keys server-side
- Implement proper authentication (JWT/OAuth)
- Add rate limiting

## 🚢 Deployment

Recommended platforms:
- **Vercel** (Primary) - Zero-config deployment
- **Netlify** - Alternative
- **Cloudflare Pages** - Alternative

```bash
# Deploy to Vercel
pnpm build
vercel --prod
```

## 📝 License

Private project - All rights reserved

## 👥 Team

Development Team - Job Analyzer Pro

---

**Status**: Initial Setup Complete ✅
**Version**: 0.1.0
**Last Updated**: November 29, 2025
