# PRD Addendum - SaaS Requirements
**Version:** 2.0
**Date:** November 28, 2025
**Status:** Ready for Development

**This document supplements the original PRD (README.md) with SaaS-specific requirements.**

---

## 1. Architecture Changes

### 1.1 From Client-Side to Full-Stack SaaS

**CRITICAL CHANGE:** The application architecture has been updated from a client-side-only app to a full-stack SaaS platform.

**Original Architecture (DEPRECATED):**
```
❌ Browser Storage Only
❌ Client-side API key storage
❌ No backend server
❌ No real multi-tenancy
```

**New Architecture (SaaS):**
```
✅ Backend API (Node.js/TypeScript)
✅ PostgreSQL database
✅ Redis cache + queue
✅ Secure API key management
✅ True multi-tenancy with data isolation
✅ Background job processing
✅ Subscription billing
```

### 1.2 Updated Technology Stack

**REPLACES Section 5.1 in original PRD:**

```yaml
Frontend:
  - React 18.3+ with TypeScript
  - Vite build tool
  - Zustand state management
  - React Router v6
  - Tailwind CSS 3.4+
  - Recharts 2.10+
  - Axios for API calls
  - React Hook Form + Zod

Backend:
  - Node.js 20 LTS
  - Express.js or Fastify
  - TypeScript 5.3+
  - Prisma ORM
  - JWT authentication
  - BullMQ for background jobs

Database:
  - PostgreSQL 16+ (primary)
  - Redis 7+ (cache/queue)

Hosting:
  - Frontend: Vercel / Cloudflare Pages
  - Backend: Railway / Render (MVP) → AWS ECS (scale)
  - Database: Managed PostgreSQL (Supabase / AWS RDS)
  - Redis: Upstash / AWS ElastiCache

Third-Party:
  - Auth: Supabase Auth / Auth0
  - Payments: Stripe
  - Email: Resend
  - Monitoring: Sentry + PostHog
```

---

## 2. Updated Security Requirements

### 2.1 Authentication & Authorization

**REPLACES Section 4.1 in original PRD:**

#### FR-AUTH-001: Email/Password Authentication
- System shall support email and password registration
- Passwords must be hashed with bcrypt (cost factor: 12)
- Passwords must meet minimum requirements:
  - Minimum 12 characters
  - At least 1 uppercase, 1 lowercase, 1 number, 1 special character

#### FR-AUTH-002: Email Verification
- System shall send verification email upon registration
- Users cannot access full features until email is verified
- Verification links expire after 24 hours

#### FR-AUTH-003: JWT-Based Sessions
- System shall issue JWT access tokens (15-minute expiration)
- System shall issue refresh tokens (7-day expiration)
- Access tokens stored in memory (React state)
- Refresh tokens stored in httpOnly cookies

#### FR-AUTH-004: OAuth Support (Phase 2)
- System shall support "Sign in with Google"
- System shall support "Sign in with GitHub"
- OAuth users bypass password requirements

#### FR-AUTH-005: Account Security
- System shall lock account after 5 failed login attempts
- Lockout duration: 30 minutes
- System shall send email notification on lockout

#### FR-AUTH-006: Password Reset
- System shall provide "Forgot Password" flow
- Reset links sent via email
- Reset links expire after 1 hour
- Old password immediately invalidated

#### FR-AUTH-007: Session Management
- System shall allow users to view active sessions
- System shall allow users to revoke sessions
- System shall automatically invalidate sessions on password change

### 2.2 API Key Security

**REPLACES Section 4.4.2 in original PRD:**

#### FR-SECURITY-001: Server-Side Key Storage
- API keys SHALL be stored on backend server only
- API keys SHALL be encrypted using AES-256-GCM
- Encryption keys SHALL be managed via AWS KMS or HashiCorp Vault
- API keys SHALL NEVER be transmitted to frontend

#### FR-SECURITY-002: Key Management Models
**Platform Keys (Free Tier):**
- Platform provides API keys for AI providers
- Users consume from shared quota pool
- Platform marks up costs by 20%

