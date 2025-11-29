# Technology Stack Recommendations
## Job Analyzer Pro - AI-Powered Resume Optimization Platform

**Version:** 1.0
**Date:** November 29, 2025
**Status:** Recommended for Approval

---

## 1. Executive Summary

This document provides comprehensive technology stack recommendations for Job Analyzer Pro based on the PRD requirements. The stack prioritizes:
- **Simplicity:** Browser-based architecture with no backend (Phase 1)
- **Performance:** Fast load times and responsive UI
- **Scalability:** Easy migration path to backend when needed
- **Developer Experience:** Modern tooling with strong ecosystem support
- **Cost:** Free and open-source technologies

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
├─────────────────────────────────────────────────────────┤
│  React App (SPA)                                        │
│  ├── UI Components (shadcn/ui + Tailwind CSS)          │
│  ├── State Management (Zustand)                        │
│  ├── Routing (React Router)                            │
│  └── Charts (Recharts)                                 │
├─────────────────────────────────────────────────────────┤
│  Browser APIs                                           │
│  ├── IndexedDB (via Dexie.js) - Primary Storage       │
│  ├── localStorage - Settings & API Keys                │
│  └── Service Worker - Offline Support                  │
├─────────────────────────────────────────────────────────┤
│  External AI APIs (Direct HTTP Calls)                  │
│  ├── OpenAI                                            │
│  ├── Anthropic                                         │
│  ├── Google Gemini                                     │
│  ├── DeepSeek                                          │
│  ├── Groq                                              │
│  └── Grok (xAI)                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Core Technology Stack

### 3.1 Frontend Framework & Build Tools

#### **React 18+ with Vite**
- **Why React?** (Already specified in PRD)
  - Massive ecosystem and community
  - Excellent component reusability
  - Strong TypeScript support
  - Perfect for complex, interactive UIs
  - Easy migration to Next.js if backend needed later

- **Why Vite?** (Recommended over Create React App)
  - ⚡ Lightning-fast dev server (instant HMR)
  - 10x faster builds than Webpack
  - Built-in TypeScript support
  - Smaller bundle sizes
  - Modern ESM-based architecture
  - Better developer experience

**Alternative Considered:** Next.js
- ❌ Rejected for Phase 1: Overkill for browser-only app
- ✅ Future migration path: Easy to migrate when backend needed

---

### 3.2 Language

#### **TypeScript 5+**
- **Why TypeScript?**
  - Catch bugs at compile time, not runtime
  - Essential for large codebase (7 strategies, 6 AI providers)
  - Better IDE autocomplete and refactoring
  - Self-documenting code (type definitions)
  - Easier team collaboration
  - Required for robust admin panel

**Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

### 3.3 Styling & UI Components

#### **Tailwind CSS 4.0** (Already specified in PRD)
- **Why Tailwind?**
  - Rapid UI development
  - Consistent design system
  - Small production bundle (purged CSS)
  - Responsive design made easy
  - Great with component libraries

#### **shadcn/ui** (Highly Recommended)
- **Why shadcn/ui?**
  - Pre-built, accessible components (buttons, modals, forms, tables)
  - Built on Radix UI (WCAG 2.1 AA compliant)
  - Copy-paste components (not npm package) - full control
  - Perfectly styled with Tailwind
  - Includes essential components:
    - Form controls (inputs, selects, checkboxes)
    - Navigation (tabs, sidebar)
    - Overlays (modals, sheets, popovers)
    - Feedback (toast notifications, alerts)
    - Data display (tables, cards, badges)

**Alternative Considered:** Headless UI, Material-UI
- ❌ Headless UI: Too minimal, need to style everything
- ❌ Material-UI: Heavy bundle size, opinionated design

#### **Lucide React** (Icons)
- Modern, lightweight icon library
- 1000+ icons
- Tree-shakeable (only bundle used icons)
- Tailwind-friendly

---

