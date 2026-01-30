import { API, Auth } from 'aws-amplify';

const API_NAME = 'nutripilotapi';
const AUTH_HEADER_NAME = 'Authorization';
const DEFAULT_ERROR_MESSAGE = 'Request failed';
const INVALID_PATH_MESSAGE = 'API path must be a non-empty string';
const INVALID_HEADERS_MESSAGE = 'Headers must be an object';
const MISSING_TOKEN_MESSAGE = 'Authentication token missing';
const MISSING_SESSION_MESSAGE = 'Authentication session unavailable';
const UNKNOWN_STATUS_CODE = 0;
const ERROR_NAME = 'ApiClientError';

class ApiClientError extends Error {
  constructor(message, { statusCode, details }) {
    super(message);
    this.name = ERROR_NAME;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function normalizeError(error) {
  const response = error?.response;
  const statusCode = response?.status ?? error?.statusCode ?? UNKNOWN_STATUS_CODE;
  const responseMessage = response?.data?.message;
  const message = isNonEmptyString(responseMessage)
    ? responseMessage
    : error?.message || DEFAULT_ERROR_MESSAGE;
  const details = response?.data ?? error;

  return new ApiClientError(message, { statusCode, details });
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeHeaders(headers) {
  if (!headers) {
    return {};
  }

  if (typeof headers !== 'object' || Array.isArray(headers)) {
    throw new Error(INVALID_HEADERS_MESSAGE);
  }

  return { ...headers };
}

async function getAuthToken() {
  if (typeof Auth.currentSession !== 'function') {
    throw new Error(MISSING_SESSION_MESSAGE);
  }

  const session = await Auth.currentSession();
  const idToken = session?.getIdToken?.();
  const token = idToken?.getJwtToken?.();

  if (!token) {
    throw new Error(MISSING_TOKEN_MESSAGE);
  }

  return token;
}

async function getSignedHeaders(headers) {
  const token = await getAuthToken();
  const normalizedHeaders = normalizeHeaders(headers);

  return {
    ...normalizedHeaders,
    [AUTH_HEADER_NAME]: token,
  };
}

function buildRequestInit(init, headers) {
  const baseInit = init && typeof init === 'object' ? { ...init } : {};
  return { ...baseInit, headers };
}

/**
 * Sends a signed request using the provided Amplify API method.
 * @param {Function} apiCall - Amplify API method to invoke.
 * @param {string} path - API path starting with `/`.
 * @param {object} [init] - Amplify request init.
 * @returns {Promise<any>}
 * @throws {Error} When validation fails or the request errors.
 */
async function request(apiCall, path, init) {
  try {
    if (!isNonEmptyString(path)) {
      throw new Error(INVALID_PATH_MESSAGE);
    }

    const headers = await getSignedHeaders(init?.headers);
    const requestInit = buildRequestInit(init, headers);

    return await apiCall(API_NAME, path, requestInit);
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Sends a signed GET request through Amplify API.
 * @param {string} path - API path starting with `/`.
 * @param {object} [init] - Amplify request init.
 * @returns {Promise<any>}
 * @throws {Error} When the request fails or auth is unavailable.
 */
export async function get(path, init) {
  return request(API.get, path, init);
}

/**
 * Sends a signed POST request through Amplify API.
 * @param {string} path - API path starting with `/`.
 * @param {object} [init] - Amplify request init.
 * @returns {Promise<any>}
 * @throws {Error} When the request fails or auth is unavailable.
 */
export async function post(path, init) {
  return request(API.post, path, init);
}