**BYOK (Pro/Enterprise):**
- Users provide their own API keys
- Keys encrypted per user with unique data encryption key (DEK)
- Users billed at actual cost (no markup)

#### FR-SECURITY-003: Key Validation
- System shall validate API keys before storing
- System shall test key with minimal API call
- System shall reject invalid keys with clear error message

#### FR-SECURITY-004: Key Rotation
- System shall support key rotation without service interruption
- Old keys remain valid for 24 hours after new key added
- System shall notify user of successful rotation

### 2.3 Data Security

#### FR-SECURITY-005: Row-Level Security
- PostgreSQL Row-Level Security (RLS) enabled on all user tables
- Users can only access their own data via database policies
- Admin role has bypass policy for management tasks

#### FR-SECURITY-006: Data Encryption
- All data encrypted in transit (TLS 1.3)
- All data encrypted at rest (AES-256)
- Database backups encrypted with separate key

#### FR-SECURITY-007: GDPR Compliance
- Users can export all their data (JSON format)
- Users can delete their account and all associated data
- Deletion is permanent and cascades to all related records
- System provides data processing transparency (privacy policy)

#### FR-SECURITY-008: Audit Logging
- System shall log all security-relevant events:
  - Login attempts (success and failure)
  - Password changes
  - API key changes
  - Account deletions
  - Admin actions
  - Data exports
- Logs retained for 1 year minimum

---

## 3. Billing & Subscription Requirements

### 3.1 Subscription Tiers

#### FR-BILLING-001: Free Tier
- **Price:** $0/month
- **Optimizations:** 10/month
- **Jobs:** Unlimited storage
- **Strategies:** Quick Optimize, Budget Optimizer only
- **AI Models:** Groq, DeepSeek only
- **Support:** Email (community support)
- **Data Retention:** 6 months
- **API Keys:** Platform-provided only

#### FR-BILLING-002: Pro Tier
- **Price:** $29/month
- **Optimizations:** 100/month
- **Jobs:** Unlimited storage
- **Strategies:** All 7 strategies
- **AI Models:** All providers
- **API Keys:** Platform OR BYOK (user choice)
- **Support:** Email (24-48 hour response)
- **Data Retention:** 2 years
- **Export:** Unlimited
- **Priority Processing:** 2x faster queue priority

#### FR-BILLING-003: Enterprise Tier
- **Price:** $199/month
- **Optimizations:** Unlimited
- **Jobs:** Unlimited storage
- **Strategies:** All + custom strategy builder
- **AI Models:** All + ability to add custom models
- **API Keys:** BYOK required
- **Support:** Priority (4-hour response) + Slack channel
- **Data Retention:** Unlimited
- **Dedicated Resources:** Isolated processing queue
- **SLA:** 99.9% uptime guarantee
- **SSO:** SAML support
- **Custom Integrations:** API access for custom workflows

### 3.2 Stripe Integration

#### FR-BILLING-004: Payment Processing
- System shall use Stripe for all payment processing
- System shall support credit/debit cards
- System shall support ACH (US only) for Enterprise
- System shall store Stripe customer ID with user record

#### FR-BILLING-005: Subscription Management
- Users shall be able to upgrade/downgrade anytime
- Upgrades take effect immediately
- Downgrades take effect at end of billing period
- Prorated charges calculated automatically by Stripe

#### FR-BILLING-006: Billing History
- Users shall view all past invoices
- Users shall download invoices as PDF
- System shall send invoice receipts via email
- Invoices include itemized usage (if applicable)

#### FR-BILLING-007: Payment Failures
- System shall retry failed payments (Stripe default: 4 attempts over 2 weeks)
- System shall send email notification on payment failure
- System shall downgrade to free tier after final failed attempt
- User data preserved for 30 days after downgrade

#### FR-BILLING-008: Cancellation
- Users shall be able to cancel subscription anytime
- Access continues until end of billing period
- System shall send cancellation confirmation email
- System shall request cancellation feedback (optional survey)

