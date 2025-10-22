# Project Constitution - NutriPilot Quality Standards

**Last Updated:** 2025-10-22  
**Status:** Active  
**Applies To:** All code in this repository

---

## Purpose

This document defines the quality standards, coding practices, and architectural principles for NutriPilot. All code—whether written by humans or AI agents—must comply with these standards.

---

## Core Principles

### 1. Simplicity Over Cleverness
- Prefer readable code over "clever" code
- If it needs a comment to explain, it's too complex
- Future you (or your team) must understand it in 6 months

### 2. Explicit Over Implicit
- No magic numbers or strings
- Configuration should be in one place
- Dependencies should be clear

### 3. Fail Fast and Loud
- Validate inputs immediately
- Throw errors with context
- Never silently ignore errors

### 4. Document Decisions, Not Code
- Code comments explain "why", not "what"
- Architecture decisions go in docs/decisions/
- Complex algorithms need explanation

---

## Code Quality Standards

### Function Complexity

**Maximum function length:** 50 lines
- **Why:** Longer functions are hard to test and understand
- **Exception:** Test files can have longer functions if needed
- **Measurement:** Lines of code, excluding comments and whitespace

**Maximum complexity:** 10 (cyclomatic complexity)
- **Why:** High complexity = more bugs
- **Tool:** ESLint complexity rule
- **Action if exceeded:** Refactor into smaller functions

**Maximum nesting depth:** 3 levels
- **Why:** Deep nesting is hard to follow
- **Example:** if → for → if is 3 levels (acceptable)
- **Action if exceeded:** Extract to helper functions

### Naming Conventions

**Variables:**
```javascript
// ✅ GOOD - Descriptive
const userEmail = 'user@example.com';
const isAuthenticated = true;
const totalProteinGrams = 150;
const dailyMacroTarget = { protein: 150, carbs: 200, fats: 60 };

// ❌ BAD - Vague or abbreviated
const e = 'user@example.com';
const flag = true;
const tot = 150;
```

**Functions:**
```javascript
// ✅ GOOD - Verb + noun, describes action
function calculateDailyProteinTarget(bodyWeight, goals) { }
function validateMealInput(mealData) { }
function fetchUserProfile(userId) { }
function analyzeMealQuality(macros, targets) { }

// ❌ BAD - Vague or noun-only
function process(data) { }
function handler() { }
function user() { }
```

**Constants:**
```javascript
// ✅ GOOD - ALL_CAPS for true constants
const MAX_PROTEIN_PER_MEAL = 50;
const API_BASE_URL = 'https://api.nutripilot.com';
const DEFAULT_TIMEOUT_MS = 5000;
const MACRO_CALCULATION_MULTIPLIER = 1.2;

// ❌ BAD - camelCase for constants
const maxProtein = 50;
```

**Boolean variables:** Must start with `is`, `has`, `should`, or `can`
```javascript
// ✅ GOOD
const isLoading = true;
const hasMetDailyTarget = false;
const shouldShowWarning = true;
const canEditMeal = false;

// ❌ BAD
const loading = true;
const metTarget = false;
```

### Documentation Requirements

**All public functions require JSDoc:**
```javascript
/**
 * Calculates daily protein target based on body weight and goals.
 * 
 * @param {number} bodyWeightKg - User's body weight in kilograms
 * @param {string} goal - 'bulk', 'maintain', or 'cut'
 * @returns {number} Daily protein target in grams
 * @throws {Error} If bodyWeight is negative or goal is invalid
 * 
 * @example
 * const target = calculateDailyProteinTarget(75, 'bulk');
 * // Returns: 180 (2.4g per kg for bulking)
 */
function calculateDailyProteinTarget(bodyWeightKg, goal) {
  if (bodyWeightKg <= 0) {
    throw new Error('Body weight must be positive');
  }
  // Implementation...
}
```

**Complex logic requires explanation:**
```javascript
// ✅ GOOD - Explains the "why"
// Using 2.4g/kg for bulking based on International Society of Sports Nutrition guidelines
// This ensures muscle protein synthesis is maximized during caloric surplus
const proteinMultiplier = goal === 'bulk' ? 2.4 : 2.0;

// ❌ BAD - States the obvious
// Multiply by 2.4
const proteinMultiplier = goal === 'bulk' ? 2.4 : 2.0;
```

---

## Testing Requirements

### Test Coverage

**Minimum coverage:** 80%
- **Why:** Catches bugs early and enables confident refactoring
- **Measured by:** Jest coverage report
- **Action if below:** CI fails, cannot merge

