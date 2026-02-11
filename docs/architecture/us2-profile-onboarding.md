# US2 Architecture & Troubleshooting - Profile Onboarding & Targets

## Goal
Authenticated users can submit profile metrics, trigger macro calculations, and persist PROFILE + TARGETS in DynamoDB. The UI then rehydrates from saved data on subsequent visits.

## Key Components

### Frontend
- `src/components/profile/ProfileForm.jsx`
  - UI for profile input and recalculation.
  - Shows loading, empty, error, and populated states.
- `src/hooks/useProfile.js`
  - Fetches profile on mount and exposes `refetchProfile`.
  - Supplies `profile`, `targets`, `isLoading`, `error` to the UI.
- `src/api/profile.js`
  - `fetchProfile()` and `saveProfile()` wrappers around the shared client.
- `src/api/client.js`
  - Normalizes API errors and injects auth headers.
- `src/utils/calculateMacros.js`
  - Pure frontend macro calculation helper (deterministic, no side effects).

### Backend
- `amplify/backend/function/getProfile/src/index.js`
  - Auth check, DynamoDB query, returns `profile + targets` DTO.
- `amplify/backend/function/updateProfile/src/index.js`
  - Validates input, recalculates macros, writes PROFILE + TARGETS items.
- `amplify/backend/function/lib/calculateMacros.js`
  - Shared macro calculation helper for Lambdas.
- DynamoDB: single-table design `NutriPilot-<env>`
  - Items: `PROFILE` and `TARGETS` keyed by user.

## Background Flow (US2)

### 1) Load profile on `/settings`
1. `ProfileForm` mounts and renders `ProfileProvider` + `useProfile`.
2. `useProfile` calls `fetchProfile()`.
3. `fetchProfile()` -> `API.get('/profile')` -> API Gateway -> `getProfile` Lambda.
4. Lambda queries DynamoDB and returns `{ profile, targets }`.
5. UI hydrates the form fields and targets card.

### 2) Recalculate + Save
1. User updates fields and clicks “Recalculate Targets”.
2. `ProfileForm` validates inputs and calls `saveProfile()`.
3. `saveProfile()` -> `API.post('/profile')` -> API Gateway -> `updateProfile` Lambda.
4. Lambda validates schema, computes macros via `calculateMacros`, writes PROFILE + TARGETS.
5. UI shows success banner and updated targets.

### 3) Reload
1. Page reload triggers fetch again.
2. Profile + targets are rehydrated from DynamoDB.

## Troubleshooting Guide

### UI shows “Unable to load profile”
- Check browser Network tab: GET `/profile` status.
- If 401/403: user is not authenticated or tokens missing.
- If 500: inspect `getProfile` Lambda logs (CloudWatch).

### Save fails with “Unable to save profile”
- Check POST `/profile` response body for validation errors.
- Confirm `updateProfile` Lambda logs for schema or calculation errors.
- Ensure payload fields match expected names (`bodyWeightKg`, `heightCm`, `ageYears`, `gender`, `activityLevel`, `goal`).

### Targets not updating after save
- Confirm POST `/profile` returns `{ targets: ... }`.
- Check `calculateMacros` helper is imported from `amplify/backend/function/lib/calculateMacros.js`.
- Verify DynamoDB items are updated (PROFILE + TARGETS).

### Profile form stays empty
- Use a known account with stored data.
- Confirm `getProfile` returns `profile` and `targets`.
- Check `ProfileForm` is wired to `ProfileProvider` and `useProfile` (no placeholder route).

## Auth Context (Background)
The profile APIs depend on a valid Cognito session:
- `signUp`: Amplify sends `username=email` + `password` → Cognito creates UNCONFIRMED user and emails code.
- `confirmSignUp`: Amplify sends `username=email` + `code` → Cognito marks user CONFIRMED.
- `signIn`: Amplify returns tokens.
- `SessionContext` reads current user and marks the app authenticated; API client injects auth headers.

## Useful Logs & Checks
- **CloudWatch**: `getProfile` and `updateProfile` Lambda logs.
- **DynamoDB**: confirm both PROFILE and TARGETS items exist for the user.
- **Network**: verify `/profile` GET and POST requests are authenticated and returning expected payloads.