### 3.3 Usage Tracking

#### FR-BILLING-009: Quota Enforcement
- System shall track optimization count per user per month
- System shall block optimizations when quota exceeded
- System shall display clear error message with upgrade CTA
- Quota resets on billing cycle anniversary

#### FR-BILLING-010: Usage Dashboard
- Users shall view current usage (X/100 optimizations)
- Users shall view usage history (chart of past 6 months)
- Users shall view cost breakdown by strategy
- Users shall view projected usage/cost for current month

#### FR-BILLING-011: Overage Handling (Enterprise)
- Enterprise customers can exceed unlimited quota
- System shall warn at unusual usage spikes (10x normal)
- System shall not block legitimate usage
- Manual review for abuse prevention

---

## 4. Backend API Requirements

### 4.1 API Design Principles

#### FR-API-001: RESTful API
- All endpoints follow REST conventions
- Consistent HTTP methods (GET, POST, PATCH, DELETE)
- Consistent response format (JSON)
- API versioning via URL path (/api/v1/)

#### FR-API-002: Error Handling
- All errors return consistent JSON structure:
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Job description cannot be empty",
    "field": "description"
  }
}
```
- HTTP status codes used correctly:
  - 200: Success
  - 201: Created
  - 400: Bad request (client error)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 429: Rate limited
  - 500: Server error

#### FR-API-003: Rate Limiting
- Free tier: 100 requests/hour
- Pro tier: 1000 requests/hour
- Enterprise: 10,000 requests/hour
- Rate limit headers included in all responses:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

#### FR-API-004: Request Validation
- All input validated with Zod schemas
- Request size limited to 10MB
- SQL injection prevention (ORM + parameterized queries)
- XSS prevention (input sanitization)

#### FR-API-005: Response Optimization
- Pagination for list endpoints (default: 50 items)
- Field selection support (?fields=id,title)
- Response compression (gzip)
- ETags for caching

### 4.2 Background Job Processing

#### FR-JOBS-001: Async Optimization
- Optimizations run in background queue (BullMQ)
- API immediately returns job ID
- Client polls for status updates
- Optimization timeout: 5 minutes maximum

#### FR-JOBS-002: Job Priority
- Free tier: Low priority
- Pro tier: Medium priority
- Enterprise: High priority
- Priority affects queue position, not quality

#### FR-JOBS-003: Job Status
- Status values: pending, processing, completed, failed, cancelled
- Users can view real-time progress
- Users can cancel in-progress jobs
- Failed jobs can be retried (max 3 attempts)

#### FR-JOBS-004: Job Result Storage
- Completed optimizations stored indefinitely (per tier data retention)
- Failed jobs store error message for debugging
- Job metadata includes: strategy, cost, time, tokens used

#### FR-JOBS-005: Email Notifications
- Send email when optimization completes
- Send email if optimization fails
- Users can opt out of notifications
- Emails include optimization summary + link to view

---

## 5. Admin Panel Requirements

### 5.1 User Management

**UPDATES Section 4.7.2 in original PRD (now server-backed):**

#### FR-ADMIN-USER-001: User List
- Admins shall view paginated list of all users
- List shows: email, tier, signup date, last login, status
- List supports sorting by any column
- List supports filtering by tier, status, signup date

#### FR-ADMIN-USER-002: User Search
- Admins shall search users by email or name
- Search supports partial matching
- Search results highlighted

#### FR-ADMIN-USER-003: User Details
- Admins shall view full user profile
- Profile shows: all account details, usage statistics, billing history
- Profile shows: job count, resume count, optimization count
- Profile shows: total spend, current quota, API keys configured

#### FR-ADMIN-USER-004: User Modification
- Admins can change user tier manually (override Stripe)
- Admins can reset user password (sends reset email)
- Admins can reset monthly quota
- Admins can add notes to user account

#### FR-ADMIN-USER-005: User Impersonation
- Admins can impersonate users (for support)
- Impersonation logged in audit trail
- Impersonation shown clearly in UI (banner)
- Admins can exit impersonation anytime

#### FR-ADMIN-USER-006: User Deletion
- Admins can delete user accounts
- Deletion requires confirmation with typed email
- Deletion cascades to all user data
- Deletion logged in audit trail
- Option to export user data before deletion

### 5.2 AI Model Management

#### FR-ADMIN-AI-001: Model Configuration
- Admins can add new AI provider integrations
- Admins can edit existing model configurations
- Admins can enable/disable models
- Changes take effect immediately for all users

#### FR-ADMIN-AI-002: Model Testing
- Admins can test model connections
- Test sends minimal API call (e.g., "Say hello")
- Test validates API endpoint, auth, response format
- Test results shown in UI (success/failure + response time)

#### FR-ADMIN-AI-003: Cost Configuration
- Admins can update cost per 1K tokens
- Cost updates affect future optimizations only
- Historical costs remain unchanged
- Cost changes logged in audit trail

#### FR-ADMIN-AI-004: Platform Keys
- Admins can configure platform-provided API keys
- Platform keys used for free tier users
- Platform keys rotated regularly (30-day schedule)
- Usage tracked separately per platform key

### 5.3 Analytics & Reporting

#### FR-ADMIN-ANALYTICS-001: Dashboard
- Display key metrics:
  - Total users (by tier)
  - Daily/weekly/monthly active users
  - New signups (trend chart)
  - MRR (monthly recurring revenue)
  - Churn rate
  - Optimizations processed (trend chart)
  - Average cost per optimization
  - Most popular strategies

#### FR-ADMIN-ANALYTICS-002: Financial Reports
- Total revenue (Stripe sync)
- Revenue by tier
- Conversion rate (free → pro)
- Lifetime value (LTV) per customer
- Cost of AI API usage
- Profit margin

#### FR-ADMIN-ANALYTICS-003: Usage Reports
- Optimizations by strategy
- Optimizations by AI provider
- Average tokens per optimization
- Failed optimization rate
- Queue depth over time

#### FR-ADMIN-ANALYTICS-004: Export Reports
- All reports exportable as CSV
- Date range selection
- Scheduled reports (email weekly/monthly)

### 5.4 Activity Logs

#### FR-ADMIN-LOGS-001: Event Logging
- System logs all important events:
  - User registrations
  - Login attempts
  - Password changes
  - Subscription changes
  - Optimizations (start, complete, fail)
  - Admin actions
  - API errors
  - Security events (lockouts, suspicious activity)

#### FR-ADMIN-LOGS-002: Log Viewing
- Admins can view logs in paginated table
- Logs show: timestamp, user, event type, description, IP, user agent
- Logs color-coded by severity (info, warning, error)

#### FR-ADMIN-LOGS-003: Log Filtering
- Filter by date range
- Filter by user
- Filter by event type
- Filter by severity
- Full-text search in log messages

#### FR-ADMIN-LOGS-004: Log Retention
- Logs retained for 1 year
- Older logs archived to S3
- Archived logs searchable (slower)

---

## 6. Error Handling & Resilience

### 6.1 AI Provider Errors

#### FR-ERROR-001: Rate Limit Handling
- Detect rate limit errors (HTTP 429)
- Implement exponential backoff (1s, 2s, 4s, 8s)
- Max retry attempts: 3
- Show clear error message to user
- Suggest trying again later or switching provider

#### FR-ERROR-002: Timeout Handling
- API call timeout: 60 seconds
- Retry on timeout: 1 time only
- Show error message with retry option
- Allow user to cancel and try different strategy

#### FR-ERROR-003: Invalid API Key
- Detect invalid API key errors (HTTP 401)
- Mark API key as invalid in database
- Send email notification to user
- Show error in UI with link to update key

#### FR-ERROR-004: Model Deprecation
- Detect model deprecation errors
- Log deprecation event
- Automatically switch to recommended replacement model
- Notify admins of required configuration update

#### FR-ERROR-005: Provider Downtime
- Detect provider downtime (HTTP 5xx, network errors)
- Retry with exponential backoff
- If all retries fail, offer alternative provider
- Track downtime in monitoring system

### 6.2 System Errors

#### FR-ERROR-006: Database Failures
- Implement connection pooling with retry logic
- Graceful degradation (show cached data if available)
- Circuit breaker pattern for repeated failures
- Alert admins immediately

#### FR-ERROR-007: Queue Failures
- Dead letter queue for failed jobs
- Manual retry option for admins
- Automatic retry for transient errors (3 attempts)
- Notify user of permanent failures

#### FR-ERROR-008: Payment Failures
- Retry failed payments automatically (Stripe handles)
- Send email on first failure (update payment method)
- Send final warning before service downgrade
- Preserve user data for 30 days after downgrade

---

## 7. Performance Requirements

### 7.1 Response Time Targets

**UPDATES Section 5.2 in original PRD:**

#### NFR-PERF-001: API Response Time
- P50 (median): < 200ms
- P95: < 500ms
- P99: < 1000ms
- Excludes AI optimization calls (long-running)

#### NFR-PERF-002: Database Queries
- Simple queries (by ID): < 10ms
- Complex queries (joins, aggregations): < 100ms
- Full-text search: < 200ms

#### NFR-PERF-003: Page Load Time
- Initial load (uncached): < 2 seconds
- Subsequent loads (cached): < 500ms
- Time to interactive: < 3 seconds

#### NFR-PERF-004: Background Jobs
- Job pickup latency: < 5 seconds
- Quick Optimize strategy: < 30 seconds total
- Premium strategies: < 2 minutes total

### 7.2 Scalability Targets

#### NFR-SCALE-001: Concurrent Users
- Support 1,000 concurrent users (Year 1)
- Support 10,000 concurrent users (Year 2)
- Auto-scaling triggers at 70% CPU usage

#### NFR-SCALE-002: Data Volume
- Support 1,000 jobs per user
- Support 10,000 total users (Year 1)
- Support 100,000 total users (Year 2)

#### NFR-SCALE-003: Queue Throughput
- Process 100 optimizations/minute minimum
- Scale to 1,000 optimizations/minute at peak

---

## 8. Monitoring & Observability

### 8.1 Application Monitoring

#### NFR-MONITOR-001: Error Tracking
- All errors sent to Sentry
- Errors include stack trace, user context, breadcrumbs
- Error grouping by type and message
- Alert on new error types

#### NFR-MONITOR-002: Performance Monitoring
- Track API endpoint response times
- Track database query performance
- Track AI provider response times
- Identify slow endpoints for optimization

#### NFR-MONITOR-003: Uptime Monitoring
- External uptime monitoring (UptimeRobot)
- Check every 5 minutes
- Alert on downtime > 2 minutes
- Track historical uptime (99.9% target)

#### NFR-MONITOR-004: Business Metrics
- Track daily active users (DAU)
- Track signups per day
- Track conversions (free → paid)
- Track MRR growth

### 8.2 Alerting

#### NFR-ALERT-001: Critical Alerts
- Send to PagerDuty/OpsGenie
- Alert on:
  - API error rate > 5%
  - Database down
  - Redis down
  - API response time p99 > 5s
  - Disk usage > 90%

#### NFR-ALERT-002: Warning Alerts
- Send to Slack #alerts channel
- Alert on:
  - Error rate > 1%
  - API response time p95 > 2s
  - Queue depth > 100
  - AI provider failures > 10%

#### NFR-ALERT-003: Info Alerts
- Send to email
- Daily summary report
- Weekly business metrics
- Monthly financial report

---

## 9. Compliance & Legal

### 9.1 Data Privacy

#### FR-COMPLIANCE-001: Privacy Policy
- System shall display privacy policy
- Privacy policy accepted during signup
- Privacy policy covers:
  - What data is collected
  - How data is used
  - Data retention periods
  - User rights (access, deletion)
  - Contact information

#### FR-COMPLIANCE-002: Terms of Service
- System shall display terms of service
- Terms accepted during signup
- Terms cover:
  - Service description
  - User responsibilities
  - Payment terms
  - Cancellation policy
  - Limitation of liability
  - Dispute resolution

#### FR-COMPLIANCE-003: Cookie Consent
- System shall display cookie consent banner (EU users)
- Users can accept/reject non-essential cookies
- Cookie policy explains all cookies used

#### FR-COMPLIANCE-004: GDPR Rights
- **Right to Access:** Users can export all their data
- **Right to Rectification:** Users can edit their data
- **Right to Erasure:** Users can delete their account
- **Right to Portability:** Export in JSON format
- **Right to Object:** Users can opt out of marketing emails

#### FR-COMPLIANCE-005: Data Retention
- User account data: Retained until deletion
- Activity logs: 1 year
- Deleted accounts: 30-day grace period, then permanent
- Backups: 30-day retention

### 9.2 Security Compliance

#### FR-COMPLIANCE-006: Encryption Standards
- TLS 1.3 for data in transit
- AES-256 for data at rest
- Bcrypt (cost 12) for passwords

#### FR-COMPLIANCE-007: Audit Trail
- All security events logged
- Logs tamper-proof (append-only)
- Logs include: timestamp, user, action, IP, result

#### FR-COMPLIANCE-008: Vulnerability Management
- Dependency scanning (Dependabot)
- Container scanning (before deployment)
- Penetration testing (annually)
- Responsible disclosure program

---

## 10. Deployment & Infrastructure

### 10.1 Environments

#### FR-DEPLOY-001: Development Environment
- Local development with Docker Compose
- Seeded database with test data
- Hot reload enabled
- Debug mode enabled

#### FR-DEPLOY-002: Staging Environment
- Production-like environment
- Auto-deploy from `develop` branch
- Used for QA testing
- Stripe test mode
- Separate database (not production)

#### FR-DEPLOY-003: Production Environment
- Auto-deploy from `main` branch (after approval)
- Health checks before traffic routing
- Zero-downtime deployments (rolling update)
- Database migrations run automatically
- Rollback capability (keep 3 previous versions)

### 10.2 CI/CD Pipeline

#### FR-DEPLOY-004: Automated Testing
- Unit tests run on every commit
- Integration tests run on every PR
- E2E tests run before production deployment
- Code coverage target: 80%

#### FR-DEPLOY-005: Deployment Checks
- All tests must pass
- No critical security vulnerabilities
- Performance benchmarks met
- Manual approval required for production

#### FR-DEPLOY-006: Rollback Strategy
- One-click rollback to previous version
- Database migrations reversible (down migrations)
- Rollback tested in staging regularly

### 10.3 Backup & Disaster Recovery

#### FR-DEPLOY-007: Database Backups
- Automated daily backups (3 AM UTC)
- Backups retained for 30 days
- Backups encrypted and stored in S3
- Backup restoration tested monthly

#### FR-DEPLOY-008: Disaster Recovery Plan
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours
- Documented runbook for major incidents
- Tested twice per year

---

## 11. Updated Open Questions

**REPLACES Section 11 in original PRD:**

### 11.1 RESOLVED Questions

1. ✅ **Authentication:** JWT-based with email/password + OAuth (Google, GitHub)
2. ✅ **Storage:** PostgreSQL backend with proper multi-tenancy
3. ✅ **API Keys:** Hybrid model (Platform keys for Free, BYOK for Pro+)
4. ✅ **Hosting:** Railway/Render for MVP → AWS for scale

### 11.2 NEW Questions for Decision

1. **Launch Strategy?**
   - Beta launch with limited users (100)?
   - Public launch on Product Hunt?
   - Invite-only for first month?

2. **Free Tier Limitations?**
   - 10 optimizations/month sufficient?
   - Require credit card for free tier? (reduces abuse)
   - Watermark on free optimizations?

3. **Content Strategy?**
   - Blog for SEO?
   - Video tutorials?
   - Case studies / testimonials?

4. **Support Strategy?**
   - Live chat (expensive)?
   - Discord community (free)?
   - Knowledge base / FAQ?

5. **Geographic Launch?**
   - US only initially?
   - Global from day 1?
   - EU compliance (GDPR) from start?

6. **Referral Program?**
   - Give 1 free month for successful referral?
   - Implement in Phase 1 or later?

---

## 12. Updated Development Phases

### Phase 0: Infrastructure Setup
**Timeline:** 2 weeks

- [ ] Set up Railway/Render hosting
- [ ] PostgreSQL + Redis provisioning
- [ ] GitHub repo + CI/CD pipeline
- [ ] Domain + SSL setup
- [ ] Monitoring setup (Sentry, PostHog)
- [ ] Email provider setup (Resend)

### Phase 1: Core Backend
**Timeline:** 3 weeks

- [ ] Database schema + migrations (Prisma)
- [ ] Authentication system (Supabase Auth or custom JWT)
- [ ] User CRUD APIs
- [ ] Job CRUD APIs
- [ ] Skills analysis engine
- [ ] Resume CRUD APIs
- [ ] AI proxy layer (1-2 providers)
- [ ] Basic optimization (Quick Optimize strategy)
- [ ] Background job queue (BullMQ)

### Phase 2: Frontend MVP
**Timeline:** 3 weeks

- [ ] React app setup (Vite + TypeScript)
- [ ] Authentication UI (login, register, forgot password)
- [ ] Dashboard layout
- [ ] Job management UI
- [ ] Skills analysis visualization
- [ ] Resume input UI
- [ ] Optimization UI (start, view progress, results)
- [ ] User settings

### Phase 3: Billing Integration
**Timeline:** 2 weeks

- [ ] Stripe setup (products, prices)
- [ ] Subscription APIs
- [ ] Webhook handling
- [ ] Pricing page
- [ ] Checkout flow
- [ ] Billing dashboard
- [ ] Quota enforcement

### Phase 4: Full Strategies
**Timeline:** 2 weeks

- [ ] Implement all 7 optimization strategies
- [ ] Strategy comparison tool
- [ ] Cost estimation improvements
- [ ] Email notifications
- [ ] Export functionality

### Phase 5: Admin Panel
**Timeline:** 2 weeks

- [ ] Admin authentication/authorization
- [ ] User management UI
- [ ] AI model management UI
- [ ] Analytics dashboard
- [ ] Activity logs viewer

### Phase 6: Polish & Launch
**Timeline:** 2 weeks

- [ ] Performance optimization
- [ ] Security audit
- [ ] E2E testing
- [ ] Documentation (user guides, API docs)
- [ ] Marketing site
- [ ] Beta testing with 20-50 users
- [ ] Bug fixes
- [ ] Launch preparation (Product Hunt, socials)

**Total Timeline:** ~16 weeks (4 months)

---

## 13. Success Metrics (Updated)

### 13.1 Launch Metrics (First 3 Months)

- **User Acquisition:**
  - 1,000 signups
  - 50 paying customers (5% conversion)
  - $1,500 MRR

- **Engagement:**
  - 40% weekly active users (WAU)
  - Average 5 jobs per user
  - Average 3 optimizations per user

- **Product Quality:**
  - 99.5% uptime
  - < 1% error rate
  - < 2 second page load time

### 13.2 Year 1 Goals

- **Revenue:**
  - 10,000 total users
  - 500 paying customers (5% conversion)
  - $15,000 MRR ($180K ARR)

- **Product:**
  - All 7 strategies live
  - Admin panel fully functional
  - 5+ AI providers supported

- **Operations:**
  - 99.9% uptime SLA
  - < 0.5% error rate
  - Break-even on operating costs

---

## 14. Cost Estimates (Updated)

### 14.1 Development Investment

```
Solo Developer (Recommended):
  - 640 hours @ $75/hr = $48,000
  - Timeline: 16 weeks (full-time)