**Coverage requirements:**
- Statements: ≥ 80%
- Branches: ≥ 75%
- Functions: ≥ 80%
- Lines: ≥ 80%

### Test Structure

**All tests must follow AAA pattern:**
```javascript
// ✅ GOOD - Clear AAA structure
test('calculateDailyProteinTarget returns correct value for bulking', () => {
  // Arrange
  const bodyWeight = 75;
  const goal = 'bulk';
  
  // Act
  const result = calculateDailyProteinTarget(bodyWeight, goal);
  
  // Assert
  expect(result).toBe(180); // 75 * 2.4
});

// ❌ BAD - Mixed structure, unclear
test('protein calculation', () => {
  expect(calculateDailyProteinTarget(75, 'bulk')).toBe(180);
  const result = calculateDailyProteinTarget(80, 'cut');
  expect(result).toBe(160);
});
```

### Test Independence

**Tests must be independent:**
```javascript
// ✅ GOOD - Each test is self-contained
test('adds meal to empty meal log', () => {
  const mealLog = [];
  const meal = { protein: 30, carbs: 40, fats: 10 };
  const result = addMeal(mealLog, meal);
  expect(result).toHaveLength(1);
});

test('adds meal to existing meal log', () => {
  const mealLog = [{ protein: 25, carbs: 35, fats: 8 }];
  const meal = { protein: 30, carbs: 40, fats: 10 };
  const result = addMeal(mealLog, meal);
  expect(result).toHaveLength(2);
});

// ❌ BAD - Second test depends on first
let globalMealLog = [];
test('adds first meal', () => {
  globalMealLog = addMeal(globalMealLog, { protein: 30 });
  expect(globalMealLog).toHaveLength(1);
});
test('adds second meal', () => {
  globalMealLog = addMeal(globalMealLog, { protein: 25 });
  expect(globalMealLog).toHaveLength(2);
});
```

### What to Test

**Required test cases:**
- ✅ Happy path (normal use case)
- ✅ Edge cases (boundary values)
- ✅ Error conditions (invalid inputs)
- ✅ Null/undefined inputs
- ✅ Empty strings/arrays/objects

```javascript
describe('calculateDailyProteinTarget', () => {
  test('calculates correct value for bulking goal', () => {
    expect(calculateDailyProteinTarget(75, 'bulk')).toBe(180);
  });
  
  test('calculates correct value for cutting goal', () => {
    expect(calculateDailyProteinTarget(75, 'cut')).toBe(150);
  });
  
  test('throws error for negative body weight', () => {
    expect(() => calculateDailyProteinTarget(-5, 'bulk'))
      .toThrow('Body weight must be positive');
  });
  
  test('throws error for zero body weight', () => {
    expect(() => calculateDailyProteinTarget(0, 'bulk'))
      .toThrow('Body weight must be positive');
  });
  
  test('throws error for invalid goal', () => {
    expect(() => calculateDailyProteinTarget(75, 'invalid'))
      .toThrow('Invalid goal');
  });
  
  test('handles decimal body weights correctly', () => {
    expect(calculateDailyProteinTarget(75.5, 'bulk')).toBe(181.2);
  });
});
```

---

## Security Standards

### Input Validation

**All user input must be validated:**
```javascript
// ✅ GOOD - Validates before processing
function logMeal(mealData) {
  // Validate meal data
  if (!mealData || typeof mealData !== 'object') {
    throw new Error('Invalid meal data');
  }
  
  if (typeof mealData.protein !== 'number' || mealData.protein < 0) {
    throw new Error('Protein must be a non-negative number');
  }
  
  if (typeof mealData.carbs !== 'number' || mealData.carbs < 0) {
    throw new Error('Carbs must be a non-negative number');
  }
  
  if (typeof mealData.fats !== 'number' || mealData.fats < 0) {
    throw new Error('Fats must be a non-negative number');
  }
  
  // Process validated data
  return saveMeal(mealData);
}

// ❌ BAD - No validation
function logMeal(mealData) {
  return saveMeal(mealData);
}
```

### Data Sanitization

**Sanitize before displaying:**
```javascript
// ✅ GOOD - Sanitizes user-generated content
function displayMealName(name) {
  const sanitized = name
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return sanitized;
}

// ❌ BAD - Direct insertion (XSS risk)
function displayMealName(name) {
  element.innerHTML = name;
}
```

### Secrets Management

**Never commit secrets:**
```javascript
// ✅ GOOD - Uses environment variables
const API_KEY = process.env.NUTRITION_API_KEY;
const config = {
  region: process.env.AWS_REGION,
  userPoolId: process.env.COGNITO_USER_POOL_ID
};

// ❌ BAD - Hardcoded secrets
const API_KEY = 'sk_live_abc123xyz';
const userPoolId = 'us-east-1_abc123';
```

