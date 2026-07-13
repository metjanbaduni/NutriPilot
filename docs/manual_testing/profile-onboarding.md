# US2 Manual Testing - Profile Onboarding & Targets

## Purpose
Verify that authenticated users can load and update their profile, recalculate macro targets, and persist PROFILE + TARGETS in DynamoDB.

## Preconditions
- Backend deployed for the current env (Cognito + API Gateway + Lambdas).
- You can sign in with a valid test account.
- The profile form is reachable in the UI (expected route: `/settings`).
  - If the app still shows a placeholder at `/settings`, temporarily render `ProfileForm` there for testing.

## Completion Checklist (US2)
- [ ] All US2 tasks in `specs/000-planning-phase/tasks.md` are marked complete (T019–T026A).
- [ ] `npm test` passes.
- [ ] `npm run test:coverage` passes with ≥80% global coverage.
- [ ] `npm run lint` passes.
- [ ] `npm run format:check` passes.
- [ ] Manual tests below executed and passed.

---

## Manual Test Steps

### Case A - Load existing profile
1. Sign in and open `/settings`.
2. Expect: form prefilled with saved values; targets card shows calories/protein/carbs/fats.
3. Expect: no error banner.

### Case B - Empty state (no saved profile)
1. Use a fresh account (no profile stored).
2. Open `/settings`.
3. Expect: empty-state message ("Start your profile" + helper copy), blank fields, no targets.

### Case C - Validation errors
1. Leave all fields empty.
2. Click “Recalculate Targets”.
3. Expect: required field errors on each input.
4. Enter age as a decimal (e.g., `34.5`) and click Recalculate.
5. Expect: “Age must be an integer.”
6. Enter out-of-range values (e.g., weight 10 kg).
7. Expect: range error message.

### Case D - Successful save + recalculation
1. Fill in valid values:
   - Weight (kg), Height (cm), Age (integer), Gender, Training Level, Goal.
2. Click “Recalculate Targets”.
3. Expect: success banner (profile saved), targets card populated.

### Case E - Error state + retry
1. Simulate a network or API error (disconnect or force API failure).
2. Open `/settings`.
3. Expect: error banner with “Retry” action.
4. Restore connectivity and click “Retry”.
5. Expect: data loads successfully.

### Case F - Persistence check (Independent Test)
1. Complete Case D.
2. Reload the page.
3. Expect: same values and targets are prefilled.
4. In DynamoDB table `NutriPilot-<env>`, verify the user has:
   - a `PROFILE` item (updated fields)
   - a `TARGETS` item (recalculated macros)

## Notes
- If the ProfileForm is not yet wired to `/settings`, consider a temporary mount for validation and then revert.
- If DynamoDB access is restricted, use API logs or CloudWatch to confirm successful writes.