Small Team:
  - Backend Developer: 320 hrs @ $100/hr = $32,000
  - Frontend Developer: 240 hrs @ $100/hr = $24,000
  - DevOps: 80 hrs @ $100/hr = $8,000
  - Total: $64,000
  - Timeline: 12 weeks (parallel work)

Offshore Team (Budget Option):
  - Full-stack Developer: 640 hrs @ $40/hr = $25,600
  - Timeline: 16 weeks
  - Risk: Quality, communication overhead
```

### 14.2 Monthly Operating Costs

```
Infrastructure (MVP - First 6 months):
  - Railway/Render: $50/month
  - Vercel: $20/month
  - Supabase: $25/month
  - Upstash Redis: $10/month
  - Total: $105/month

Third-Party Services:
  - Stripe: 2.9% + $0.30 per transaction (~$50/month @ $1500 MRR)
  - Resend: $20/month (10K emails)
  - Sentry: $0 (free tier)
  - PostHog: $0 (free tier)
  - Domain: $1/month
  - Total: $71/month

AI Costs (Platform Keys):
  - Subsidize free users: ~$100/month
  - Pro users (BYOK): $0

Total Monthly: ~$276/month

Year 1 Total: ~$3,300
```

### 14.3 Break-Even Analysis

```
Monthly Operating Costs: $276
Break-Even Revenue: $276/month

