// This file is used to override the REST API resources configuration
import {
  AmplifyApiRestResourceStackTemplate,
  AmplifyProjectInfo,
} from '@aws-amplify/cli-extensibility-helper';

/**
 * !!! ENVIRONMENT-SPECIFIC HARDCODED VALUE — `dev` ONLY !!!
 *
 * This is the ARN of the `dev` environment's Cognito user pool (nutripilot9b62e7df).
 * It is hardcoded because the API stack has no `dependsOn` relationship with the auth
 * category, so there is no CloudFormation parameter to reference. The only interactive
 * CLI route that would add that dependency is "Restrict API access -> Yes", which
 * re-introduces the IAM/SigV4 authorization this override exists to replace.
 *
 * ADDING A SECOND ENVIRONMENT WILL SILENTLY BREAK THIS: the new environment would
 * authorize against dev's user pool, so its tokens are rejected and every /profile
 * call returns 401. See backlog task T053 before running `amplify env add`.
 */
const DEV_COGNITO_USER_POOL_ARN =
  'arn:aws:cognito-idp:us-east-1:880079111164:userpool/us-east-1_EgiqTyXNa';

const AUTHORIZER_NAME = 'CognitoUserPoolAuthorizer';
const PROTECTED_PATH_PREFIX = '/profile';
const ANY_METHOD_KEY = 'x-amazon-apigateway-any-method';

export function override(
  resources: AmplifyApiRestResourceStackTemplate,
  amplifyProjectInfo: AmplifyProjectInfo
) {
  const body = resources.restApi.body as Record<string, any>;

  if (!body || !body.paths) {
    throw new Error(
      'override.ts: REST API swagger body is not populated at override time. ' +
        'The Cognito authorizer was NOT applied — do not push.'
    );
  }

  // Declare the authorizer. API Gateway materializes it from this extension at
  // import time; there is no separate AWS::ApiGateway::Authorizer resource.
  body.securityDefinitions = {
    ...(body.securityDefinitions ?? {}),
    [AUTHORIZER_NAME]: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      'x-amazon-apigateway-authtype': 'cognito_user_pools',
      'x-amazon-apigateway-authorizer': {
        type: 'cognito_user_pools',
        providerARNs: [DEV_COGNITO_USER_POOL_ARN],
      },
    },
  };

  // Attach it to every /profile path variant (Amplify generates both `/profile`
  // and `/profile/{proxy+}`). `options` is deliberately left unauthenticated —
  // CORS preflight carries no Authorization header and would fail otherwise.
  const protectedPaths = Object.keys(body.paths).filter(
    (path) => path === PROTECTED_PATH_PREFIX || path.startsWith(`${PROTECTED_PATH_PREFIX}/`)
  );

  for (const path of protectedPaths) {
    const anyMethod = body.paths[path]?.[ANY_METHOD_KEY];

    if (!anyMethod) {
      throw new Error(
        `override.ts: path "${path}" has no ${ANY_METHOD_KEY} to secure. ` +
          'Refusing to deploy a partially-authorized API.'
      );
    }

    anyMethod.security = [{ [AUTHORIZER_NAME]: [] }];
  }

  // A silent no-op here would deploy /profile with no authorization at all.
  if (protectedPaths.length === 0) {
    throw new Error(
      `override.ts: no paths matched "${PROTECTED_PATH_PREFIX}" — found: ` +
        `${Object.keys(body.paths).join(', ')}. The authorizer was NOT attached.`
    );
  }
}
