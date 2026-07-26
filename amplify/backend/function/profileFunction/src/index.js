/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_NUTRIPILOTTABLE_ARN
	STORAGE_NUTRIPILOTTABLE_NAME
	STORAGE_NUTRIPILOTTABLE_STREAMARN
Amplify Params - DO NOT EDIT */

const { handler: getProfile } = require('./getProfile');
const { handler: updateProfile } = require('./updateProfile');

const METHOD_NOT_ALLOWED_MESSAGE = 'Method not allowed';

// The /profile integration is aws_proxy: API Gateway returns whatever this Lambda
// returns, so CORS headers on real responses must originate here. API Gateway's own
// responses are already covered — the OPTIONS mock handles preflight and the
// DEFAULT_4XX/5XX gateway responses cover authorizer rejections. Only Allow-Origin is
// meaningful on an actual response; Allow-Methods/Allow-Headers are preflight-only.
// '*' matches what the OPTIONS mock advertises — the two must agree — and grants no
// ambient authority here because auth is a bearer token, not a cookie.
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

function toJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/**
 * Adds the CORS headers the browser needs onto a handler response.
 * @param {import('aws-lambda').APIGatewayProxyResult} response - Handler response.
 * @returns {import('aws-lambda').APIGatewayProxyResult} Response with CORS headers.
 */
function withCorsHeaders(response) {
  return {
    ...response,
    headers: { ...CORS_HEADERS, ...(response?.headers ?? {}) },
  };
}

/**
 * Routes /profile requests to the GET or POST handler by HTTP method. API Gateway
 * binds one Lambda per path (ANY method), so multi-verb paths dispatch internally.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event - API Gateway event.
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} Handler response.
 */
exports.handler = async (event) => {
  const method = event?.httpMethod;

  if (method === 'GET') {
    return withCorsHeaders(await getProfile(event));
  }

  if (method === 'POST') {
    return withCorsHeaders(await updateProfile(event));
  }

  const notAllowed = toJsonResponse(405, { success: false, message: METHOD_NOT_ALLOWED_MESSAGE });
  return withCorsHeaders(notAllowed);
};
