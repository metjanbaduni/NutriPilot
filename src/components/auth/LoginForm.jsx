import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import AuthShell from './AuthShell';

const INVALID_EMAIL_MESSAGE = 'Please enter valid email address.';
const WEAK_PASSWORD_MESSAGE = 'Password must be 8+ chars with uppercase, lowercase, number.';
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value) {
  return EMAIL_PATTERN.test(value) ? '' : INVALID_EMAIL_MESSAGE;
}

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

function getAuthErrorMessage() {
  return INVALID_CREDENTIALS_MESSAGE;
}

function LoginFormFields({
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
        <label className="auth-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          className="auth-input"
          type="email"
          value={email}
          onChange={onEmailChange}
          autoComplete="email"
          placeholder="you@domain.com"
        />
      </div>
      <div className="auth-field">
        <label className="auth-label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          className="auth-input"
          type="password"
          value={password}
          onChange={onPasswordChange}
          autoComplete="current-password"
          placeholder="Password"
        />
      </div>
      <button className="auth-button" type="submit" disabled={isSubmitting}>
        Sign In
      </button>
    </form>
  );
}

/**
 * Renders the login form with validation and Amplify sign-in handling.
 * @returns {JSX.Element}
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (setter) => (event) => {
    setter(event.target.value);
    setValidationError('');
    setAuthError('');
  };

  const handleSubmit = async (event) => {
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
      await signIn({ username: trimmedEmail, password });
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep your macro targets on track."
      footer={
        <p className="auth-meta">
          New to NutriPilot?{' '}
          <a className="auth-link" href="/signup">
            Create an account
          </a>
        </p>
      }
    >
      <LoginFormFields
        email={email}
        password={password}
        errorMessage={validationError || authError}
        isSubmitting={isSubmitting}
        onEmailChange={handleFieldChange(setEmail)}
        onPasswordChange={handleFieldChange(setPassword)}
        onSubmit={handleSubmit}
      />
    </AuthShell>
  );
}