**AWS Secrets Management:**
- **Development:** Use `.env` files (gitignored)
- **Production:** Use AWS Secrets Manager or Systems Manager Parameter Store
- **Amplify:** Environment variables in Amplify Console
- **Lambda:** Environment variables encrypted with KMS

**Required in .gitignore:**
```
.env
.env.local
.env.*.local
amplifyconfiguration.json
aws-exports.js
amplify/team-provider-info.json
config/secrets.js
*.key
*.pem
```

### AWS Security Best Practices

**IAM (Identity and Access Management):**
- Principle of least privilege (minimum permissions needed)
- Never use root account for development
- Use IAM users with MFA enabled
- Rotate access keys every 90 days
- Review IAM policies regularly

**Cognito Security:**
- Enforce strong password policy (min 8 chars, uppercase, lowercase, number)
- Enable MFA for sensitive operations (optional for MVP)
- Set password expiration (optional)
- Monitor failed login attempts

**API Security:**
- Enable CORS properly (whitelist domains only)
- Use API Gateway authorization (Cognito authorizer)
- Rate limiting via API Gateway usage plans
- Enable CloudWatch logging for API calls
- Validate JWT tokens on Lambda functions

**DynamoDB Security:**
- Use fine-grained access control (IAM policies per table)
- Enable point-in-time recovery (backup)
- Enable encryption at rest (default enabled)
- Use VPC endpoints for private access (if needed)

### Error Messages

**Generic messages to users, detailed logs internally:**
```javascript
// ✅ GOOD - Generic to user, detailed in logs
try {
  const result = await fetchUserData(userId);
} catch (error) {
  console.error('Database error:', error.message, { userId, timestamp: Date.now() });
  throw new Error('Unable to load user data. Please try again.');
}

// ❌ BAD - Exposes internal details
try {
  const result = await fetchUserData(userId);
} catch (error) {
  throw new Error(`Database connection failed at 192.168.1.5:5432 - ${error.message}`);
}
```

---

## Performance Standards

### Page Load Performance

**Targets:**
- First Contentful Paint: < 2s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 3s
- Total page size: < 500KB

**How to measure:**
- Lighthouse in Chrome DevTools
- WebPageTest for detailed analysis

### API Response Time

**Targets:**
- UI interactions: < 100ms (instant feedback)
- Simple calculations: < 200ms (local calculations)
- Lambda cold start: < 1s (first invocation)
- Lambda warm: < 100ms (subsequent calls)
- DynamoDB queries: < 50ms (single-item get)
- DynamoDB scans: < 200ms (small datasets)
- AI meal analysis: < 5s (realistic for LLM calls)
  - Show loading state immediately
  - Timeout after 10s with fallback to rule-based analysis

**Cold Start Mitigation:**
- Keep Lambda warm with CloudWatch Events (ping every 5 min)
- Optimize Lambda package size (< 10MB zipped)

### User Input Response

**Target:** < 100ms for perceived instant feedback
- Form validation: Immediate (client-side)
- Button click feedback: Immediate
- Loading indicators: Show within 100ms
- Optimistic UI: Update immediately, sync in background

### Offline Support

**Must work offline:**
- View meal history (cached in localStorage/IndexedDB)
- Local macro calculations
- Form validation
- Navigation

**Requires connection:**
- AI meal analysis
- Data sync across devices
- Initial data load from DynamoDB
- Authentication/sign-up

---

## Git Workflow Standards

### Commit Messages

**Format:** `<type>: <description>`

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting (no code change)
- `refactor:` Code change that neither fixes bug nor adds feature
- `test:` Adding or updating tests
- `chore:` Maintenance (dependencies, config)

**Examples:**
```bash
# ✅ GOOD
git commit -m "feat: add daily protein target calculation"
git commit -m "fix: prevent negative macro values in meal logging"
git commit -m "docs: update README with API endpoints"
git commit -m "test: add edge case tests for macro calculations"

# ❌ BAD
git commit -m "updates"
git commit -m "fixed bug"
git commit -m "wip"
```

### Branch Naming

**Format:** `<type>/<description>`

```bash
# ✅ GOOD
feature/meal-quality-analysis
fix/protein-calculation-edge-case
docs/api-documentation
test/macro-validation

# ❌ BAD
my-branch
updates
john-dev
```

### Pull Request Requirements

**Before submitting PR:**
- [ ] All tests pass locally
- [ ] Code follows constitution.md standards
- [ ] ESLint passes with no errors
- [ ] Test coverage ≥ 80%
- [ ] Copilot/Claude review completed
- [ ] No console.log statements (use proper logging)
- [ ] Documentation updated

