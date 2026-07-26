# ADR 0001: Lambda routing, authorizer, and shared-code pattern for API Gateway + Lambda

**Status:** Accepted
**Context:** T046 (register profile Lambdas + API Gateway routes)

## Decision 1: one Lambda per API path, dispatching internally by HTTP method

Amplify's Gen1 REST API category (`amplify add/update api`) binds exactly one Lambda
integration per path, using an `x-amazon-apigateway-any-method` (ANY method) proxy
integration — confirmed by inspecting the generated swagger for the existing `/api`
path in `amplify/backend/api/nutripilotapi/build/nutripilotapi-cloudformation-template.json`.
There is no interactive-flow way to bind GET and POST on the same path to two
different Lambda functions.

`/profile` needs GET (fetch) and POST (update) with different logic. **Every
multi-verb path gets one Amplify-registered function that dispatches internally by
`event.httpMethod`** to separate handler modules living alongside it (e.g.
`profileFunction/src/index.js` dispatches to `getProfile.js` / `updateProfile.js`
in the same directory). Single-verb paths (e.g. `getDashboard` for `GET /dashboard`)
stay 1:1 — no dispatcher needed.

This pattern is reused by T027 (dashboard, single-verb, no dispatcher needed) and
T037–T040 (`/meals` needs POST `saveMeal` + GET `getMeals` — same dispatcher shape
as `/profile`).

## Decision 2: Cognito User Pool authorizer via `amplify override api`, not the default IAM restrict flow

`getProfile.js`/`updateProfile.js` read `event.requestContext.authorizer.claims.sub`
(the REST API `COGNITO_USER_POOLS` authorizer event shape), and
`specs/000-planning-phase/contracts/openapi.yaml` declares `cognitoJwt` bearer/JWT
security. `src/api/client.js` sends the raw Cognito ID token as a manually-set
`Authorization` header (no SigV4 signing — confirmed Amplify v6 skips its automatic
SigV4 signing when a custom `Authorization` header is already present).

Amplify's interactive `add/update api` → "Restrict API access" flow only produces
**AWS_IAM (SigV4)** authorization — confirmed from the existing `/api` path's
generated swagger (`"security": [{"sigv4": []}]`) and
`amplify/backend/api/APIGatewayAuthStack.json` (an IAM policy granting
`execute-api:Invoke`, not a Cognito authorizer). IAM auth populates different event
fields than what the handlers expect.

**Decision:** attach `/profile`'s path with "Restrict API access: No" (the IAM
restriction is irrelevant to us and would just add an unused policy branch), then
use `amplify override api` (the official CDK-override mechanism, `overrides: true`
already enabled in `amplify/cli.json`) to attach a real `COGNITO_USER_POOLS`
authorizer referencing the `nutripilot9b62e7df` user pool. Verified post-generation
by inspecting the synthesized CFN for `/profile`'s method: `AuthorizationType` and
`AuthorizerId` traced to an `Authorizer` resource with `Type: COGNITO_USER_POOLS`
and `ProviderARNs` pointing at the real user pool ARN — not just an authorizer
resource that exists but isn't attached.

## Decision 3: shared Lambda code via a Lambda Layer, packed as a tarball dependency

`getProfile.js`/`updateProfile.js` originally required shared code via
`../../lib/dynamoClient`, reaching outside the function's own `src/` — Amplify's
Node function build only zips each function's own `src/` directory, so this would
throw `Cannot find module` in the deployed Lambda despite working in Jest.

Rejected: a `file:` dependency directly in the function's own `package.json`.
Confirmed empirically that npm resolves directory `file:` dependencies via
**symlink**, not copy, and whether Amplify's zip step dereferences symlinks into
real file content is unverified (and unverifiable without an actual `amplify
push` — local `amplify function build` / `amplify build` are no-ops for a
not-yet-pushed Lambda layer resource, confirmed empirically: exit 0, no output,
no `node_modules` materialized).

**Decision:** package shared code (`dynamoClient.js`, `calculateMacros.js`) as a
Lambda Layer (`nutripilotnutripilotLambdaLib` — Amplify's actual generated name,
double "nutripilot" prefix). Source of truth lives at
`.../lib/nutripilot-lambda-lib-src/` as plain, git-tracked files; `npm pack`
produces a `.tgz`, and the layer's `lib/nodejs/package.json` depends on it via
`file:../nutripilot-lambda-lib-src/nutripilot-lambda-lib-1.0.0.tgz`. Installing
from an archive (as opposed to a directory) always extracts a real copy, avoiding
the symlink question entirely. This also avoids a second empirically-confirmed
problem: plain `npm install` prunes node_modules content that isn't a *declared*
dependency, so manually placing files directly under
`lib/nodejs/node_modules/nutripilot-lambda-lib/` without declaring them would be
silently deleted on the next `amplify push`.

Any function attaching this layer must still declare its own directly-`require`d
packages (e.g. `@aws-sdk/lib-dynamodb`) in its own `src/package.json` — the layer
only satisfies requires reachable by walking up from *within* the layer's own
`node_modules`, not the consuming function's.

Note this sidesteps a tooling gap that an earlier candidate approach (placing
authored source directly under `lib/nodejs/node_modules/nutripilot-lambda-lib/`,
required by the raw AWS Lambda Node layer convention) would have hit: ESLint and
git both default-ignore anything under a `node_modules/` path segment, which would
have silently dropped `dynamoClient.js`/`calculateMacros.js` from both lint and
version control. Keeping the source at `nutripilot-lambda-lib-src/` (outside
`node_modules`, only packed into the layer's `node_modules/` as a build artifact)
avoids that entirely — no ignore-pattern workarounds needed.