### 3.4 State Management

#### **Zustand** (Recommended)
- **Why Zustand?**
  - Simple, minimal boilerplate
  - 1KB gzipped (vs Redux 3KB)
  - No providers/context needed
  - TypeScript-first
  - Built-in persistence middleware (perfect for our use case)
  - Easy to learn and maintain

**Example Store:**
```typescript
import create from 'zustand'
import { persist } from 'zustand/middleware'

interface UserStore {
  currentUser: User | null
  jobs: Job[]
  addJob: (job: Job) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      jobs: [],
      addJob: (job) => set((state) => ({
        jobs: [...state.jobs, job]
      }))
    }),
    { name: 'user-storage' }
  )
)
```

**Alternatives Considered:**
- ❌ Redux Toolkit: Too complex for browser-only app
- ❌ Jotai/Recoil: Atomic state overkill for our needs
- ✅ Context API: Good for auth, but Zustand better for complex state

---

### 3.5 Data Persistence

#### **IndexedDB via Dexie.js** (Primary Database)
- **Why IndexedDB?**
  - Much larger storage than localStorage (50MB+ vs 5-10MB)
  - Structured database (tables, indexes, queries)
  - Asynchronous (won't block UI)
  - Supports complex queries
  - Perfect for 1000 jobs per user requirement

- **Why Dexie.js wrapper?**
  - Clean, Promise-based API (IndexedDB is callback hell)
  - Built-in versioning and migrations
  - TypeScript support
  - Observables for live queries

**Schema:**
```typescript
import Dexie, { Table } from 'dexie'

interface User {
  id?: number
  username: string
  email?: string
  role: 'user' | 'admin'
  preferredProvider: string
  createdAt: Date
}

interface Job {
  id?: number
  userId: number
  title: string
  company?: string
  description: string
  addedAt: Date
}

interface Resume {
  id?: number
  userId: number
  originalText: string
  optimizedText?: string
  strategyUsed?: string
  createdAt: Date
}

class AppDatabase extends Dexie {
  users!: Table<User>
  jobs!: Table<Job>
  resumes!: Table<Resume>

  constructor() {
    super('JobAnalyzerProDB')
    this.version(1).stores({
      users: '++id, username, role',
      jobs: '++id, userId, addedAt',
      resumes: '++id, userId, createdAt'
    })
  }
}

export const db = new AppDatabase()
```

#### **localStorage** (Settings & API Keys)
- Store encrypted API keys
- User preferences
- Session tokens
- Small configuration data

---

### 3.6 Routing

#### **React Router v6**
- Industry standard for React SPAs
- Type-safe routes with TypeScript
- Nested routing (perfect for admin panel)
- Lazy loading for code splitting

**Route Structure:**
```typescript
import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'optimize', element: <OptimizeResume /> },
      {
        path: 'admin',
        element: <AdminLayout />, // Protected route
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <UserManagement /> },
          { path: 'models', element: <ModelManagement /> },
          { path: 'logs', element: <ActivityLogs /> }
        ]
      }
    ]
  },
  { path: '/login', element: <Login /> }
])
```

---

### 3.7 Charts & Visualization

#### **Recharts** (Already specified in PRD)
- **Why Recharts?**
  - React-native components
  - Responsive and customizable
  - Supports bar charts, pie charts, line charts
  - Good documentation
  - Tailwind-friendly styling

**For Skills Analysis:**
- Bar chart for top skills frequency
- Pie chart for skill categories
- Trend charts for admin analytics

---

### 3.8 AI API Integration

#### **Axios** (HTTP Client)
- **Why Axios?**
  - Clean API for HTTP requests
  - Built-in request/response interceptors
  - Better error handling than fetch
  - Request timeout support
  - Automatic JSON parsing

**API Service Layer:**
```typescript
import axios from 'axios'

interface AIProvider {
  id: string
  name: string
  endpoint: string
  format: 'openai' | 'anthropic' | 'custom'
}

class AIService {
  async callModel(
    provider: AIProvider,
    apiKey: string,
    prompt: string
  ): Promise<string> {
    const instance = axios.create({
      baseURL: provider.endpoint,
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    // Adapter pattern for different API formats
    const payload = this.formatRequest(provider.format, prompt)
    const response = await instance.post('/chat/completions', payload)
    return this.parseResponse(provider.format, response.data)
  }
}
```

#### **AI Provider SDK Options:**
Instead of raw Axios, consider official SDKs:

| Provider | SDK | Pros | Cons |
|----------|-----|------|------|
| OpenAI | `openai` npm package | Official, type-safe, handles streaming | Larger bundle size |
| Anthropic | `@anthropic-ai/sdk` | Official, type-safe | Larger bundle size |
| Others | Axios | Universal, small | Manual implementation |

**Recommendation:** Use official SDKs for OpenAI and Anthropic, Axios for others.

---

### 3.9 Form Handling & Validation

#### **React Hook Form**
- **Why?**
  - Minimal re-renders (better performance)
  - Built-in validation
  - TypeScript support
  - Works great with shadcn/ui

#### **Zod** (Schema Validation)
- Type-safe validation
- Integrates with React Hook Form
- Runtime type checking

**Example:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().optional(),
  description: z.string().min(50, 'Description too short')
})