---

## Architecture Principles

### Decision Process

**Before implementing ANY architectural change:**
1. Document current architecture
2. Propose minimum 2 alternatives
3. Create cost comparison table
4. Assess migration complexity
5. Get Product Owner approval
6. Document decision in `docs/decisions/`

### Cost Constraints

**POC Phase:** (Current)
- **Hard limit:** $10/month
- Any paid service requires explicit PO approval
- Must document cost implications before implementing
- Always propose free alternatives first
- Monitor AWS costs weekly via Cost Explorer

**AWS Free Tier Coverage:**
```
Cognito: 50,000 MAUs (Monthly Active Users) = $0
DynamoDB: 25GB storage + 200M requests/month = $0
Lambda: 1M requests + 400,000 GB-seconds compute = $0
API Gateway: 1M API calls/month = $0
S3: 5GB storage + 20,000 GET requests = $0
Amplify Hosting: 5GB storage + 15GB bandwidth = $0

Expected cost for 50-70 MVP users: $0-3/month
```

**Cost Triggers:**
- Database > 20GB → DynamoDB charges begin (~$2.50/month per GB)
- API calls > 1M/month → Lambda charges begin ($0.20 per 1M)
- Users > 50,000 MAU → Cognito charges begin ($0.0055 per MAU)
- Bandwidth > 15GB → Amplify charges begin ($0.15 per GB)

**Cost Monitoring:**
- Set AWS Budget alert: Email if > $8/month
- Weekly check: AWS Cost Explorer dashboard
- Monthly review: Optimize if trending toward $10 limit

### Technology Selection Criteria

**When choosing between technologies, prioritize:**
1. **Cost** - Free tier > Pay-as-you-go > Fixed cost
2. **AWS Ecosystem** - Prefer AWS services for consistency and learning
3. **Simplicity** - Managed services > Self-hosted
4. **Learnability** - Junior dev must understand it
5. **Career Growth** - Skills transferable to company work
6. **Scalability** - Serverless preferred for auto-scaling
7. **Community** - Active support and documentation

### Why AWS for This Project

**Career Learning Goal:**
This project serves dual purpose:
1. **Product:** Build and validate NutriPilot MVP
2. **Learning:** Gain AWS experience applicable to day job

**Company Context:**
- Company uses AWS serverless + Fargate containers
- Dev team works with Lambda, Cognito, DynamoDB
- Building on AWS enables technical discussions with team
- Portfolio piece demonstrating AWS competency

**AWS Amplify Choice:**
- Abstracts AWS complexity while teaching fundamentals
- Uses same services as raw AWS (Cognito, Lambda, DynamoDB)
- Can graduate to custom AWS setup as skills grow
- No vendor lock-in - you own the AWS resources

**Learning Path:**
- **Phase 1 (POC):** Use Amplify CLI (easy mode)
- **Phase 2 (Growth):** Customize underlying AWS services
- **Phase 3 (Scale):** Full AWS control, custom infrastructure

**Skills Gained:**
- AWS Cognito (user authentication, OAuth flows)
- Lambda (serverless functions, event-driven architecture)
- DynamoDB (NoSQL data modeling, single-table design)
- API Gateway (REST APIs, authorization)
- CloudWatch (monitoring, logging)
- IAM (permissions, security policies)
- Cost optimization (free tier management)

### Approved Tools (POC Phase)

**✅ Hosting:**
- AWS Amplify Hosting (frontend SPA hosting)
  - Free tier: 5GB storage, 15GB bandwidth/month
  - CI/CD integrated with GitHub
  - Custom domain support (optional)
- GitHub Pages (for static documentation)

**✅ Frontend Development:**
- React + Vite (or Next.js if SSR needed)
- TypeScript (optional but recommended)
- Tailwind CSS (styling)

**✅ Storage:**
- **Primary:** AWS DynamoDB (all permanent data - meals, profiles, summaries)
- **Optional:** localStorage (draft meal forms, UI preferences only)
- **Phase 2:** AWS S3 (meal photos, document exports)

**Storage Rules:**
- DynamoDB is source of truth (always)
- localStorage for UX enhancements only (not critical data)
- Never store sensitive data in localStorage (auth tokens handled by Amplify)
- Multi-device consistency: Only achievable with DynamoDB

**✅ CI/CD:**
- GitHub Actions (free tier)
- AWS Amplify Console (built-in CI/CD)

**✅ Monitoring & Logging:**
- AWS CloudWatch (free tier: 5GB logs, 10 custom metrics)
- AWS X-Ray (distributed tracing, optional)
- Amplify Console (deployment logs, hosting metrics)

