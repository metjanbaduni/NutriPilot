/**
 * Maps auth and API failures to friendly, user-safe messages.
 *
 * Constitution rule "Error Messages": users see generic text, detail stays in logs.
 * A raw `error.message` from Amplify or the backend must never reach the UI, so every
 * lookup here falls back to a constant rather than to the error's own message.
 *
 * Amplify v6 exposes the code as `error.name`; v5 used `error.code`. Both are read.
 */

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';
export const UNCONFIRMED_ACCOUNT_MESSAGE =
  'Your account is not confirmed yet. Check your email for the confirmation code.';
export const EMAIL_EXISTS_MESSAGE = 'Email already registered. Please sign in.';
export const WEAK_PASSWORD_MESSAGE = 'Password must be 8+ chars with uppercase, lowercase, number.';
export const RATE_LIMITED_MESSAGE = 'Too many attempts. Please wait a moment and try again.';
export const PASSWORD_RESET_MESSAGE = 'Password reset required. Please reset your password.';
export const INVALID_INPUT_MESSAGE = 'Please check your entries and try again.';
export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';
export const CONFIRMATION_CODE_MESSAGE = 'That confirmation code is incorrect. Please try again.';
export const EXPIRED_CODE_MESSAGE = 'That confirmation code has expired. Request a new one.';
export const CONFIRMATION_FAILED_MESSAGE = 'Unable to confirm account. Please try again.';

/**
 * Sign-in failures.
 *
 * `UserNotFoundException` deliberately shares `INVALID_CREDENTIALS_MESSAGE` with
 * `NotAuthorizedException`: a distinct message would turn the login form into an
 * account-existence oracle.
 *
 * `UserNotConfirmedException` deliberately does NOT share it. This is a known,
 * accepted trade-off (T047): the message reveals that an account exists, but the
 * alternative strands a legitimate user with no route to re-confirm. Do not
 * "harden" this back into a generic message without replacing the recovery path.
 */
const SIGN_IN_MESSAGES = {
  NotAuthorizedException: INVALID_CREDENTIALS_MESSAGE,
  UserNotFoundException: INVALID_CREDENTIALS_MESSAGE,
  UserNotConfirmedException: UNCONFIRMED_ACCOUNT_MESSAGE,
  PasswordResetRequiredException: PASSWORD_RESET_MESSAGE,
  TooManyRequestsException: RATE_LIMITED_MESSAGE,
  LimitExceededException: RATE_LIMITED_MESSAGE,
};

const SIGN_UP_MESSAGES = {
  UsernameExistsException: EMAIL_EXISTS_MESSAGE,
  InvalidPasswordException: WEAK_PASSWORD_MESSAGE,
  InvalidParameterException: INVALID_INPUT_MESSAGE,
  TooManyRequestsException: RATE_LIMITED_MESSAGE,
  LimitExceededException: RATE_LIMITED_MESSAGE,
};

const CONFIRMATION_MESSAGES = {
  CodeMismatchException: CONFIRMATION_CODE_MESSAGE,
  ExpiredCodeException: EXPIRED_CODE_MESSAGE,
  NotAuthorizedException: CONFIRMATION_CODE_MESSAGE,
  TooManyRequestsException: RATE_LIMITED_MESSAGE,
  LimitExceededException: RATE_LIMITED_MESSAGE,
};

const API_STATUS_MESSAGES = {
  400: INVALID_INPUT_MESSAGE,
  401: SESSION_EXPIRED_MESSAGE,
  403: SESSION_EXPIRED_MESSAGE,
  422: INVALID_INPUT_MESSAGE,
  429: RATE_LIMITED_MESSAGE,
};

/**
 * Reads the provider error code, tolerating both Amplify major versions.
 * @param {unknown} error
 * @returns {string} The error code, or an empty string when absent.
 */
function getErrorCode(error) {
  return error?.code || error?.name || '';
}

/**
 * Looks a code up in a message map, never falling through to `error.message`.
 * @param {object} messages Map of provider code to user-facing text.
 * @param {unknown} error
 * @param {string} fallback Text used when the code is unknown or absent.
 * @returns {string}
 */
function resolveMessage(messages, error, fallback) {
  return messages[getErrorCode(error)] || fallback;
}

/**
 * Maps a Cognito sign-in failure to user-facing text.
 * @param {unknown} error
 * @returns {string}
 */
export function getSignInErrorMessage(error) {
  return resolveMessage(SIGN_IN_MESSAGES, error, INVALID_CREDENTIALS_MESSAGE);
}

/**
 * Maps a Cognito sign-up failure to user-facing text.
 * @param {unknown} error
 * @returns {string}
 */
export function getSignUpErrorMessage(error) {
  return resolveMessage(SIGN_UP_MESSAGES, error, GENERIC_ERROR_MESSAGE);
}

/**
 * Maps a Cognito confirmation failure to user-facing text.
 * @param {unknown} error
 * @returns {string}
 */
export function getConfirmationErrorMessage(error) {
  return resolveMessage(CONFIRMATION_MESSAGES, error, CONFIRMATION_FAILED_MESSAGE);
}

/**
 * Maps an ApiClientError to user-facing text using its HTTP status code.
 * Backend errors are status-shaped, not Cognito-code-shaped, so they map separately.
 * @param {unknown} error An ApiClientError carrying `statusCode` (see src/api/client.js).
 * @param {string} [fallback] Screen-specific text for unmapped statuses.
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = GENERIC_ERROR_MESSAGE) {
  return API_STATUS_MESSAGES[error?.statusCode] || fallback;
}
