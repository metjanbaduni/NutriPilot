import React, { useState } from 'react';
import { confirmSignUp, signIn, signUp } from 'aws-amplify/auth';
import AuthShell from './AuthShell';

const INVALID_EMAIL_MESSAGE = 'Please enter valid email address.';
const WEAK_PASSWORD_MESSAGE = 'Password must be 8+ chars with uppercase, lowercase, number.';
const EMAIL_EXISTS_MESSAGE = 'Email already registered. Please sign in.';
const CONFIRMATION_ERROR_MESSAGE = 'Unable to confirm account. Please try again.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXISTING_ACCOUNT_CODES = new Set(['UsernameExistsException']);

/**
 * Validates that the email string is in a basic RFC-compliant format.
 * @param {string} value
 * @returns {string} Error message when invalid; otherwise empty string.
 */
function validateEmail(value) {
  return EMAIL_PATTERN.test(value) ? '' : INVALID_EMAIL_MESSAGE;
}

/**
 * Validates the password policy (min 8 chars, upper, lower, number).
 * @param {string} value
 * @returns {string} Error message when invalid; otherwise empty string.
 */
function validatePassword(value) {
  if (value.length < 8) {
    return WEAK_PASSWORD_MESSAGE;
  }
  if (!/[A-Z]/.test(value)) {
    return WEAK_PASSWORD_MESSAGE;
  }
  if (!/[a-z]/.test(value)) {
    return WEAK_PASSWORD_MESSAGE;
  }
  if (!/[0-9]/.test(value)) {
    return WEAK_PASSWORD_MESSAGE;
  }
  return '';
}

function getRegistrationErrorMessage(error) {
  const code = error?.code || error?.name;
  if (code && EXISTING_ACCOUNT_CODES.has(code)) {
    return EMAIL_EXISTS_MESSAGE;
  }
  return error?.message || EMAIL_EXISTS_MESSAGE;
}

function RegisterFormFields({
  email,
  password,
  errorMessage,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      {errorMessage ? (
        <div role="alert" aria-live="polite" className="auth-alert">
          {errorMessage}
        </div>
      ) : null}
      <div className="auth-field">
        <label className="auth-label" htmlFor="register-email">
          Email
        </label>
        <input
          id="register-email"
          className="auth-input"
          type="email"
          value={email}
          onChange={onEmailChange}
          autoComplete="email"
          placeholder="you@domain.com"
        />
      </div>
      <div className="auth-field">
        <label className="auth-label" htmlFor="register-password">
          Password
        </label>
        <input
          id="register-password"
          className="auth-input"
          type="password"
          value={password}
          onChange={onPasswordChange}
          autoComplete="new-password"
          placeholder="Create a strong password"
        />
      </div>
      <button className="auth-button" type="submit" disabled={isSubmitting}>
        Sign Up
      </button>
    </form>
  );
}

function ConfirmationFields({ code, errorMessage, isSubmitting, onCodeChange, onSubmit }) {
  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      {errorMessage ? (
        <div role="alert" aria-live="polite" className="auth-alert">
          {errorMessage}
        </div>
      ) : null}
      <div className="auth-field">
        <label className="auth-label" htmlFor="confirm-code">
          Confirmation Code
        </label>
        <input
          id="confirm-code"
          className="auth-input"
          type="text"
          value={code}
          onChange={onCodeChange}
          autoComplete="one-time-code"
          placeholder="6-digit code"
        />
      </div>
      <button className="auth-button" type="submit" disabled={isSubmitting}>
        Confirm
      </button>
    </form>
  );
}

function clearErrors(setValidationError, setAuthError) {
  setValidationError('');
  setAuthError('');
}

function createFieldChangeHandler(setter, clearErrorState) {
  return (event) => {
    setter(event.target.value);
    clearErrorState();
  };
}

function createRegisterHandler({
  email,
  password,
  setAuthError,
  setIsSubmitting,
  setStep,
  setValidationError,
}) {
  return async (event) => {
    event.preventDefault();
    setAuthError('');

    const trimmedEmail = email.trim();
    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    try {
      await signUp({ username: trimmedEmail, password });
      setStep('confirm');
    } catch (error) {
      setAuthError(getRegistrationErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };
}

function createConfirmHandler({
  code,
  email,
  password,
  setAuthError,
  setIsSubmitting,
  setValidationError,
}) {
  return async (event) => {
    event.preventDefault();
    clearErrors(setValidationError, setAuthError);
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedCode = code.trim();
      await confirmSignUp({ username: trimmedEmail, confirmationCode: trimmedCode });
      await signIn({ username: trimmedEmail, password });
    } catch {
      setAuthError(CONFIRMATION_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };
}

function createRegisterHandlers({
  code,
  email,
  password,
  setAuthError,
  setCode,
  setEmail,
  setIsSubmitting,
  setPassword,
  setStep,
  setValidationError,
}) {
  const clearErrorState = () => clearErrors(setValidationError, setAuthError);

  return {
    handleEmailChange: createFieldChangeHandler(setEmail, clearErrorState),
    handlePasswordChange: createFieldChangeHandler(setPassword, clearErrorState),
    handleCodeChange: createFieldChangeHandler(setCode, clearErrorState),
    handleRegister: createRegisterHandler({
      email,
      password,
      setAuthError,
      setIsSubmitting,
      setStep,
      setValidationError,
    }),
    handleConfirm: createConfirmHandler({
      code,
      email,
      password,
      setAuthError,
      setIsSubmitting,
      setValidationError,
    }),
  };
}

/**
 * Renders the registration form with confirmation flow and Amplify auth integration.
 * @returns {JSX.Element}
 */
export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('register');
  const [validationError, setValidationError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorMessage = validationError || authError;
  const handlers = createRegisterHandlers({
    code,
    email,
    password,
    setAuthError,
    setCode,
    setEmail,
    setIsSubmitting,
    setPassword,
    setStep,
    setValidationError,
  });

  const isConfirmStep = step === 'confirm';

  return (
    <AuthShell
      title={isConfirmStep ? 'Confirm your email' : 'Create your account'}
      subtitle={
        isConfirmStep
          ? 'Enter the 6-digit code we sent to your inbox.'
          : 'Start tracking macros with calm, minimal guidance.'
      }
      footer={
        isConfirmStep ? null : (
          <p className="auth-meta">
            Already have an account?{' '}
            <a className="auth-link" href="/login">
              Sign in
            </a>
          </p>
        )
      }
    >
      {isConfirmStep ? (
        <ConfirmationFields
          code={code}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onCodeChange={handlers.handleCodeChange}
          onSubmit={handlers.handleConfirm}
        />
      ) : (
        <RegisterFormFields
          email={email}
          password={password}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onEmailChange={handlers.handleEmailChange}
          onPasswordChange={handlers.handlePasswordChange}
          onSubmit={handlers.handleRegister}
        />
      )}
    </AuthShell>
  );
}
