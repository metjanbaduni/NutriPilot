import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { signIn } from 'aws-amplify/auth';
import LoginForm from '../../../src/components/auth/LoginForm';

const INVALID_EMAIL_MESSAGE = 'Please enter valid email address.';
const WEAK_PASSWORD_MESSAGE = 'Password must be 8+ chars with uppercase, lowercase, number.';
const SIGN_IN_ERROR_MESSAGE = 'Invalid email or password.';
const UNCONFIRMED_ACCOUNT_MESSAGE =
  'Your account is not confirmed yet. Check your email for the confirmation code.';

describe('LoginForm', () => {
  beforeEach(() => {
    signIn.mockReset();
  });

  test('shows validation error for invalid email', async () => {
    // Arrange
    render(<LoginForm />);

    // Act
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(await screen.findByText(INVALID_EMAIL_MESSAGE)).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  test('shows policy error for weak password', async () => {
    // Arrange
    render(<LoginForm />);

    // Act
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'weakpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(await screen.findByText(WEAK_PASSWORD_MESSAGE)).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  test('tells an unconfirmed user to confirm instead of blaming their password', async () => {
    // Arrange
    const error = new Error('User is not confirmed.');
    error.name = 'UserNotConfirmedException';
    signIn.mockRejectedValueOnce(error);
    render(<LoginForm />);

    // Act
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(await screen.findByText(UNCONFIRMED_ACCOUNT_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(SIGN_IN_ERROR_MESSAGE)).not.toBeInTheDocument();
  });

  test('shows the credentials message without leaking the raw error', async () => {
    // Arrange
    signIn.mockRejectedValueOnce(new Error('User pool client 4f9x does not exist'));
    render(<LoginForm />);

    // Act
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(await screen.findByText(SIGN_IN_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(/User pool client/)).not.toBeInTheDocument();
  });

  test('shows error banner when sign-in fails', async () => {
    // Arrange
    const error = new Error('boom');
    error.name = 'NotAuthorizedException';
    signIn.mockRejectedValueOnce(error);
    render(<LoginForm />);

    // Act
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(await screen.findByText(SIGN_IN_ERROR_MESSAGE)).toBeInTheDocument();
  });

  test('submits with valid inputs', async () => {
    // Arrange
    signIn.mockResolvedValueOnce({});
    render(<LoginForm />);

    // Act
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        username: 'user@example.com',
        password: 'StrongPass1',
      });
    });
  });
});
