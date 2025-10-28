# Implementation Plan: NutriPilot MVP Foundation

**Branch**: `000-planning-phase` | **Date**: 2025-10-16 | **Spec**: `spec.md`
**Input**: Feature specification from `spec.md`

## Summary

Deliver the initial NutriPilot experience: a React 18 web dashboard backed by AWS Amplify-managed Lambdas and DynamoDB for macro tracking, with Cognito auth and OpenAI-assisted meal analysis. Focus on standing up the core flows—authentication, profile onboarding, dashboard insights, meal logging/analysis, and settings—while aligning with the serverless architecture and quality guardrails defined in the spec and constitution.

## Technical Context

**Language/Version**: React 18 (Vite build), Node.js 18.x for Lambdas, Jest 30.x for testing  
**Primary Dependencies**: React, AWS Amplify JS SDK, Tailwind CSS, OpenAI GPT-4o-mini, AWS SDK v3  
**Storage**: Amazon DynamoDB single-table design (`NutriPilot-<env>`)  
**Testing**: Jest + React Testing Library (unit/component), Amplify mock stubs for integration  
**Target Platform**: Web SPA served via Amplify Hosting / static S3; Lambdas on AWS  
**Project Type**: Web frontend + serverless backend (Amplify-managed)  
**Performance Goals**: FCP < 2s, Lambda cold start < 1s, warm < 100ms, DynamoDB queries < 50ms, AI analysis < 5s response  
**Constraints**: 80% Jest coverage, ESLint/Prettier conformance, auth-only access, 30-day JWTs, cost ≤ $2/month  
**Scale/Scope**: MVP for 50 active users logging meals; dashboards + 3 primary screens (Dashboard, Meal Modal, Settings) plus auth flows

## Constitution Check

- **Gate 1 – Simplicity over cleverness**: PASS → UI and Lambdas decomposed into focused components/functions capped well below 50 LOC.
- **Gate 2 – Explicit over implicit**: PASS → Configuration centralized in Amplify exports and shared constants; no magic numbers.
- **Gate 3 – Fail fast and loud**: PASS → Validate inputs at UI boundary and again in Lambdas with structured error responses.
- **Gate 4 – Testing requirements**: PASS → Plan includes Jest unit/component coverage ≥80% with focused describe blocks and Amplify mocks.
- **Gate 5 – Documentation & decisions**: PASS → Research, data model, contracts, and quickstart artifacts will document rationale per docs policy.
- **Post-Phase 1 Review**: PASS → Research, data model, and API contracts reinforce constitution gates; testing plan maintains ≥80% coverage requirement.

## Project Structure

```text
specs/000-planning-phase/
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 findings
├── data-model.md        # Phase 1 entity and schema design
├── quickstart.md        # Phase 1 onboarding checklist
├── contracts/           # Phase 1 API/Lambda contracts (REST + events)
└── tasks.md             # Phase 2 work breakdown (future)
```

```text
src/
├── index.js             # React bootstrap (Vite entry)
├── aws-exports.js       # Amplify configuration (generated)
├── amplifyconfiguration.json
├── components/          # Feature views (Dashboard, Auth, Settings, MealModal)
├── api/                 # Amplify API wrappers (profile, meals, dashboard)
└── utils/               # Shared helpers (validation, macros, formatters)

amplify/
├── backend/
│   ├── function/        # Lambda sources (getProfile, updateProfile, etc.)
│   └── api/             # API Gateway definitions
└── # managed via Amplify CLI

tests/
├── components/          # React component tests mirroring src/components
├── api/                 # API wrapper tests
└── lambdas/             # Jest units for Lambda handlers
```

**Structure Decision**: Maintain a single repo split by concern—React SPA under `src/`, Amplify-managed backend under `amplify/backend`, and mirrored Jest suites in `tests/`—matching repo guidelines for clarity and constitution simplicity targets.

## Complexity Tracking

_No deviations from constitution expectations anticipated; table not required._