type JobFormData = z.infer<typeof jobSchema>

function AddJobForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema)
  })

  const onSubmit = (data: JobFormData) => {
    // Save to IndexedDB
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  )
}
```

---

### 3.10 Skills Extraction

#### **Natural** (NLP Library)
- JavaScript-native NLP toolkit
- Tokenization, stemming, classification
- No external API needed (privacy-friendly)
- Works offline

#### **Custom Regex + Keywords Dictionary**
For technical skills, a curated dictionary works better:

```typescript
const TECHNICAL_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'AWS',
  'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git',
  // ... 200+ skills
]

const SOFT_SKILLS = [
  'Leadership', 'Communication', 'Problem-solving',
  'Teamwork', 'Time management', 'Adaptability',
  // ... 50+ skills
]

function extractSkills(text: string) {
  const found = new Map<string, number>()
  const lowerText = text.toLowerCase()

  for (const skill of [...TECHNICAL_SKILLS, ...SOFT_SKILLS]) {
    const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      found.set(skill, matches.length)
    }
  }

  return found
}
```

---

### 3.11 Security

#### **Encryption for API Keys**
Use Web Crypto API for client-side encryption:

```typescript
async function encryptAPIKey(key: string, userPassword: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)

  // Derive key from user password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  const cryptoKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('job-analyzer-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  )

  return { encrypted, iv }
}
```

**Note:** For true security, move to backend in Phase 2+.

---

## 4. Development Tools & Workflow

### 4.1 Package Manager

#### **pnpm** (Recommended)
- **Why pnpm?**
  - 3x faster than npm
  - Saves disk space (symlinks shared dependencies)
  - Stricter dependency resolution (prevents phantom dependencies)
  - Industry trend (used by Vue, Nuxt, Prisma)

**Alternative:** npm (fine too, but slower)

---

### 4.2 Code Quality

#### **ESLint + Prettier**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### **Husky + lint-staged**
Pre-commit hooks to enforce code quality:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

### 4.3 Testing

#### **Vitest** (Unit Tests)
- Same config as Vite (zero-config)
- Compatible with Jest API
- Much faster than Jest

#### **React Testing Library** (Component Tests)
- Test user behavior, not implementation
- Encourages accessible components

#### **Playwright** (E2E Tests - Phase 2)
- Cross-browser testing
- Built-in retry and screenshots

**Test Coverage Goals:**
- Unit: 80%+ for business logic (skills extraction, cost calculation)
- Integration: 60%+ for critical flows (auth, optimization)
- E2E: Smoke tests for each strategy

---

### 4.4 Documentation

#### **Storybook** (Component Documentation)
- Visual component gallery
- Test components in isolation
- Great for UI review and QA

#### **TypeDoc** (API Documentation)
- Generate docs from TypeScript types
- Useful for complex service layers

---

## 5. Deployment & DevOps

### 5.1 Hosting

#### **Vercel** (Recommended - Free Tier)
- **Why Vercel?**
  - Zero-config deployment for Vite/React
  - Automatic HTTPS
  - Global CDN
  - Instant rollbacks
  - Perfect for SPAs
  - Free tier: 100GB bandwidth/month

**Alternatives:**
- **Netlify:** Similar to Vercel, good free tier
- **Cloudflare Pages:** Fastest CDN, generous free tier
- **GitHub Pages:** Free, but less features

---

### 5.2 CI/CD

#### **GitHub Actions** (Free for public repos)
```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