**✅ Development Tools:**
- AWS Amplify CLI (`@aws-amplify/cli`)
- AWS SDK for JavaScript (`aws-sdk` or `@aws-sdk/client-*`)
- Amplify UI Components (optional, pre-built auth UI)

**✅ Backend & Database:**
- **AWS Amplify** (serverless architecture)
  - **Cognito:** Authentication (50,000 MAUs free)
    - Email/password, OAuth (Google, Facebook, Amazon, Apple)
    - MFA support, password reset flows
  - **DynamoDB:** NoSQL database (25GB storage, 200M requests/month free)
    - Or **RDS PostgreSQL** if relational data preferred (db.t3.micro free tier)
  - **Lambda:** Backend functions (1M requests/month free)
  - **API Gateway:** REST/GraphQL APIs (1M calls/month free)
  - **S3:** File storage (5GB free)
  - **Amplify Hosting:** Frontend hosting (5GB storage, 15GB bandwidth/month free)

**✅ AI/ML:**
- **OpenAI GPT-4o-mini** (primary)
  - Cost: $0.15/1M input tokens, $0.60/1M output tokens
  - Budget: ~66,000 analyses per $10
  - Free tier: $5 credit for new accounts
- **Groq** (fallback if budget exceeded)
  - Free tier with rate limits
  - llama-3-8b model
- Must implement: Rate limiting (10 req/min per user), caching (24hr for identical meals), error handling
- Must monitor: Monthly spend via OpenAI dashboard

**❌ Requires Approval:**
- Any non-AWS service requiring credit card (without strong justification)
- Any service with opaque pricing
- Services with "free trial" that auto-charge after (e.g., MongoDB Atlas trials)
- AWS services outside free tier limits without cost analysis
- Third-party AWS marketplace services (usually paid)

---

## AWS Amplify Setup & Deployment

### Initial Setup

**Prerequisites:**
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure AWS credentials
amplify configure
# This creates IAM user with AdministratorAccess-Amplify policy
```

**Project Initialization:**
```bash
# Initialize Amplify in your project
amplify init

# Prompts:
# - Enter a name for the project: nutripilot
# - Enter a name for the environment: dev
# - Choose your default editor: Visual Studio Code
# - Choose the type of app: javascript
# - Framework: react
# - Source Directory Path: src
# - Distribution Directory Path: dist (or build)
# - Build Command: npm run build
# - Start Command: npm run dev
```

**Add Backend Services:**
```bash
# Add authentication
amplify add auth
# Choose: Default configuration
# Sign-in method: Email
# Optional: Add OAuth providers later

# Add API + Database
amplify add api
# Choose: REST or GraphQL
# If REST: Creates API Gateway + Lambda
# If GraphQL: Creates AppSync + DynamoDB

# Add storage (optional)
amplify add storage
# Choose: Content (S3) or NoSQL Database (DynamoDB)

# Deploy everything
amplify push
```

### Deployment Strategy

**Development Environment:**
```bash
# Deploy to dev environment
amplify push

# Test locally with mock data
amplify mock api
```

**Production Environment:**
```bash
# Create production environment
amplify env add prod

# Deploy to production
amplify push

# Production uses separate AWS resources
# (separate Cognito pool, DynamoDB tables, etc.)
```

**CI/CD with GitHub:**
1. Push code to GitHub
2. Connect repository in Amplify Console
3. Amplify auto-deploys on git push
4. Separate branches = separate environments
   - `main` branch → production
   - `dev` branch → development

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud                            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         AWS Amplify Hosting                      │  │
│  │         (React SPA Frontend)                     │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │         Amazon Cognito                           │  │
│  │         (User Auth + OAuth)                      │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │         Amazon API Gateway                       │  │
│  │         (REST API)                               │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │         AWS Lambda Functions                     │  │
│  │         - getMacros(userId)                      │  │
│  │         - saveMeal(userId, mealData)             │  │
│  │         - calculateTargets(userProfile)          │  │
│  │         - analyzeMeal(description) → OpenAI      │  │
│  └────────┬────────────────────────────────┬────────┘  │
│           │                                │           │
│  ┌────────▼─────────┐         ┌───────────▼────────┐  │
│  │  DynamoDB Tables │         │  CloudWatch Logs   │  │
│  │  - Users         │         │  (Monitoring)      │  │
│  │  - Meals         │         └────────────────────┘  │
│  │  - DailyTargets  │                                 │
│  └──────────────────┘                                 │
│                                                        │
│  External: OpenAI API (meal analysis)                 │
└────────────────────────────────────────────────────────┘
```

