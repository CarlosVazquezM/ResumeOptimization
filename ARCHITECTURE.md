# Architecture Document - Job Analyzer Pro SaaS
**Version:** 2.0
**Date:** November 28, 2025
**Status:** Architecture Design

---

## 1. Architecture Overview

### 1.1 Architecture Pattern
**Multi-Tenant SaaS Application with Microservices-Ready Monolith**

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / CLIENTS                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CDN / Load Balancer                           │
│                     (Cloudflare / AWS)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│   FRONTEND (React SPA)    │   │   BACKEND API (Node.js)      │
│   - React 18+             │   │   - Express.js / Fastify     │
│   - TypeScript            │   │   - TypeScript               │
│   - Tailwind CSS          │   │   - RESTful API              │
│   - React Router          │   │   - JWT Auth                 │
│   - Zustand/Redux         │   │   - Rate Limiting            │
│   - Hosted on CDN         │   │   - Request Validation       │
└───────────────────────────┘   └──────────────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
        ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
        │   PostgreSQL     │   │   Redis Cache    │   │  AI Proxy Layer  │
        │   - User Data    │   │   - Sessions     │   │  - OpenAI        │
        │   - Jobs         │   │   - Rate Limits  │   │  - Anthropic     │
        │   - Resumes      │   │   - Job Queue    │   │  - Google        │
        │   - History      │   │   - Temp Data    │   │  - DeepSeek      │
        │   - Billing      │   │                  │   │  - Groq          │
        └──────────────────┘   └──────────────────┘   │  - Grok (xAI)    │
                                                       └──────────────────┘
                    ▼                       ▼
        ┌──────────────────┐   ┌──────────────────┐
        │  Object Storage  │   │  Background Jobs │
        │  (S3/R2)         │   │  - BullMQ        │
        │  - Exports       │   │  - AI Processing │
        │  - Backups       │   │  - Email Queue   │
        └──────────────────┘   └──────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend Stack
```yaml
Framework: React 18.3+
Language: TypeScript 5.3+
Build Tool: Vite 5+
State Management: Zustand (lightweight) or Redux Toolkit
Routing: React Router v6
UI Framework: Tailwind CSS 3.4+
Charts: Recharts 2.10+
HTTP Client: Axios
Form Handling: React Hook Form + Zod validation
Testing: Vitest + React Testing Library
E2E Testing: Playwright
Deployment: Vercel / Cloudflare Pages / AWS S3 + CloudFront
```

### 2.2 Backend Stack
```yaml
Runtime: Node.js 20 LTS
Framework: Express.js 4.x or Fastify 4.x (better performance)
Language: TypeScript 5.3+
API Style: RESTful (with OpenAPI/Swagger docs)
Authentication: JWT + Refresh Tokens
Validation: Zod
ORM: Prisma or Drizzle ORM
Background Jobs: BullMQ + Redis
Rate Limiting: express-rate-limit + Redis
Security: Helmet, CORS, express-validator
Logging: Winston + structured logging
Monitoring: Sentry (errors) + DataDog/New Relic (APM)
Testing: Vitest + Supertest
Deployment: Docker + AWS ECS/Fargate or Railway/Render
```

### 2.3 Database & Storage
```yaml
Primary Database: PostgreSQL 16+ (AWS RDS / Supabase)
  - Row-level security for multi-tenancy
  - Full-text search for job descriptions
  - JSONB for flexible data (AI responses)

Cache & Queue: Redis 7+ (AWS ElastiCache / Upstash)
  - Session storage
  - Rate limiting counters
  - Job queue (BullMQ)
  - Temporary data caching

Object Storage: AWS S3 / Cloudflare R2
  - Resume exports
  - Database backups
  - Static assets

Search (Optional Phase 2): Elasticsearch / Meilisearch
  - Job description search
  - Skills search
```

### 2.4 Infrastructure & DevOps
```yaml
Hosting: AWS / Google Cloud / Railway
Containerization: Docker + Docker Compose
Orchestration: AWS ECS Fargate or Kubernetes (if scale demands)
CI/CD: GitHub Actions
CDN: Cloudflare
Domain & DNS: Cloudflare
SSL/TLS: Let's Encrypt (auto-renewed)
Monitoring:
  - Application: DataDog / New Relic
  - Errors: Sentry
  - Uptime: UptimeRobot / Better Uptime
  - Logs: AWS CloudWatch / Logtail
Backup: Automated daily PostgreSQL backups to S3
```