### 5.3 Monitoring & Analytics

#### **Sentry** (Error Tracking)
- Real-time error monitoring
- Source map support
- Free tier: 5K events/month

#### **Plausible / Umami** (Privacy-Friendly Analytics)
- GDPR compliant (no cookies)
- Lightweight script
- Open-source option (self-host)

**Avoid:** Google Analytics (privacy concerns, heavy script)

---

## 6. Additional Libraries

### 6.1 Utilities

| Library | Purpose | Why? |
|---------|---------|------|
| `date-fns` | Date formatting | Smaller than Moment.js (tree-shakeable) |
| `clsx` | Conditional classes | Perfect with Tailwind |
| `immer` | Immutable state | Simplify complex state updates |
| `react-hot-toast` | Notifications | Beautiful, customizable toasts |
| `react-markdown` | Markdown rendering | Display formatted resume output |
| `file-saver` | File downloads | Export resumes as .txt |

---

### 6.2 Performance

| Library | Purpose | Why? |
|---------|---------|------|
| `react-window` | Virtual scrolling | Handle 1000+ jobs efficiently |
| `react-lazy-load` | Image lazy loading | Faster initial load |
| `web-vitals` | Performance metrics | Monitor Core Web Vitals |

---

## 7. Project Structure

```
job-analyzer-pro/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── jobs/
│   │   │   ├── skills/
│   │   │   ├── resume/
│   │   │   └── admin/
│   │   └── layouts/
│   ├── lib/
│   │   ├── db.ts            # Dexie configuration
│   │   ├── ai-service.ts    # AI API integrations
│   │   ├── skills-extractor.ts
│   │   ├── crypto.ts        # API key encryption
│   │   └── utils.ts
│   ├── stores/
│   │   ├── user-store.ts
│   │   ├── job-store.ts
│   │   └── settings-store.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── job.ts
│   │   └── ai.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useJobs.ts
│   │   └── useOptimization.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   ├── Optimize.tsx
│   │   └── Admin/
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 8. Migration Path to Backend (Phase 4+)

When scaling beyond browser storage:

### Backend Options

#### **Option 1: Next.js (Recommended)**
- Migrate React app to Next.js
- Add API routes
- Keep frontend mostly unchanged
- Built-in server-side rendering

#### **Option 2: Node.js + Express + PostgreSQL**
- Traditional REST API
- PostgreSQL for relational data
- Redis for caching
- More control, more setup

#### **Option 3: Supabase (Backend-as-a-Service)**
- PostgreSQL database
- Built-in auth
- Row-level security
- Real-time subscriptions
- Free tier available

**Migration Steps:**
1. Move IndexedDB data schema to PostgreSQL
2. Add authentication (JWT or sessions)
3. Create API endpoints for CRUD operations
4. Proxy AI API calls through backend (secure API keys)
5. Add rate limiting and usage tracking

---

## 9. Cost Estimate (Monthly)

### Phase 1 (Browser-Only)
- Hosting (Vercel): **Free**
- Domain: **$12/year** ($1/month)
- Error tracking (Sentry): **Free** (5K events)
- Analytics: **Free** (self-host Umami)
- **Total: ~$1/month**

### Phase 2+ (With Backend)
- Hosting (Vercel Pro): **$20/month**
- Database (Supabase): **$25/month** (or free tier)
- Redis (Upstash): **Free** (10K commands/day)
- **Total: ~$20-45/month**

**Note:** AI API costs are paid by users directly.

---

## 10. Final Recommendations Summary

### ✅ Recommended Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Language** | TypeScript 5+ | Type safety for complex app |
| **Framework** | React 18+ | Industry standard, great ecosystem |
| **Build Tool** | Vite | 10x faster than Webpack |
| **UI Library** | shadcn/ui + Tailwind CSS | Accessible, customizable, fast development |
| **State Management** | Zustand | Simple, performant, built-in persistence |
| **Database** | IndexedDB (Dexie.js) | Large storage, structured queries |
| **Routing** | React Router v6 | Industry standard for SPAs |
| **HTTP Client** | Axios + Official AI SDKs | Clean API, better error handling |
| **Forms** | React Hook Form + Zod | Performance, type-safe validation |
| **Charts** | Recharts | React-native, responsive |
| **Icons** | Lucide React | Modern, lightweight |
| **Testing** | Vitest + React Testing Library | Fast, modern, great DX |
| **Deployment** | Vercel | Zero-config, free tier |
| **Package Manager** | pnpm | Faster, more efficient |

---

## 11. Getting Started Commands

```bash
# Create project
pnpm create vite job-analyzer-pro --template react-ts