### DynamoDB Schema Design

**Single-Table Design (Recommended):**

```javascript
// Table: NutriPilot
// Partition Key: PK (String)
// Sort Key: SK (String)

// User Profile
{
  PK: "USER#<userId>",
  SK: "PROFILE",
  email: "user@example.com",
  bodyWeight: 75,
  height: 180,
  age: 30,
  gender: "male",
  goal: "bulk",
  activityLevel: "moderate",
  createdAt: 1234567890,
  updatedAt: 1234567890
}

// Daily Targets
{
  PK: "USER#<userId>",
  SK: "TARGETS",
  protein: 180,
  carbs: 360,
  fats: 79,
  calories: 2875,
  calculatedAt: 1234567890
}

// Meal Entry
{
  PK: "USER#<userId>",
  SK: "MEAL#<timestamp>",
  mealId: "<uuid>",
  description: "2 eggs, 60g feta, 2 slices bread",
  mealType: "Breakfast",
  protein: 30,
  carbs: 40,
  fats: 20,
  calories: 450,
  timestamp: 1234567890,
  createdAt: 1234567890
}

// Query patterns:
// - Get user profile: PK = "USER#<userId>" AND SK = "PROFILE"
// - Get daily targets: PK = "USER#<userId>" AND SK = "TARGETS"
// - Get all meals: PK = "USER#<userId>" AND SK begins_with "MEAL#"
// - Get meals for date: PK = "USER#<userId>" AND SK between "MEAL#<startTime>" and "MEAL#<endTime>"
```

**Indexes:**
- Global Secondary Index (GSI) for email lookup: `email-index` (email → userId)

### Lambda Function Structure

```javascript
// Example: saveMeal Lambda function
exports.handler = async (event) => {
  try {
    // 1. Parse request
    const { userId, mealData } = JSON.parse(event.body);
    
    // 2. Validate input
    if (!userId || !mealData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }
    
    // 3. Call OpenAI for meal analysis (if description provided)
    let macros;
    if (mealData.description) {
      macros = await analyzeMealWithAI(mealData.description);
    } else {
      macros = mealData.macros; // Manual entry
    }
    
    // 4. Save to DynamoDB
    const meal = {
      PK: `USER#${userId}`,
      SK: `MEAL#${Date.now()}`,
      mealId: generateUUID(),
      ...mealData,
      ...macros,
      timestamp: Date.now(),
      createdAt: Date.now()
    };
    
    await dynamodb.put({ TableName: 'NutriPilot', Item: meal }).promise();
    
    // 5. Return success
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ success: true, meal })
    };
    
  } catch (error) {
    console.error('Error saving meal:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save meal' })
    };
  }
};
```

### Cost Optimization Tips

**Stay in Free Tier:**
- Use Lambda efficiently (small package sizes, fast execution)
- Optimize DynamoDB queries (avoid scans, use queries)
- Cache frequently accessed data in frontend
- Batch operations when possible
- Set up AWS Budget alerts

**Monitor Costs:**
```bash
# Check current costs
aws ce get-cost-and-usage \
  --time-period Start=2024-10-01,End=2024-10-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## Browser Support & Compatibility

### Supported Browsers

**Desktop:**
- Chrome 90+ (April 2021)
- Firefox 88+ (April 2021)
- Safari 14+ (September 2020)
- Edge 90+ (April 2021)

**Mobile:**
- Chrome Mobile (last 2 versions)
- Safari iOS 14+ (September 2020)
- Firefox Mobile (last 2 versions)
- Samsung Internet (last 2 versions)

**NOT Supporting:**
- Internet Explorer (any version)
- Opera Mini (limited JavaScript support)
- UC Browser (outdated engine)
- Android Browser on Android < 5.0

**JavaScript Features Allowed:**
- ES2020 features (optional chaining ?., nullish coalescing ??)
- async/await
- fetch API
- Promises
- Array methods (map, filter, reduce, find, etc.)
- Template literals
- Destructuring
- Spread operator
- localStorage & sessionStorage
- CSS Grid & Flexbox

**Why These Versions:**
- Cover 95%+ of global users
- Modern JavaScript features work natively (no polyfills)
- Supabase client library compatibility
- Reduces development complexity

**Testing Strategy:**
- Primary: Chrome desktop + Chrome Mobile
- Secondary: Safari desktop + Safari iOS
- CI: Run tests in Chrome only (covers ES2020+)
- Manual testing on Safari before major releases

### Accessibility Requirements

