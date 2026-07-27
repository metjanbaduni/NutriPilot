import {
  CONFIRMATION_CODE_MESSAGE,
  CONFIRMATION_FAILED_MESSAGE,
  EMAIL_EXISTS_MESSAGE,
  EXPIRED_CODE_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
  INVALID_INPUT_MESSAGE,
  PASSWORD_RESET_MESSAGE,
  RATE_LIMITED_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  UNCONFIRMED_ACCOUNT_MESSAGE,
  WEAK_PASSWORD_MESSAGE,
  getApiErrorMessage,
  getConfirmationErrorMessage,
  getSignInErrorMessage,
  getSignUpErrorMessage,
} from '../../src/utils/errorMessages';

const RAW_LEAK_MESSAGE = 'User pool client 4f9x does not exist in region us-east-1';

/**
 * Builds a provider-shaped error carrying a code on `name` (Amplify v6 shape).
 * @param {string} name
 * @returns {Error}
 */
function createCognitoError(name) {
  const error = new Error(RAW_LEAK_MESSAGE);
  error.name = name;
  return error;
}

describe('getSignInErrorMessage', () => {
  test.each([
    ['NotAuthorizedException', INVALID_CREDENTIALS_MESSAGE],
    ['UserNotFoundException', INVALID_CREDENTIALS_MESSAGE],
    ['UserNotConfirmedException', UNCONFIRMED_ACCOUNT_MESSAGE],
    ['PasswordResetRequiredException', PASSWORD_RESET_MESSAGE],
    ['TooManyRequestsException', RATE_LIMITED_MESSAGE],
    ['LimitExceededException', RATE_LIMITED_MESSAGE],
  ])('maps %s to its friendly message', (code, expected) => {
    // Arrange
    const error = createCognitoError(code);

    // Act
    const result = getSignInErrorMessage(error);

    // Assert
    expect(result).toBe(expected);
  });

  test('does not reveal whether an account exists via UserNotFoundException', () => {
    // Arrange
    const missing = createCognitoError('UserNotFoundException');
    const wrongPassword = createCognitoError('NotAuthorizedException');

    // Act
    const missingMessage = getSignInErrorMessage(missing);
    const wrongPasswordMessage = getSignInErrorMessage(wrongPassword);

    // Assert
    expect(missingMessage).toBe(wrongPasswordMessage);
  });

  test('falls back to invalid credentials for an unknown code', () => {
    // Arrange
    const error = createCognitoError('SomeFutureException');

    // Act
    const result = getSignInErrorMessage(error);

    // Assert
    expect(result).toBe(INVALID_CREDENTIALS_MESSAGE);
  });
});

describe('getSignUpErrorMessage', () => {
  test.each([
    ['UsernameExistsException', EMAIL_EXISTS_MESSAGE],
    ['InvalidPasswordException', WEAK_PASSWORD_MESSAGE],
    ['InvalidParameterException', INVALID_INPUT_MESSAGE],
    ['TooManyRequestsException', RATE_LIMITED_MESSAGE],
    ['LimitExceededException', RATE_LIMITED_MESSAGE],
  ])('maps %s to its friendly message', (code, expected) => {
    // Arrange
    const error = createCognitoError(code);

    // Act
    const result = getSignUpErrorMessage(error);

    // Assert
    expect(result).toBe(expected);
  });

  test('falls back to the generic message rather than claiming the email exists', () => {
    // Arrange
    const networkFailure = new Error('Network request failed');

    // Act
    const result = getSignUpErrorMessage(networkFailure);

    // Assert
    expect(result).toBe(GENERIC_ERROR_MESSAGE);
    expect(result).not.toBe(EMAIL_EXISTS_MESSAGE);
  });
});

describe('getConfirmationErrorMessage', () => {
  test.each([
    ['CodeMismatchException', CONFIRMATION_CODE_MESSAGE],
    ['ExpiredCodeException', EXPIRED_CODE_MESSAGE],
    ['NotAuthorizedException', CONFIRMATION_CODE_MESSAGE],
    ['TooManyRequestsException', RATE_LIMITED_MESSAGE],
  ])('maps %s to its friendly message', (code, expected) => {
    // Arrange
    const error = createCognitoError(code);

    // Act
    const result = getConfirmationErrorMessage(error);

    // Assert
    expect(result).toBe(expected);
  });

  test('falls back to the confirmation-specific message for an unknown code', () => {
    // Arrange
    const error = createCognitoError('SomeFutureException');

    // Act
    const result = getConfirmationErrorMessage(error);

    // Assert
    expect(result).toBe(CONFIRMATION_FAILED_MESSAGE);
  });
});

describe('getApiErrorMessage', () => {
  test.each([
    [400, INVALID_INPUT_MESSAGE],
    [401, SESSION_EXPIRED_MESSAGE],
    [403, SESSION_EXPIRED_MESSAGE],
    [422, INVALID_INPUT_MESSAGE],
    [429, RATE_LIMITED_MESSAGE],
  ])('maps status %s to its friendly message', (statusCode, expected) => {
    // Arrange
    const error = Object.assign(new Error(RAW_LEAK_MESSAGE), { statusCode });

    // Act
    const result = getApiErrorMessage(error, 'Unable to save profile.');

    // Assert
    expect(result).toBe(expected);
  });

  test('uses the caller fallback for an unmapped status', () => {
    // Arrange
    const error = Object.assign(new Error(RAW_LEAK_MESSAGE), { statusCode: 500 });

    // Act
    const result = getApiErrorMessage(error, 'Unable to save profile.');

    // Assert
    expect(result).toBe('Unable to save profile.');
  });

  test('uses the generic message when no fallback is supplied', () => {
    // Arrange
    const error = Object.assign(new Error(RAW_LEAK_MESSAGE), { statusCode: 0 });

    // Act
    const result = getApiErrorMessage(error);

    // Assert
    expect(result).toBe(GENERIC_ERROR_MESSAGE);
  });
});

describe('raw provider detail never reaches the caller', () => {
  test.each([
    ['getSignInErrorMessage', getSignInErrorMessage],
    ['getSignUpErrorMessage', getSignUpErrorMessage],
    ['getConfirmationErrorMessage', getConfirmationErrorMessage],
    ['getApiErrorMessage', getApiErrorMessage],
  ])('%s never returns error.message', (_name, mapper) => {
    // Arrange
    const error = new Error(RAW_LEAK_MESSAGE);

    // Act
    const result = mapper(error);

    // Assert
    expect(result).not.toBe(RAW_LEAK_MESSAGE);
    expect(result).not.toContain('us-east-1');
  });

  test.each([
    ['getSignInErrorMessage', getSignInErrorMessage, INVALID_CREDENTIALS_MESSAGE],
    ['getSignUpErrorMessage', getSignUpErrorMessage, GENERIC_ERROR_MESSAGE],
    ['getConfirmationErrorMessage', getConfirmationErrorMessage, CONFIRMATION_FAILED_MESSAGE],
    ['getApiErrorMessage', getApiErrorMessage, GENERIC_ERROR_MESSAGE],
  ])('%s tolerates a null error', (_name, mapper, expected) => {
    // Arrange, Act
    const result = mapper(null);

    // Assert
    expect(result).toBe(expected);
  });

  test('reads a v5-style code on error.code as well as error.name', () => {
    // Arrange
    const legacyError = new Error(RAW_LEAK_MESSAGE);
    legacyError.code = 'UsernameExistsException';

    // Act
    const result = getSignUpErrorMessage(legacyError);

    // Assert
    expect(result).toBe(EMAIL_EXISTS_MESSAGE);
  });
});
