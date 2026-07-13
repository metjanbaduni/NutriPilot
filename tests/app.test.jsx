import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import App from '../src/components/App';
import { SessionProvider, useSession } from '../src/context/SessionContext';

const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const createUnauthenticatedError = () => {
  const error = new Error('The user is not authenticated');
  error.name = 'NotAuthenticatedException';
  return error;
};

function SessionConsumer() {
  const { user } = useSession();
  return <div data-testid="user-email">{user?.email || 'anon'}</div>;
}

describe('App routing', () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
  });

  test('renders login form on /login', async () => {
    // Arrange
    getCurrentUser.mockRejectedValue(createUnauthenticatedError());

    // Act
    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    // Assert
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders register form on /signup', async () => {
    // Arrange
    getCurrentUser.mockRejectedValue(createUnauthenticatedError());

    // Act
    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );

    // Assert
    expect(await screen.findByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('redirects unauthenticated users from /dashboard to login', async () => {
    // Arrange
    getCurrentUser.mockRejectedValue(createUnauthenticatedError());

    // Act
    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  test('renders dashboard placeholder for authenticated users', async () => {
    // Arrange
    getCurrentUser.mockResolvedValue({ email: 'demo@nutripilot.dev' });

    // Act
    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /profile settings/i })).toHaveAttribute(
      'href',
      '/settings'
    );
  });

  test('redirects authenticated users from /login to dashboard', async () => {
    // Arrange
    getCurrentUser.mockResolvedValue({ email: 'login@nutripilot.dev' });

    // Act
    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
  });

  test('renders profile form for authenticated users on /settings', async () => {
    // Arrange
    getCurrentUser.mockResolvedValue({ email: 'settings@nutripilot.dev' });

    // Act
    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={['/settings']}>
        <App />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Current Profile/i)).toBeInTheDocument();
    });
  });
});

describe('SessionProvider', () => {
  beforeEach(() => {
    getCurrentUser.mockRejectedValue(createUnauthenticatedError());
  });

  test('provides default anonymous user', async () => {
    render(
      <SessionProvider>
        <SessionConsumer />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('anon');
    });
  });
});