- WCAG AA compliance
- Keyboard navigation for all interactions
- Screen reader support (ARIA labels on all interactive elements)
- Color contrast ratios: 4.5:1 minimum for text
- Focus indicators visible and clear
- No reliance on color alone for information
- Form labels properly associated with inputs
- Error messages announced to screen readers

---

## NutriPilot-Specific Standards

### Macro Calculation Standards

**Core Formula Philosophy:**
- Science-based: Using International Society of Sports Nutrition guidelines
- Activity-adjusted: Different needs based on training frequency
- Goal-specific: Bulk, maintain, cut have different requirements
- Safety ranges: Min/max limits for health

**Protein Calculations:**
```javascript
// Base protein needs (g/kg body weight)
const proteinMultipliers = {
  bulk: 2.2,      // Muscle growth phase
  maintain: 2.0,  // Weight maintenance
  cut: 2.4        // Higher to preserve muscle during deficit
};

// Activity level adjustments (add to base)
const proteinActivityBonus = {
  sedentary: 0,      // < 1 workout/week
  light: 0.1,        // 1-2 workouts/week
  moderate: 0.2,     // 3-5 workouts/week
  active: 0.3,       // 6+ workouts/week
  athlete: 0.4       // 10+ workouts/week + sports
};

// Formula: (bodyWeight * multiplier) + (bodyWeight * activityBonus)
// Example: 75kg, bulk, moderate = (75 * 2.2) + (75 * 0.2) = 180g
```

**Carbohydrate Calculations:**
```javascript
// Carbs based primarily on activity level (g/kg body weight)
const carbsMultipliers = {
  sedentary: 2.0,    // Minimal exercise
  light: 3.0,        // Light activity
  moderate: 4.0,     // Regular training
  active: 6.0,       // Heavy training
  athlete: 8.0       // Elite athlete
};

// Goal adjustments (percentage modifier)
const carbsGoalModifiers = {
  bulk: 1.2,         // 20% increase for surplus
  maintain: 1.0,     // No adjustment
  cut: 0.8           // 20% decrease for deficit
};

// Formula: bodyWeight * multiplier * goalModifier
// Example: 75kg, moderate, bulk = 75 * 4.0 * 1.2 = 360g
```

**Fat Calculations:**
```javascript
// Fats are calculated AFTER protein and carbs
// Based on remaining calories for goal

// Minimum fat for hormonal health (g/kg body weight)
const MIN_FAT_MULTIPLIER = 0.8;

// Calculate remaining calories:
// 1. Calculate TDEE (Total Daily Energy Expenditure)
// 2. Adjust for goal: bulk (+10-20%), maintain (0%), cut (-10-20%)
// 3. Subtract protein calories (4 cal/g)
// 4. Subtract carbs calories (4 cal/g)
// 5. Remaining calories ÷ 9 (cal/g) = fat grams
// 6. Ensure >= minimum (bodyWeight * 0.8)

// Example: 75kg, 2500 TDEE, bulk (+15% = 2875 cal)
// - Protein: 180g * 4 = 720 cal
// - Carbs: 360g * 4 = 1440 cal
// - Remaining: 2875 - 720 - 1440 = 715 cal
// - Fats: 715 ÷ 9 = 79g (above minimum of 60g ✓)
```

**TDEE Calculation:**
```javascript
// Basal Metabolic Rate (Mifflin-St Jeor Equation)
// Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
// Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

// Activity multipliers for TDEE
const activityMultipliers = {
  sedentary: 1.2,    // Little or no exercise
  light: 1.375,      // Light exercise 1-3 days/week
  moderate: 1.55,    // Moderate exercise 3-5 days/week
  active: 1.725,     // Heavy exercise 6-7 days/week
  athlete: 1.9       // Very heavy exercise, physical job
};

// TDEE = BMR × activityMultiplier
```

**Data Validation Ranges:**
```javascript
const VALIDATION_RANGES = {
  // User inputs
  bodyWeight: { min: 40, max: 200 },      // kg
  height: { min: 140, max: 220 },         // cm
  age: { min: 18, max: 80 },              // years
  
  // Per-meal macros
  proteinPerMeal: { min: 0, max: 80 },    // grams
  carbsPerMeal: { min: 0, max: 150 },     // grams
  fatsPerMeal: { min: 0, max: 80 },       // grams
  
  // Daily targets (calculated, but validated)
  dailyProtein: { min: 80, max: 400 },    // grams
  dailyCarbs: { min: 80, max: 800 },      // grams
  dailyFats: { min: 30, max: 200 },       // grams
  dailyCalories: { min: 1200, max: 6000 } // calories
};
```