### 2.5 Third-Party Services
```yaml
Authentication:
  - Auth0 (recommended for fast setup) OR
  - Supabase Auth OR
  - Custom JWT implementation

Payment Processing: Stripe
  - Subscription management
  - Usage-based billing
  - Invoice generation

Email:
  - Transactional: Resend / SendGrid
  - Marketing (future): Mailchimp / ConvertKit

Analytics:
  - PostHog (product analytics)
  - Google Analytics 4 (web analytics)

AI Providers:
  - OpenAI (GPT-4, GPT-4 Turbo)
  - Anthropic (Claude Sonnet, Opus)
  - Google (Gemini Pro)
  - DeepSeek
  - Groq (Mixtral, Llama)
  - xAI (Grok)
```

---

## 3. Database Schema

### 3.1 Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free' | 'pro' | 'enterprise'
  stripe_customer_id VARCHAR(255),

  -- AI Preferences
  preferred_ai_provider VARCHAR(50),

  -- Encrypted API Keys (user's own keys for bring-your-own-key model)
  encrypted_api_keys JSONB, -- {openai: 'enc...', anthropic: 'enc...'}
  encryption_key_id VARCHAR(255), -- KMS key reference

  -- Quotas & Usage
  monthly_optimization_quota INTEGER DEFAULT 10, -- based on tier
  monthly_optimizations_used INTEGER DEFAULT 0,
  total_spend_usd DECIMAL(10,4) DEFAULT 0,

  -- Metadata
  email_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP, -- Soft delete

  CONSTRAINT valid_role CHECK (role IN ('user', 'admin')),
  CONSTRAINT valid_tier CHECK (subscription_tier IN ('free', 'pro', 'enterprise'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
```

#### jobs
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Job Data
  title VARCHAR(500) NOT NULL,
  company VARCHAR(255),
  description TEXT NOT NULL,
  url VARCHAR(1000),
  source VARCHAR(50), -- 'manual' | 'linkedin' | 'indeed' | etc

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(company, '') || ' ' || coalesce(description, ''))
  ) STORED
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_search ON jobs USING GIN(search_vector);
```

#### skills
```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Skill Data
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'technical' | 'soft' | 'certification' | 'other'
  frequency INTEGER NOT NULL DEFAULT 1, -- count across all jobs
  percentage DECIMAL(5,2), -- percentage of jobs containing this skill

  -- Metadata
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, name),
  CONSTRAINT valid_category CHECK (category IN ('technical', 'soft', 'certification', 'other'))
);

CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_frequency ON skills(frequency DESC);
```

#### resumes
```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Resume Data
  title VARCHAR(255) NOT NULL DEFAULT 'My Resume',
  original_content TEXT NOT NULL,
  word_count INTEGER,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE, -- user can have multiple resumes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_active ON resumes(user_id, is_active);
```

#### optimizations
```sql
CREATE TABLE optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,

  -- Optimization Details
  strategy_id VARCHAR(50) NOT NULL, -- 'quick_optimize' | 'cascade_refinement' | etc
  strategy_name VARCHAR(255) NOT NULL,

  -- Input
  original_resume TEXT NOT NULL,
  job_context TEXT, -- summary of job skills used
  num_jobs_analyzed INTEGER,

  -- Output
  optimized_resume TEXT,

  -- Execution Details
  status VARCHAR(20) NOT NULL, -- 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,

  -- Cost & Performance
  estimated_cost_usd DECIMAL(10,6),
  actual_cost_usd DECIMAL(10,6),
  estimated_time_seconds INTEGER,
  actual_time_seconds INTEGER,
  total_tokens_used INTEGER,

  -- AI Model Usage
  models_used JSONB, -- [{provider: 'openai', model: 'gpt-4', tokens: 1234, cost: 0.01}, ...]

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_optimizations_user_id ON optimizations(user_id);
CREATE INDEX idx_optimizations_status ON optimizations(status);
CREATE INDEX idx_optimizations_created_at ON optimizations(created_at DESC);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe Data
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  stripe_product_id VARCHAR(255),

  -- Subscription Details
  tier VARCHAR(20) NOT NULL, -- 'free' | 'pro' | 'enterprise'
  status VARCHAR(20) NOT NULL, -- 'active' | 'canceled' | 'past_due' | 'trialing'

  -- Billing
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_tier CHECK (tier IN ('free', 'pro', 'enterprise')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete'))
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

#### ai_models
```sql
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider Details
  provider_id VARCHAR(50) NOT NULL, -- 'openai' | 'anthropic' | etc
  provider_name VARCHAR(255) NOT NULL,

  -- Model Details
  model_id VARCHAR(100) NOT NULL, -- 'gpt-4-turbo' | 'claude-sonnet-4' | etc
  model_name VARCHAR(255) NOT NULL,

  -- API Configuration
  api_endpoint VARCHAR(500),
  api_format VARCHAR(50), -- 'openai' | 'anthropic' | 'custom'
  requires_api_key BOOLEAN DEFAULT TRUE,

  -- Pricing
  cost_per_1k_input_tokens DECIMAL(10,6),
  cost_per_1k_output_tokens DECIMAL(10,6),

  -- Capabilities
  max_context_tokens INTEGER,
  max_output_tokens INTEGER,
  supports_streaming BOOLEAN DEFAULT FALSE,

  -- Status
  is_enabled BOOLEAN DEFAULT TRUE,
  is_beta BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(provider_id, model_id)
);

CREATE INDEX idx_ai_models_enabled ON ai_models(is_enabled);
CREATE INDEX idx_ai_models_provider ON ai_models(provider_id);
```

#### activity_logs
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Event Details
  event_type VARCHAR(100) NOT NULL, -- 'user.login' | 'job.created' | 'optimization.completed' | etc
  event_category VARCHAR(50) NOT NULL, -- 'auth' | 'job' | 'optimization' | 'admin' | etc
  severity VARCHAR(20) DEFAULT 'info', -- 'debug' | 'info' | 'warning' | 'error'

  -- Event Data
  description TEXT,
  metadata JSONB, -- flexible event-specific data
  ip_address INET,
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_event_type ON activity_logs(event_type);
```

### 3.2 Multi-Tenancy Strategy

**Approach: Shared Database with Row-Level Security (PostgreSQL RLS)**

```sql
-- Enable RLS on all user-specific tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY jobs_isolation ON jobs
  FOR ALL
  TO authenticated_user
  USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY skills_isolation ON skills
  FOR ALL
  TO authenticated_user
  USING (user_id = current_setting('app.current_user_id')::UUID);

-- Admin bypass
CREATE POLICY admin_all_access ON jobs
  FOR ALL
  TO admin_user
  USING (TRUE);
```

**Benefits:**
- Complete data isolation at database level
- Single database = simpler operations
- Cost-effective for startup phase
- Easy to migrate to separate schemas/databases later

**Alternative (for enterprise tier):** Separate schemas per tenant

---

## 4. API Architecture

### 4.1 API Structure

```
/api/v1
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh-token
│   ├── POST   /verify-email
│   ├── POST   /forgot-password
│   └── POST   /reset-password
│
├── /users
│   ├── GET    /me
│   ├── PATCH  /me
│   ├── DELETE /me
│   ├── GET    /me/usage
│   └── GET    /me/billing
│
├── /jobs
│   ├── GET    /           (list with pagination)
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── DELETE /:id
│   └── DELETE /           (bulk delete)
│
├── /skills
│   ├── GET    /analysis   (get current skills analysis)
│   └── POST   /refresh    (force re-analyze)
│
├── /resumes
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── DELETE /:id
│   └── POST   /:id/set-active
│
├── /optimizations
│   ├── GET    /                    (history)
│   ├── POST   /                    (create new)
│   ├── GET    /:id
│   ├── GET    /:id/status
│   ├── POST   /:id/cancel
│   ├── GET    /strategies          (list available)
│   └── POST   /estimate-cost
│
├── /ai-models
│   ├── GET    /                    (list enabled models)
│   ├── GET    /providers
│   └── POST   /test-connection
│
├── /export
│   ├── POST   /jobs
│   ├── POST   /resumes
│   └── POST   /full-data
│
├── /webhooks
│   └── POST   /stripe             (Stripe webhooks)
│
└── /admin                         (admin only)
    ├── /users
    │   ├── GET    /
    │   ├── GET    /:id
    │   ├── PATCH  /:id
    │   └── DELETE /:id
    │
    ├── /ai-models
    │   ├── GET    /
    │   ├── POST   /
    │   ├── PATCH  /:id
    │   └── DELETE /:id
    │
    ├── /analytics
    │   ├── GET    /dashboard
    │   ├── GET    /usage
    │   └── GET    /costs
    │
    └── /logs
        └── GET    /
```

### 4.2 Authentication Flow

**JWT-based authentication with refresh tokens**

```typescript
// Access Token (short-lived: 15 minutes)
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user",
  "tier": "pro",
  "exp": 1234567890
}

// Refresh Token (long-lived: 7 days)
{
  "userId": "uuid",
  "tokenVersion": 1, // for invalidation
  "exp": 1234567890
}
```

**Security Measures:**
- Access tokens stored in memory (React state)
- Refresh tokens in httpOnly cookies
- CSRF protection for cookie-based auth
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- Email verification required
- 2FA optional (Phase 2)

### 4.3 Rate Limiting Strategy

```yaml
Tier-based rate limits:

Free Tier:
  - API calls: 100 requests/hour
  - Optimizations: 10/month
  - Job additions: 50/day

Pro Tier:
  - API calls: 1000 requests/hour
  - Optimizations: 100/month
  - Job additions: unlimited

Enterprise Tier:
  - API calls: 10000 requests/hour
  - Optimizations: unlimited
  - Job additions: unlimited
  - Dedicated support

Implementation:
  - Redis-backed sliding window
  - Per-user tracking
  - HTTP 429 responses with Retry-After header
```

### 4.4 API Security

```yaml
Security Headers (Helmet.js):
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security

Input Validation:
  - Zod schemas for all endpoints
  - SQL injection prevention (ORM + parameterized queries)
  - XSS prevention (sanitize user input)
  - File upload validation (future)

CORS:
  - Whitelist frontend domain only
  - Credentials: true (for cookies)

API Key Storage:
  - User API keys encrypted with AWS KMS or Vault
  - Encryption keys never logged
  - Separate encryption key per user
```

---

## 5. AI Proxy Layer

### 5.1 Architecture

```typescript
// Unified AI interface
interface AIProvider {
  provider: string;
  sendRequest(params: AIRequest): Promise<AIResponse>;
  estimateCost(params: AIRequest): number;
  validateApiKey(apiKey: string): Promise<boolean>;
}

// Implementations
class OpenAIProvider implements AIProvider { ... }
class AnthropicProvider implements AIProvider { ... }
class GeminiProvider implements AIProvider { ... }
class DeepSeekProvider implements AIProvider { ... }
class GroqProvider implements AIProvider { ... }
class GrokProvider implements AIProvider { ... }
```

### 5.2 API Key Management

**Two Models:**

**Option A: Platform Keys (Recommended for MVP)**
- Platform stores encrypted AI provider keys
- Users don't need their own keys
- Platform marks up costs (e.g., 20% markup)
- Simpler user experience
- Better for free tier (platform subsidizes)

**Option B: Bring Your Own Key (BYOK)**
- Users provide their own API keys
- Keys encrypted with user-specific KMS key
- Platform doesn't mark up costs
- User has full cost transparency
- Better for power users

**Hybrid Approach (Best):**
- Free tier: Platform keys with quota
- Pro tier: Choice of platform keys OR BYOK
- Enterprise: BYOK required

### 5.3 Background Job Processing

```typescript
// BullMQ job queue
const optimizationQueue = new Queue('optimizations', {
  connection: redisConnection
});

// Job processor
optimizationQueue.process(async (job) => {
  const { userId, resumeId, strategy, jobs } = job.data;

  // Update status to 'processing'
  await updateOptimizationStatus(job.id, 'processing');

  try {
    // Execute AI strategy workflow
    const result = await executeStrategy(strategy, {
      resume,
      jobs,
      userId
    });

    // Save result
    await saveOptimizationResult(job.id, result);

    // Update user usage
    await incrementUserUsage(userId, result.actualCost);

    // Send completion email
    await sendEmail(userId, 'optimization-complete');

    return result;
  } catch (error) {
    await updateOptimizationStatus(job.id, 'failed', error.message);
    throw error;
  }
});
```

**Benefits:**
- Non-blocking API responses
- Retry failed jobs automatically
- Handle long-running optimizations (60-90 seconds)
- Scale workers independently
- Job prioritization based on tier

---

## 6. Security Architecture

### 6.1 Data Encryption

```yaml
In Transit:
  - TLS 1.3 for all connections
  - HTTPS only (HSTS enabled)
  - Secure WebSocket connections (future)

At Rest:
  - PostgreSQL: AES-256 encryption (AWS RDS)
  - S3: Server-side encryption (SSE-S3)
  - API Keys: Encrypted with AWS KMS
    - User-specific data keys
    - Automatic key rotation

In Use:
  - Secrets in environment variables
  - No secrets in code or logs
  - Redis: Password protected + encryption in transit
```

### 6.2 Compliance

```yaml
GDPR Compliance:
  - Right to access: /api/v1/export/full-data
  - Right to deletion: /api/v1/users/me DELETE (cascade)
  - Data portability: JSON export
  - Privacy policy required
  - Cookie consent banner
  - Data retention policy (e.g., 2 years)

CCPA Compliance:
  - Similar to GDPR
  - California users disclosure

SOC 2 (Future):
  - Required for enterprise customers
  - Audit logging
  - Access controls
  - Incident response plan
```

### 6.3 API Key Security

```typescript
// Encryption flow
async function storeUserApiKey(userId: string, provider: string, apiKey: string) {
  // 1. Generate data encryption key (DEK) for this user (if not exists)
  const userDEK = await getOrCreateUserDEK(userId);

  // 2. Encrypt the API key with DEK
  const encryptedKey = encrypt(apiKey, userDEK);

  // 3. Store encrypted key
  await db.users.update({
    where: { id: userId },
    data: {
      encrypted_api_keys: {
        [provider]: encryptedKey
      }
    }
  });

  // 4. Never log the plain API key
}

// Decryption flow (for use)
async function getUserApiKey(userId: string, provider: string): Promise<string> {
  const user = await db.users.findUnique({ where: { id: userId } });
  const encryptedKey = user.encrypted_api_keys[provider];

  const userDEK = await getUserDEK(userId);
  const apiKey = decrypt(encryptedKey, userDEK);

  return apiKey;
}
```

### 6.4 Audit Logging

```yaml
Log All:
  - User authentication events
  - Admin actions
  - Data exports
  - User deletions
  - API key changes
  - Subscription changes
  - Failed login attempts
  - Rate limit violations

Log Retention: 1 year minimum
Log Storage: AWS CloudWatch / S3
Log Analysis: ELK Stack or CloudWatch Insights
```

---

## 7. Billing & Subscription Architecture

### 7.1 Subscription Tiers

```yaml
Free Tier:
  - Price: $0/month
  - Optimizations: 10/month
  - Jobs: Unlimited
  - Strategies: Quick Optimize, Budget Optimizer only
  - AI Models: Groq, DeepSeek only (cheapest)
  - Support: Community (docs, email)
  - Data retention: 6 months

Pro Tier:
  - Price: $29/month
  - Optimizations: 100/month
  - Jobs: Unlimited
  - Strategies: All 7 strategies
  - AI Models: All providers
  - BYOK: Optional
  - Support: Email (24-48h response)
  - Data retention: 2 years
  - Export: Unlimited
  - Priority processing

Enterprise Tier:
  - Price: $199/month (or custom)
  - Optimizations: Unlimited
  - Jobs: Unlimited
  - Strategies: All + custom strategies
  - AI Models: All + custom models
  - BYOK: Required
  - Support: Priority (4h response) + Slack channel
  - Data retention: Unlimited
  - Export: Unlimited
  - Dedicated API keys
  - SSO (SAML)
  - Custom integrations
  - SLA: 99.9% uptime
```

### 7.2 Stripe Integration

```typescript
// Webhook events to handle
const stripeWebhookEvents = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.created',
  'customer.updated'
];

// Handle subscription changes
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await db.subscriptions.update({
    where: { stripe_subscription_id: subscription.id },
    data: {
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000),
      // Update user tier
      user: {
        update: {
          subscription_tier: mapStripePriceToTier(subscription.items.data[0].price.id)
        }
      }
    }
  });
}
```

### 7.3 Usage Tracking

```typescript
// Track every optimization
async function recordOptimizationUsage(userId: string, cost: number) {
  await db.$transaction([
    // Increment monthly counter
    db.users.update({
      where: { id: userId },
      data: {
        monthly_optimizations_used: { increment: 1 },
        total_spend_usd: { increment: cost }
      }
    }),

    // Create usage record for billing
    db.usage_records.create({
      data: {
        user_id: userId,
        type: 'optimization',
        quantity: 1,
        cost_usd: cost,
        created_at: new Date()
      }
    })
  ]);

  // Check if user exceeded quota
  const user = await db.users.findUnique({ where: { id: userId } });
  if (user.monthly_optimizations_used >= user.monthly_optimization_quota) {
    // Send upgrade notification
    await sendUpgradeEmail(userId);
  }
}

// Reset monthly counters (cron job)
async function resetMonthlyUsage() {
  await db.users.updateMany({
    data: {
      monthly_optimizations_used: 0
    }
  });
}
```

---

## 8. Deployment Architecture

### 8.1 AWS Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                      │
│                  - SSL/TLS Termination                   │
│                  - DDoS Protection                       │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
    ┌──────────────────┐    ┌──────────────────────────┐
    │   S3 Bucket      │    │   ALB (Load Balancer)    │
    │   (Frontend)     │    └──────────────────────────┘
    └──────────────────┘                │
                                        ▼
                            ┌──────────────────────────┐
                            │   ECS Fargate Cluster    │
                            │   - API Service (3+ tasks)│
                            │   - Worker Service (2+)  │
                            └──────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
        ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
        │   RDS Postgres   │ │  ElastiCache     │ │   S3 (Storage)   │
        │   - Multi-AZ     │ │  - Redis         │ │   - Backups      │
        │   - Auto Backup  │ │  - Cluster Mode  │ │   - Exports      │
        └──────────────────┘ └──────────────────┘ └──────────────────┘

                            ┌──────────────────────────┐
                            │   Monitoring & Logging   │
                            │   - CloudWatch           │
                            │   - X-Ray (Tracing)      │
                            │   - SNS (Alerts)         │
                            └──────────────────────────┘
```

**Estimated Monthly Cost (Low Traffic):**
- ECS Fargate (3 API + 2 worker tasks): ~$100
- RDS PostgreSQL (db.t4g.medium): ~$50
- ElastiCache (cache.t4g.micro): ~$15
- S3 + CloudFront: ~$20
- ALB: ~$20
- **Total: ~$205/month**

**Estimated Monthly Cost (Medium Traffic - 1000 users):**
- ECS Fargate (10 API + 5 worker tasks): ~$350
- RDS PostgreSQL (db.t4g.large): ~$150
- ElastiCache (cache.t4g.small): ~$30
- S3 + CloudFront: ~$100
- **Total: ~$630/month**

### 8.2 Alternative: Railway/Render (Faster Setup)

**Railway:**
```yaml
Services:
  - API (Node.js)
  - Worker (Node.js)
  - PostgreSQL (managed)
  - Redis (managed)

Cost: ~$20-50/month (starter)
Pros:
  - Zero config deployment
  - GitHub integration
  - Auto-scaling
  - Built-in monitoring
Cons:
  - Less control
  - Higher cost at scale
```

**Recommendation:** Start with Railway/Render for MVP, migrate to AWS when reaching 500+ users.

### 8.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test:
    - Run unit tests
    - Run integration tests
    - Run E2E tests (Playwright)

  build:
    - Build frontend (Vite)
    - Build backend (TypeScript)
    - Build Docker images

  deploy-staging:
    - Deploy to staging environment
    - Run smoke tests
    - Notify team

  deploy-production:
    - Require manual approval
    - Deploy frontend to S3/CloudFront
    - Deploy backend to ECS
    - Run database migrations
    - Invalidate CDN cache
    - Send deployment notification (Slack)
```

---

## 9. Monitoring & Observability

### 9.1 Metrics to Track

```yaml
Application Metrics:
  - Request rate (req/s)
  - Response time (p50, p95, p99)
  - Error rate (%)
  - Active users
  - Optimizations in progress
  - Queue depth (BullMQ)

Business Metrics:
  - New signups/day
  - Daily/Monthly active users
  - Conversion rate (free → pro)
  - Monthly recurring revenue (MRR)
  - Churn rate
  - Average optimization cost
  - Most popular strategies

Infrastructure Metrics:
  - CPU/Memory usage
  - Database connections
  - Redis memory usage
  - Disk usage
  - Network I/O

AI Metrics:
  - API call success rate per provider
  - Average response time per model
  - Token usage by provider
  - Cost per optimization by strategy
  - Failed AI calls (by error type)
```

### 9.2 Alerts

```yaml
Critical Alerts (PagerDuty):
  - API error rate > 5% (5 min)
  - Database down
  - Redis down
  - Queue processing stopped
  - Disk usage > 90%

Warning Alerts (Slack):
  - API response time p95 > 2s
  - Error rate > 1%
  - AI provider failing > 10%
  - Queue depth > 100
  - Unusual cost spike

Info Alerts (Email):
  - Daily summary report
  - New user signups
  - Subscription changes
```

---

## 10. Scalability Considerations

### 10.1 Horizontal Scaling

```yaml
API Servers:
  - Stateless design (no session storage in memory)
  - Scale based on CPU/memory usage
  - Auto-scaling: 2-20 instances
  - Load balancing: Round-robin

Workers:
  - One worker pool per priority level
  - Scale based on queue depth
  - Auto-scaling: 1-10 workers

Database:
  - Read replicas for read-heavy operations
  - Connection pooling (PgBouncer)
  - Consider sharding if > 100GB

Redis:
  - Cluster mode for > 1M keys
  - Separate instances for cache vs. queue
```

### 10.2 Performance Optimizations

```yaml
Caching Strategy:
  - AI model list: 1 hour
  - User profile: 15 minutes
  - Skills analysis: 5 minutes
  - Job list: No cache (real-time)

Database Optimizations:
  - Indexes on foreign keys
  - Composite indexes for common queries
  - EXPLAIN ANALYZE for slow queries
  - Connection pooling

API Optimizations:
  - Response compression (gzip)
  - Pagination (limit: 50 items)
  - Field selection (?fields=id,title)
  - ETags for caching
```

### 10.3 Growth Projections

```yaml
Year 1: 1,000 users
  - 1 region (us-east-1)
  - 3 API servers
  - 1 database (no replicas)
  - Cost: ~$500/month

Year 2: 10,000 users
  - 2 regions (US, EU)
  - 10 API servers
  - 1 primary + 2 read replicas
  - Cost: ~$2,000/month

Year 3: 100,000 users
  - 3 regions (US, EU, Asia)
  - 50 API servers
  - Sharded database
  - CDN in all regions
  - Cost: ~$10,000/month
```

---

## 11. Development Roadmap

### Phase 0: Foundation (Week 1-2)
- [ ] Set up infrastructure (AWS/Railway)
- [ ] Database schema + migrations
- [ ] Authentication system (JWT)
- [ ] Basic CRUD APIs
- [ ] CI/CD pipeline
- [ ] Monitoring setup

### Phase 1: MVP (Week 3-4)
- [ ] User registration/login
- [ ] Job management
- [ ] Skills analysis
- [ ] Resume input
- [ ] 1-2 optimization strategies
- [ ] Basic frontend
- [ ] Stripe integration (free tier only)

### Phase 2: Full Features (Week 5-7)
- [ ] All 7 strategies
- [ ] Strategy comparison
- [ ] Cost calculator
- [ ] Email notifications
- [ ] Paid tiers (Pro)
- [ ] Usage tracking
- [ ] Export functionality

### Phase 3: Admin & Polish (Week 8-10)
- [ ] Admin panel
- [ ] User management
- [ ] AI model management
- [ ] Analytics dashboard
- [ ] Activity logs
- [ ] Performance optimization
- [ ] Security audit

### Phase 4: Growth (Week 11-12)
- [ ] Enterprise tier
- [ ] BYOK support
- [ ] Advanced analytics
- [ ] Email marketing integration
- [ ] Referral program
- [ ] API documentation (public)

---

## 12. Open Questions & Decisions Needed

### 12.1 Critical Decisions (Need Answer Before Development)

1. **Hosting Provider?**
   - Option A: AWS (full control, complex)
   - Option B: Railway/Render (easy, less control)
   - **Recommendation:** Railway for MVP, migrate to AWS later

2. **Authentication Provider?**
   - Option A: Auth0 ($25/month, easy)
   - Option B: Supabase Auth (free, good DX)
   - Option C: Custom JWT (free, more work)
   - **Recommendation:** Supabase Auth (free + database included)

3. **AI Key Management?**
   - Option A: Platform keys (easier UX)
   - Option B: BYOK (user responsibility)
   - Option C: Hybrid (both options)
   - **Recommendation:** Hybrid - Platform keys for Free, BYOK for Pro+

4. **Frontend Deployment?**
   - Option A: Vercel (easy, $0-20/month)
   - Option B: Cloudflare Pages (free, fast)
   - Option C: AWS S3 + CloudFront (control, complex)
   - **Recommendation:** Vercel for MVP

5. **Email Provider?**
   - Option A: Resend (modern, $0-20/month)
   - Option B: SendGrid (established, free tier)
   - **Recommendation:** Resend

### 12.2 Business Decisions

6. **Free Tier Strategy?**
   - How many free optimizations?
   - Watermark on free optimizations?
   - Time-limited trial vs. permanent free tier?

7. **Pricing Strategy?**
   - $29/month too high/low for Pro?
   - Offer annual discount (e.g., 20% off)?
   - Usage-based pricing option?

8. **GTM Strategy?**
   - Launch on Product Hunt?
   - Target audience: Software engineers only or broader?
   - Content marketing budget?

---

## 13. Security Checklist

- [ ] HTTPS everywhere (HSTS)
- [ ] JWT with short expiration (15 min)
- [ ] Refresh token rotation
- [ ] Rate limiting on all endpoints
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention (sanitization)
- [ ] CSRF protection (SameSite cookies)
- [ ] API key encryption (AES-256 + KMS)
- [ ] Row-level security (PostgreSQL RLS)
- [ ] Audit logging
- [ ] Secrets in env vars (never in code)
- [ ] Dependency scanning (Dependabot)
- [ ] Container scanning
- [ ] Penetration testing (before launch)
- [ ] GDPR compliance (data export, deletion)
- [ ] Privacy policy + ToS
- [ ] Cookie consent banner
- [ ] Email verification required
- [ ] Account lockout (5 failed attempts)
- [ ] Password requirements (min 12 chars, complexity)

---

## 14. Cost Estimates

### Development Costs
```
Infrastructure (MVP - 3 months):
  - Railway/Render: $60/month × 3 = $180
  - Vercel: $20/month × 3 = $60
  - Supabase: $0 (free tier)
  - Total: $240

Third-Party Services (MVP):
  - Stripe: $0 (pay as you go)
  - Resend: $0 (free tier)
  - Sentry: $0 (free tier)
  - PostHog: $0 (free tier)
  - Total: $0

Development (Contractor/Agency):
  - Backend Developer: $100/hr × 200 hrs = $20,000
  - Frontend Developer: $100/hr × 150 hrs = $15,000
  - DevOps: $100/hr × 50 hrs = $5,000
  - Total: $40,000

OR (Solo Developer):
  - Full-stack: ~400 hours @ $75/hr = $30,000
  - Timeline: 10-12 weeks

Total MVP Cost: $30,000 - $40,000
```

### Operating Costs (First Year)
```
Infrastructure:
  - Months 1-6 (low usage): $100/month
  - Months 7-12 (growth): $300/month
  - Total: $2,400

Third-Party:
  - Stripe fees (assume $10K revenue): $300
  - Email (1000 users): $200
  - Monitoring: $500
  - Total: $1,000

Total Year 1 Operating: ~$3,500
```

### Break-Even Analysis
```
Assumptions:
  - Pro tier: $29/month
  - Conversion rate: 5%
  - Operating costs: $500/month

Users needed to break even:
  - 1000 users × 5% = 50 paid users
  - 50 × $29 = $1,450/month revenue
  - Break-even at ~500 users (25 paid)
  - Profit at 1000+ users

Timeline: 6-12 months to break even
```

---

**This architecture is production-ready, secure, and scalable.**

Ready to proceed with implementation?
