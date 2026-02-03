import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { confirmSignUp, signIn, signUp } from 'aws-amplify/auth';
import RegisterForm from '../../../src/components/auth/RegisterForm';

const INVALID_EMAIL_MESSAGE = 'Please enter valid email address.';
const WEAK_PASSWORD_MESSAGE = 'Password must be 8+ chars with uppercase, lowercase, number.';
const EMAIL_EXISTS_MESSAGE = 'Email already registered. Please sign in.';
const CONFIRMATION_ERROR_MESSAGE = 'Unable to confirm account. Please try again.';

function fillRegistrationForm({ email, password }) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
}

describe('RegisterForm', () => {
  beforeEach(() => {
    signUp.mockReset();
    confirmSignUp.mockReset();
    signIn.mockReset();
  });

  test('shows validation error for invalid email', async () => {
    // Arrange
    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'invalid-email', password: 'StrongPass1' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    expect(await screen.findByText(INVALID_EMAIL_MESSAGE)).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  test('shows policy error for weak password', async () => {
    // Arrange
    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'user@example.com', password: 'weakpass' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    expect(await screen.findByText(WEAK_PASSWORD_MESSAGE)).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  test('shows policy error when password is missing uppercase', async () => {
    // Arrange
    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'user@example.com', password: 'lowercase1' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    expect(await screen.findByText(WEAK_PASSWORD_MESSAGE)).toBeInTheDocument();
  });

  test('shows policy error when password is missing lowercase', async () => {
    // Arrange
    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'user@example.com', password: 'UPPERCASE1' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    expect(await screen.findByText(WEAK_PASSWORD_MESSAGE)).toBeInTheDocument();
  });

  test('shows policy error when password is missing number', async () => {
    // Arrange
    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'user@example.com', password: 'NoNumber' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    expect(await screen.findByText(WEAK_PASSWORD_MESSAGE)).toBeInTheDocument();
  });

  test('shows email exists error when registration fails', async () => {
    // Arrange
    const error = new Error('user exists');
    error.code = 'UsernameExistsException';
    signUp.mockRejectedValueOnce(error);

    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'user@example.com', password: 'StrongPass1' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    expect(await screen.findByText(EMAIL_EXISTS_MESSAGE)).toBeInTheDocument();
  });

  test('shows server error message when registration fails without code', async () => {
    // Arrange
    signUp.mockRejectedValueOnce(new Error('Registration failed'));

    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'user@example.com', password: 'StrongPass1' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    expect(await screen.findByText('Registration failed')).toBeInTheDocument();
  });

  test('confirm success triggers sign-in', async () => {
    // Arrange
    signUp.mockResolvedValueOnce({});
    confirmSignUp.mockResolvedValueOnce({});
    signIn.mockResolvedValueOnce({});

    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'user@example.com', password: 'StrongPass1' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    const codeInput = await screen.findByLabelText(/confirmation code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    // Assert
    await waitFor(() => {
      expect(confirmSignUp).toHaveBeenCalledWith({
        username: 'user@example.com',
        confirmationCode: '123456',
      });
      expect(signIn).toHaveBeenCalledWith({
        username: 'user@example.com',
        password: 'StrongPass1',
      });
    });
  });

  test('shows confirmation error when confirmSignUp fails', async () => {
    // Arrange
    signUp.mockResolvedValueOnce({});
    confirmSignUp.mockRejectedValueOnce(new Error('bad code'));

    render(<RegisterForm />);

    // Act
    fillRegistrationForm({ email: 'user@example.com', password: 'StrongPass1' });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    const codeInput = await screen.findByLabelText(/confirmation code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    // Assert
    expect(await screen.findByText(CONFIRMATION_ERROR_MESSAGE)).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });
});
