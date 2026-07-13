# Architecture & Troubleshooting Docs

This folder holds per-story architecture overviews and troubleshooting notes.

## Expected Files (per user story)
- `usX-<story-slug>.md` with:
  - Goal and scope
  - Frontend components/hooks
  - Backend Lambdas and DynamoDB access patterns
  - End-to-end flow (request → Lambda → Dynamo → UI)
  - Troubleshooting guide (common errors + checks)
  - Relevant auth background if the story depends on Cognito

## Current Docs
- `us2-profile-onboarding.md`
