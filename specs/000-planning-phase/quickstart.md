# Quickstart – NutriPilot MVP

## Prerequisites
- Node.js 20.x
- npm 10+
- AWS Amplify CLI (`npm install -g @aws-amplify/cli`)
- AWS credentials with access to target account
- OpenAI API key stored in AWS Secrets Manager (`nutripilot/openai`) per infra runbook

## 5-Minute Setup
1. `npm install`
2. `amplify pull --appId <APP_ID> --envName dev`
3. Create `.env` from `.env.example`; set `VITE_AMPLIFY_REGION`, `OPENAI_SECRET_ID`, and monitoring flags.
4. `npm run dev` → opens http://localhost:8080 for the static shell.
5. In another shell, run `amplify mock api` for local Lambda testing or deploy with `amplify push` before end-to-end flows.

## Running Tests & Quality Gates
- `npm test` for the full Jest suite (components + lambdas).
- `npm run lint && npm run format:check` before committing.
- `npm run test:coverage` → ensure ≥80% coverage (fails CI otherwise).

## Deploy Checklist
1. `npm run build` (to be added with Vite) and `npm test` → green.
2. `amplify push` to deploy backend + hosting.
3. `npm run lint` + `npm run format:check`.
4. Update `docs/decisions/` with any architecture changes.
5. Capture dashboard + settings screenshots for PR description.

## Troubleshooting
- **403s on API calls**: Verify Cognito user belongs to environment and JWT not expired.
- **Amplify auth state loop**: Clear localStorage `amplify-authenticator-cache` and re-login.
- **OpenAI timeouts**: Check CloudWatch logs for `analyzeMeal` retries; fallback to manual macros in UI.
- **DynamoDB schema mismatch**: Run `amplify status` and ensure latest `backend-config.json` is pulled.
