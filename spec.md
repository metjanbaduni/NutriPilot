# Specification: NutriPilot

**Version:** 2.0  
**Date:** 2025-10-16  
**Status:** Ready for Codex Implementation  
**Architecture:** AWS Amplify Serverless

---

## Overview

NutriPilot is a nutrition tracking application that helps users achieve fitness goals through personalized macro tracking, AI-powered meal analysis, and actionable recommendations. The app focuses on muscle building optimization by tracking protein, carbs, fats, and providing intelligent guidance.

**Problem:** People struggle to hit macro targets for muscle building. Generic calorie counters don't provide personalized guidance or real-time feedback.

**Solution:** An intelligent dashboard that calculates personalized targets based on body metrics, provides real-time meal analysis, and tracks consistency.

**Success Metrics:**
- Primary: Users hit daily protein target 80% of tracked days
- Secondary: 70% of users log meals 5+ days per week

---

## Architecture: AWS Amplify Serverless

### Technology Stack

**Frontend:**
- React 18+ (Codex generates 95% of code)
- Vite build tool
- Tailwind CSS
- AWS Amplify JavaScript SDK

**Backend:**
- AWS Lambda (Node.js 18.x)
- Amazon API Gateway (REST)
- Amazon DynamoDB (NoSQL)
- AWS Cognito (Authentication)
- AWS Amplify CLI (Deployment)

**External:**
- OpenAI GPT-4o-mini (meal analysis)

**Cost:** $1-2/month (all AWS free tier except OpenAI)

### Setup Commands (Product Owner does this once)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure AWS credentials
amplify configure

# Initialize project
amplify init
# Project name: nutripilot
# Environment: dev
# Editor: VS Code
# App type: javascript
# Framework: react

# Add authentication
amplify add auth
# Default configuration, Email sign-in

# Add API
amplify add api
# REST API, Create Lambda functions

# Deploy everything
amplify push
```

### Deployment (After Codex generates code)

```bash
# Deploy all changes
amplify push

