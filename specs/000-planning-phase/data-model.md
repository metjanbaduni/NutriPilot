# Data Model – NutriPilot MVP

## Entities

### UserProfile
- **PK/SK**: `PK = USER#<cognitoSub>`, `SK = PROFILE`
- **Fields**: `email`, `bodyWeightKg`, `heightCm`, `ageYears`, `gender`, `activityLevel`, `goal`, `createdAt`, `updatedAt`
- **Indexes**: `GSI1PK = EMAIL#<email>`, `GSI1SK = PROFILE` (for login lookup)
- **Relationships**: One-to-one with `DailyTargets`; parent for all user-owned items via `PK`
- **Validation**:
  - `bodyWeightKg`: number 30–250
  - `heightCm`: number 120–220
  - `ageYears`: integer 16–80
  - `gender`: enum `['male','female','nonbinary','prefer_not_to_say']`
  - `activityLevel`: enum `['sedentary','light','moderate','active','athlete']`
  - `goal`: enum `['bulk','maintain','cut']`
  - `email`: RFC 5322 format, uniqueness enforced through Cognito + GSI
- **State**: Created at onboarding; updates trigger `updatedAt` refresh and targets recalculation.

### DailyTargets
- **PK/SK**: `PK = USER#<cognitoSub>`, `SK = TARGETS`
- **Fields**: `proteinGrams`, `carbGrams`, `fatGrams`, `calories`, `calculatedAt`, `tdee`
- **Relationships**: Depends on latest `UserProfile`; referenced by dashboard and meal-saving logic
- **Validation**: All macro values >0; calories = `(protein*4)+(carbs*4)+(fats*9)`; `calculatedAt` must be ≥ associated `UserProfile.updatedAt`
- **State transitions**: Updated whenever profile metrics change or user triggers recalculation.

### MealEntry
- **PK/SK**: `PK = USER#<cognitoSub>`, `SK = MEAL#<isoTimestamp>`
- **Fields**: `mealId` (UUID), `description`, `mealType`, `date` (YYYY-MM-DD), `macros {protein, carbs, fats, calories}`, `aiAnalyzed`, `ingredients[]`, `timestamp`, `createdAt`
- **Relationships**: Aggregated into `DailySummary`; optional link to `MealAnalysisCache` via `analysisHash`
- **Validation**:
  - `mealType`: enum `['Breakfast','Lunch','Dinner','Snack','Post-Workout']`
  - `date`: ISO date within ±30 days from today
  - Macro values >= 0 and <= 300; calories recomputed server-side
  - If `aiAnalyzed = true`, require non-empty `description`
- **State transitions**:
  - `Logged` → created with macros (AI or manual)
  - `Edited` (future) → re-save same SK with updated fields
  - `Deleted` → removed; triggers summary recompute

### DailySummary
- **PK/SK**: `PK = USER#<cognitoSub>`, `SK = SUMMARY#<date>`
- **Fields**: `date`, `totalMacros`, `mealCount`, `targetsMet {protein, carbs, fats, calories}`, `lastMealTimestamp`
- **Relationships**: Materialized view for dashboard; updated by meal create/delete Lambdas
- **Validation**: `date` matches SK suffix; macro totals derived from latest meals; `targetsMet` booleans computed server-side only
- **State transitions**: Recomputed after every meal mutation; archived records kept for history.

### MealAnalysisCache
- **PK/SK**: `PK = CACHE#MEAL`, `SK = HASH#<sha256(description)>`
- **Fields**: `macros`, `ingredients`, `createdAt`, `expiresAt`
- **Relationships**: Used by `POST /api/meals/analyze` and `POST /api/meals`
- **Validation**: `expiresAt - createdAt ≤ 24h`; macros mirror `MealEntry` validation rules
- **State transitions**: Created on first AI analysis; expired items pruned via TTL attribute.

## Cross-Entity Considerations
- **Authorization**: All PKs scoped by Cognito `sub`; Lambdas must verify token subject matches `PK`.
- **Consistency**: Lambdas perform conditional writes when updating targets or summaries to avoid race conditions.
- **Auditing**: CloudWatch logs capture request IDs and user IDs for every mutation.
- **TTL Usage**: `MealAnalysisCache` items tagged with DynamoDB TTL (hours) for automatic cleanup.

## Derived Metrics
- Dashboard derives progress percentages via `totalMacros[macro] / targets[macro] * 100`, capped at 150%.
- TDEE + macro split uses formulas from constitution (lean mass multiplier 1.1–1.3 depending on goal/activity).

## Open Questions (Resolved)
- Authentication entity storage handled by Cognito user pool; no duplicates in DynamoDB required beyond `UserProfile`.
- No separate `MealPlan` entity in MVP; future phases may add weekly planning table.