**Edge Cases & Warnings:**
```javascript
// Issue warnings (not errors) when:
// - Protein > 3.0g/kg (probably unnecessary, expensive)
// - Carbs < 100g on non-cut days (energy issues)
// - Fats < 0.6g/kg (hormonal issues risk)
// - Total calories < BMR * 0.8 (too aggressive cut)
// - Total calories > TDEE * 1.3 (too aggressive bulk)
```

### Meal Quality Analysis

**Quality tiers:**
- **Excellent:** ≥ 90% of targets met
- **Good:** 75-89% of targets met
- **Fair:** 60-74% of targets met
- **Poor:** < 60% of targets met

### Data Persistence

**What to store:**
- **Backend (AWS DynamoDB or RDS):**
  - User profile (email, body metrics, goals)
  - Meal history (unlimited, synced across devices)
  - Daily targets and calculations
  - Preferences and settings
  - Analytics and summaries

**What NOT to store:**
- Payment information (not collecting payments in POC)
- Detailed health conditions beyond macros
- Third-party API keys in code (use AWS Secrets Manager or env vars)

**Authentication:**
- **AWS Cognito** (free tier: 50,000 Monthly Active Users)
- Email/password + OAuth providers (Google, Facebook, Apple, Amazon)
- JWT tokens managed by Amplify Auth client
- Session management: Automatic token refresh
- Session timeout: 30 days (configurable via Cognito settings)
- MFA support available (optional for Phase 2)

**Data Storage Options:**

**Option A: DynamoDB (Recommended for MVP)**
- NoSQL, serverless, auto-scaling
- Free tier: 25GB storage, 200M requests/month
- Best for: High scalability, simple queries
- Tradeoff: Less flexible queries than SQL

**Option B: RDS PostgreSQL**
- Relational SQL database
- Free tier: db.t3.micro (750 hours/month), 20GB storage
- Best for: Complex queries, joins, SQL familiarity
- Tradeoff: Not serverless (always running = cost after free tier)

**Decision for MVP:** Use DynamoDB (Option A)
- Serverless = truly pay-per-use
- Better for 50-70 users scale
- Can migrate to RDS later if complex queries needed

---

## Exceptions to Rules

### When to Break Rules

**Rules can be broken if:**
1. Alternative is documented and justified
2. Product Owner approves exception
3. Exception is temporary (with removal plan)
4. Exception is isolated (doesn't set precedent)

**Document exceptions:**
```javascript
// EXCEPTION: Using 80-line function here because...
// Reason: Macro calculation algorithm requires sequential validation steps
// Approved by: Product Owner on 2025-10-16
// TODO: Refactor into smaller functions in Phase 2 (Issue #45)
function complexMacroCalculation() {
  // 80 lines of sequential logic
}
```

---

## Enforcement

### Automatic Enforcement

**CI will fail if:**
- ✅ Tests don't pass
- ✅ Coverage drops below 80%
- ✅ ESLint reports errors
- ✅ Build fails

### Manual Enforcement

**Code review will reject if:**
- ❌ Constitution.md violated without justification
- ❌ No tests included
- ❌ Copilot/Claude review not completed
- ❌ Poor naming or documentation
- ❌ Security vulnerabilities present

---

## Updates to Constitution

### Amendment Process

1. Propose change in GitHub issue
2. Discuss with team (or document reasoning if solo)
3. Update constitution.md
4. Commit with `docs: update constitution - [reason]`
5. Update version number

### Version History

**Version 1.0** (2025-10-16)
- Initial constitution for NutriPilot
- Established coding standards
- Defined testing requirements
- Set architecture principles
- Added NutriPilot-specific standards
- Selected AWS Amplify architecture for MVP
- Defined DynamoDB schema and Lambda patterns
- Documented cost optimization strategies
- Career learning goal: AWS serverless experience

---

## Appendix: Quick Reference

### Function Length ✅
- Max: 50 lines
- Complexity: ≤ 10
- Nesting: ≤ 3 levels

### Testing ✅
- Coverage: ≥ 80%
- AAA pattern required
- Tests must be independent

### Naming ✅
- Variables: camelCase, descriptive
- Functions: verbNoun, describes action
- Constants: ALL_CAPS
- Booleans: is/has/should/can prefix

### Security ✅
- Validate all user input
- Sanitize before display
- No secrets in code
- Generic error messages to users

### Git ✅
- Commits: `type: description`
- Branches: `type/description`
- PRs: Include tests + AI review

### Performance ✅
- FCP: < 1.5s
- TTI: < 3s
- API: < 200ms
- Input: < 100ms response

---

**Last reviewed:** 2025-10-22  
**Next review:** 2025-11-22 (monthly or as needed)