# Install dependencies
cd job-analyzer-pro
pnpm install

# Add core libraries
pnpm add zustand dexie react-router-dom axios recharts
pnpm add react-hook-form @hookform/resolvers zod
pnpm add date-fns clsx

# Add UI libraries
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx shadcn-ui@latest init
pnpm add lucide-react

# Add AI SDKs
pnpm add openai @anthropic-ai/sdk

# Add dev tools
pnpm add -D eslint prettier eslint-config-prettier
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D husky lint-staged

# Initialize Tailwind
pnpm dlx tailwindcss init -p

# Run dev server
pnpm dev
```

---

## 12. Decision Log

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| Build tool | Webpack, Vite, Parcel | **Vite** | Fastest dev experience |
| State management | Redux, Zustand, Jotai | **Zustand** | Simplest, built-in persistence |
| Database | localStorage, IndexedDB | **IndexedDB** | 50MB+ storage needed |
| UI components | Build from scratch, MUI, shadcn/ui | **shadcn/ui** | Accessible, customizable |
| Hosting | Vercel, Netlify, AWS | **Vercel** | Best DX, free tier |
| Package manager | npm, yarn, pnpm | **pnpm** | Fastest, most efficient |

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| IndexedDB quota exceeded | High | Monitor storage, implement cleanup, export feature |
| CORS issues with AI APIs | Medium | Some APIs require backend proxy (add in Phase 2) |
| API key security | High | Warn users, encrypt keys, move to backend ASAP |
| Browser compatibility | Medium | Polyfills, progressive enhancement |
| Performance with 1000+ jobs | Medium | Virtual scrolling, pagination, web workers |

---

## 14. Next Steps

1. ✅ **Approve this tech stack** (or request changes)
2. 🚀 **Initialize project** with Vite + TypeScript
3. 📦 **Install dependencies** as listed above
4. 🎨 **Set up Tailwind + shadcn/ui**
5. 🗄️ **Configure Dexie.js** database schema
6. 🧪 **Set up testing framework**
7. 🎯 **Start Phase 1 development**

---

**Document Owner:** Tech Lead
**Last Updated:** November 29, 2025
**Status:** Ready for Review 🎯
