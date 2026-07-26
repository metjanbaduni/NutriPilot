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

function toJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
    return getProfile(event);
  }

  if (method === 'POST') {
    return updateProfile(event);
  }

  return toJsonResponse(405, { success: false, message: METHOD_NOT_ALLOWED_MESSAGE });
};