Scenarios:
  1. All Free Tier (10 paid @ $29): 10 customers = $290/month ✅
  2. Mixed (7 Pro + 1 Enterprise): 8 customers = $402/month ✅
  3. Target (50 paid users): $1,450/month = $1,174 profit 💰

Conclusion: Break-even at ~10 paying customers
Expected timeline: 1-2 months after launch
```

---

## 15. Risk Mitigation (Updated)

### 15.1 Technical Risks - MITIGATED

| Original Risk | Original Impact | Mitigation Applied |
|--------------|-----------------|-------------------|
| API keys exposed in browser | **CRITICAL** | ✅ Server-side encryption with KMS |
| No real multi-tenancy | **HIGH** | ✅ PostgreSQL RLS + proper backend |
| Browser storage limits | **HIGH** | ✅ PostgreSQL database |
| Impossible admin features | **HIGH** | ✅ Backend server with proper auth |

### 15.2 New SaaS-Specific Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| High infrastructure costs | Medium | Medium | Start with Railway, optimize, use free tiers |
| Payment processing issues | High | Low | Stripe handles most edge cases, monitor webhooks |
| GDPR compliance violation | Critical | Low | Implement all GDPR requirements from start |
| AI provider price increases | Medium | Medium | Support multiple providers, allow users to switch |
| Slow customer acquisition | High | Medium | Content marketing, Product Hunt launch, referrals |
| Churn rate too high | High | Medium | Focus on product quality, user onboarding, support |

---

## 16. Final Checklist Before Development

### 16.1 Critical Decisions Made
- [x] Architecture: Full-stack SaaS with PostgreSQL backend
- [x] Authentication: JWT + Supabase Auth
- [x] Hosting: Railway (MVP) → AWS (scale)
- [x] Payments: Stripe
- [x] Email: Resend
- [x] Monitoring: Sentry + PostHog

### 16.2 Documents Completed
- [x] Architecture document (ARCHITECTURE.md)
- [x] PRD SaaS Addendum (this document)
- [ ] Privacy Policy (required before launch)
- [ ] Terms of Service (required before launch)
- [ ] API Documentation (Phase 3)

### 16.3 Ready to Start?
- [x] Requirements finalized
- [x] Architecture designed
- [x] Tech stack selected
- [x] Budget approved ($48K dev + $3.3K/yr ops)
- [ ] Designer hired/contracted (optional for MVP)
- [ ] Developer allocated (16 weeks)

---

**Status: ✅ READY FOR DEVELOPMENT**

This PRD Addendum, combined with the original PRD (README.md) and the Architecture document (ARCHITECTURE.md), provides a complete specification for building Job Analyzer Pro as a production SaaS platform.

**Next Step:** Begin Phase 0 (Infrastructure Setup) 🚀
