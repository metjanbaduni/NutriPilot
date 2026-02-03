import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { signIn } from 'aws-amplify/auth';
import LoginForm from '../../../src/components/auth/LoginForm';

const INVALID_EMAIL_MESSAGE = 'Please enter valid email address.';
const WEAK_PASSWORD_MESSAGE = 'Password must be 8+ chars with uppercase, lowercase, number.';
const SIGN_IN_ERROR_MESSAGE = 'Invalid email or password';

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

  test('shows error banner when sign-in fails', async () => {
    // Arrange
    signIn.mockRejectedValueOnce(new Error(SIGN_IN_ERROR_MESSAGE));
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