# Or deploy specific function
amplify function update saveMeal
amplify push function saveMeal
```

---

## Authentication (AWS Cognito)

### User Registration

**Flow:**
1. User enters email + password
2. Cognito sends verification code to email
3. User enters 6-digit code
4. Account activated → Auto-login
5. Redirect to onboarding (body metrics form)

**Validation:**
- Email: Valid format, unique
- Password: Min 8 chars, uppercase, lowercase, number

**Error Messages:**
- Email exists → "Email already registered. Please sign in."
- Invalid email → "Please enter valid email address."
- Weak password → "Password must be 8+ chars with uppercase, lowercase, number."

### User Login

**Flow:**
1. User enters email + password
2. Amplify validates with Cognito
3. If valid: Set JWT tokens, redirect to dashboard
4. If invalid: "Invalid email or password"

**Security:**
- Rate limiting: 5 attempts per 15 min (Cognito built-in)
- Session: 30 days
- HTTPS only

---

## Data Storage (DynamoDB)

### Single-Table Design

**Table:** `NutriPilot-<env>`
**Primary Key:** PK (String), SK (String)
**GSI:** email-index for login lookup

### Entity Schemas

**User Profile:**
```javascript
{
  PK: "USER#<userId>",
  SK: "PROFILE",
  email: "user@example.com",
  bodyWeight: 78,      // kg
  height: 183,         // cm
  age: 34,
  gender: "Male",
  activityLevel: "moderate",
  goal: "bulk",
  createdAt: 1697452800000,
  updatedAt: 1697452800000
}
```

**Daily Targets:**
```javascript
{
  PK: "USER#<userId>",
  SK: "TARGETS",
  protein: 180,        // grams
  carbs: 360,
  fats: 79,
  calories: 2875,
  calculatedAt: 1697452800000
}
```

**Meal Entry:**
```javascript
{
  PK: "USER#<userId>",
  SK: "MEAL#<timestamp>",
  mealId: "uuid",
  description: "2 eggs scrambled...",
  date: "2025-10-16",
  mealType: "Breakfast",
  macros: {
    protein: 30,
    carbs: 40,
    fats: 20,
    calories: 450
  },
  detailedBreakdown: [...],  // Optional, from AI
  aiAnalyzed: true,
  timestamp: 1697452800000,
  createdAt: 1697452800000
}
```

**Daily Summary:**
```javascript
{
  PK: "USER#<userId>",
  SK: "SUMMARY#2025-10-16",
  date: "2025-10-16",
  totalMacros: {
    protein: 145,
    carbs: 285,
    fats: 65,
    calories: 2305
  },
  mealCount: 3,
  targetsMet: {
    protein: false,
    calories: false
  }
}
```

---

## API Endpoints (Lambda Functions)

### 1. POST /api/profile
**Purpose:** Update user metrics, recalculate targets

**Request:**
```json
{
  "bodyWeight": 78,
  "height": 183,
  "age": 34,
  "gender": "Male",
  "activityLevel": "moderate",
  "goal": "bulk"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {...},
  "targets": {
    "protein": 180,
    "carbs": 360,
    "fats": 79,
    "calories": 2875
  }
}
```

**Codex generates:** Lambda function that validates input, calculates TDEE/macros per constitution.md formulas, saves to DynamoDB

---

### 2. GET /api/profile
**Purpose:** Fetch user profile and targets

**Response:**
```json
{
  "success": true,
  "profile": {...},
  "targets": {...}
}
```

**Codex generates:** Lambda function that queries DynamoDB, returns profile + targets

---

### 3. POST /api/meals
**Purpose:** Log meal (with AI analysis if description provided)

**Request:**
```json
{
  "description": "2 eggs scrambled, feta, bread",
  "mealType": "Breakfast",
  "manualMacros": {
    "protein": 30,
    "carbs": 40,
    "fats": 20
  }
}
```

**Response:**
```json
{
  "success": true,
  "meal": {...},
  "dailyTotals": {
    "protein": 30,
    "carbs": 40,
    "fats": 20,
    "calories": 450,
    "mealCount": 1
  }
}
```

**Codex generates:** Lambda function that:
1. If description: Call OpenAI API to analyze
2. Else: Use manualMacros
3. Calculate calories: (P×4) + (C×4) + (F×9)
4. Save to DynamoDB
5. Update daily summary
6. Return meal + totals

**OpenAI Integration:**
```javascript
const prompt = `Parse this meal and calculate macros:
"${description}"

Return ONLY valid JSON:
{
  "protein": number,
  "carbs": number,
  "fats": number,
  "ingredients": [
    {"item": "string", "quantity": "string", "protein": number, "carbs": number, "fats": number}
  ]
}`;

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.3
  })
});
```

**Error Handling:**
- OpenAI timeout (10s) → Fallback to manual entry
- Invalid JSON → Retry once, then fallback
- Rate limit → Switch to Groq or disable AI temporarily

**Caching:** Hash description, store in DynamoDB with 24hr TTL

---

### 4. GET /api/meals
**Purpose:** Fetch meal history

**Query Params:**
- `startDate`: YYYY-MM-DD (default: today)
- `endDate`: YYYY-MM-DD (default: today)
- `limit`: Max 100 (default: 50)

**Response:**
```json
{
  "success": true,
  "meals": [...],
  "count": 15
}
```

**Codex generates:** Lambda that queries DynamoDB with date range filter

---

### 5. GET /api/dashboard
**Purpose:** Fetch today's complete dashboard

**Response:**
```json
{
  "success": true,
  "date": "2025-10-16",
  "profile": {...},
  "targets": {...},
  "totals": {...},
  "progress": {
    "protein": 80.5,
    "carbs": 79.2,
    "fats": 82.3,
    "calories": 80.2
  },
  "meals": [...],
  "mealCount": 3,
  "targetsMet": {
    "protein": false,
    "calories": false
  }
}
```

**Codex generates:** Lambda that queries profile, targets, today's meals, calculates totals/progress

---

### 6. POST /api/meals/analyze
**Purpose:** Preview AI analysis without saving

**Request:**
```json
{
  "description": "grilled chicken 200g, rice 150g, broccoli"
}
```

**Response:**
```json
{
  "success": true,
  "macros": {...},
  "ingredients": [...]
}
```

**Codex generates:** Lambda that calls OpenAI, caches result, returns macros (does NOT save)

---

### 7. DELETE /api/meals/:mealId
**Purpose:** Delete meal, recalculate totals

**Response:**
```json
{
  "success": true,
  "deletedMealId": "uuid",
  "updatedDailyTotals": {...}
}
```

**Codex generates:** Lambda that finds meal, verifies ownership, deletes, updates summary

---

## User Interface (React)

### Screen: Dashboard

**Route:** `/dashboard`

**Layout:**
```
┌─────────────────────────────────┐
│ NutriPilot              [⚙]    │
├─────────────────────────────────┤
│ Daily Nutrition Dashboard       │
│ [78 kg] • [Build Muscle Mass]  │
├─────────────────────────────────┤
│ Protein: 145/180g (80%) [████░] │
│ Carbs: 285/360g (79%) [███░░]  │
│ Fats: 65/79g (82%) [████░]     │
│ Calories: 2305/2875 [████░]    │
├─────────────────────────────────┤
│ Today's Meals (3)               │
│                                 │
│ [Breakfast] 🍳                  │
│ 2 eggs scrambled, feta, bread   │
│ P:30g C:40g F:20g • 450kcal [X]│
│                                 │
│ [+ Add Another Meal]            │
├─────────────────────────────────┤
│ Nutritionist Analysis           │
│ ✓ Good breakfast! You've...    │
│ ⚠ Protein Priority: Need 125g..│
└─────────────────────────────────┘
```

**States:**
- Empty: "No meals logged today" + big "+ Log First Meal" button
- Loading: Skeleton placeholders
- Populated: All meals, totals, analysis
- Error: Banner "Failed to load. Tap to retry."

**Interactions:**
- Tap settings → `/settings`
- Tap "+ Add Meal" → Open meal modal
- Tap meal card → Expand details (accordion)
- Tap X → Confirm → Delete meal
- Pull to refresh → Reload dashboard

**Codex generates:** React component that:
1. On mount: Call `GET /api/dashboard`
2. Display loading skeletons
3. Render all sections with data
4. Handle errors with retry

---

### Modal: Log Meal

**Triggered by:** "+ Add Meal" button

**Layout:**
```
┌─────────────────────────────────┐
│ Log Meal                    [X] │
├─────────────────────────────────┤
│ Meal Type:                      │
│ [Breakfast][Lunch][Dinner][Snack]│
│                                 │
│ Describe meal:                  │
│ ┌─────────────────────────────┐ │
│ │ 2 eggs scrambled, feta...   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [🤖 Analyze with AI]            │
│                                 │
│ Or manual:                      │
│ Protein: [__] g                 │
│ Carbs:   [__] g                 │
│ Fats:    [__] g                 │
│                                 │
│ [Cancel]        [Save Meal]     │
└─────────────────────────────────┘
```

**States:**
- Initial: Empty form
- AI analyzing: Spinner, disable inputs
- AI success: Pre-fill macros
- AI error: Enable manual entry
- Saving: Disable button, show spinner

**Codex generates:** React modal component that:
1. User types description → Enable AI button
2. Tap "Analyze" → Call `/api/meals/analyze` → Show loading → Pre-fill
3. Edit macros → Manual mode
4. Tap "Save" → Validate → Call `POST /api/meals` → Close modal → Refresh dashboard

---

### Screen: Settings

**Route:** `/settings`

**Layout:**
```
┌─────────────────────────────────┐
│ [← Back] Settings           [✓] │
├─────────────────────────────────┤
│ Current Profile                 │
│ Weight: [78] kg                 │
│ Height: [183] cm                │
│ Age: [34]                       │
│ Gender: [Male ▼]                │
│ Training: [Moderate ▼]          │
│ Goal: [Build Muscle ▼]          │
├─────────────────────────────────┤
│ Daily Targets (Calculated)      │
│ Calories: 2,875 kcal            │
│ Protein: 180g                   │
│ Carbs: 360g                     │
│ Fats: 79g                       │
├─────────────────────────────────┤
│ [Recalculate Targets]           │
│ [Sign Out]                      │
└─────────────────────────────────┘
```

**Codex generates:** React component that:
1. Load profile from `/api/profile`
2. Display editable fields
3. On change: Enable recalculate button
4. Tap recalculate → Call `POST /api/profile` → Update targets
5. Tap sign out → Amplify Auth.signOut() → Redirect to login

---

## Performance Requirements

- First Contentful Paint: < 2s
- Lambda cold start: < 1s
- Lambda warm: < 100ms
- DynamoDB queries: < 50ms
- AI analysis: < 5s (10s timeout)
- UI interactions: < 100ms

---

## Security

- JWT tokens (30-day expiration)
- HTTPS only (API Gateway enforces)
- Input validation in Lambda
- Secrets in AWS Secrets Manager
- IAM least privilege
- Rate limiting (Cognito: 5 attempts per 15 min)

---

## Success Metrics

**POC Success:**
- 5 users test app
- 80% complete workflow
- < 5 critical bugs
- Deploy in < 4 hours

**MVP Success:**
- 50 users logging meals
- 70% log 5+ days/week
- 80% hit protein target
- AWS costs < $5/month

---

## Out of Scope (MVP)

- OAuth login (Phase 2)
- Barcode scanning (Phase 3)
- Social features (Phase 3)
- Weekly analytics (Phase 2)
- Electrolytes tracking (Phase 2)
- Dark mode (Phase 2)

---

## Next Steps for Codex

1. ✅ AWS setup complete (Product Owner did this)
2. → **Codex generates React frontend:**
   - Dashboard component
   - Meal modal component
   - Settings component
   - Auth screens (login, signup)
   - API integration with Amplify SDK
3. → **Codex generates Lambda functions:**
   - updateProfile.js
   - getProfile.js
   - saveMeal.js (with OpenAI integration)
   - getMeals.js
   - getDashboard.js
   - analyzeMeal.js
   - deleteMeal.js
4. → **Copilot reviews all code**
5. → **Deploy:** `amplify push`
6. → **Test and iterate**

---

**Status:** Ready for Codex implementation
**Product Owner:** [Your Name]
**Date:** 2025-10-16