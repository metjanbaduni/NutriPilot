import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Auth, Hub } from 'aws-amplify';
import { SessionProvider, useSession } from '../../../src/context/SessionContext';

const createUnauthenticatedError = () => {
  const error = new Error('The user is not authenticated');
  error.name = 'NotAuthenticatedException';
  return error;
};

function SessionStateReader() {
  const { isLoading, isAuthenticated, user } = useSession();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="auth">{isAuthenticated ? 'auth' : 'anon'}</div>
      <div data-testid="email">{user?.email || 'none'}</div>
    </div>
  );
}

class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div data-testid="session-error">{this.state.error.message}</div>;
    }

    return this.props.children;
  }
}

function UnsafeSessionReader() {
  useSession();
  return <div>unsafe</div>;
}

describe('SessionContext', () => {
  beforeEach(() => {
    Auth.currentAuthenticatedUser.mockReset();
    Auth.currentSession.mockReset();
    Hub.listen.mockClear();
    Hub.remove.mockClear();
  });

  test('initializes unauthenticated state when no session exists', async () => {
    // Arrange
    Auth.currentAuthenticatedUser.mockRejectedValueOnce(createUnauthenticatedError());

    // Act
    render(
      <SessionProvider>
        <SessionStateReader />
      </SessionProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('ready');
      expect(screen.getByTestId('auth').textContent).toBe('anon');
      expect(screen.getByTestId('email').textContent).toBe('none');
    });
  });

  test('moves to authenticated state after sign-in Hub event', async () => {
    // Arrange
    const user = { email: 'session@example.com' };
    Auth.currentAuthenticatedUser
      .mockRejectedValueOnce(createUnauthenticatedError())
      .mockResolvedValueOnce(user);

    // Act
    render(
      <SessionProvider>
        <SessionStateReader />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('anon');
    });

    await waitFor(() => {
      expect(Hub.listen).toHaveBeenCalledWith('auth', expect.any(Function));
    });

    const authListener = Hub.listen.mock.calls[0][1];

    act(() => {
      authListener({ payload: { event: 'signIn' } });
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('auth');
      expect(screen.getByTestId('email').textContent).toBe(user.email);
    });
    expect(Auth.currentAuthenticatedUser).toHaveBeenCalledTimes(2);
  });

  test('moves to unauthenticated state after sign-out Hub event', async () => {
    // Arrange
    const user = { email: 'signedin@example.com' };
    Auth.currentAuthenticatedUser
      .mockResolvedValueOnce(user)
      .mockRejectedValueOnce(createUnauthenticatedError());

    // Act
    render(
      <SessionProvider>
        <SessionStateReader />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('auth');
    });

    await waitFor(() => {
      expect(Hub.listen).toHaveBeenCalledWith('auth', expect.any(Function));
    });

    const authListener = Hub.listen.mock.calls[0][1];

    act(() => {
      authListener({ payload: { event: 'signOut' } });
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('anon');
      expect(screen.getByTestId('email').textContent).toBe('none');
    });
  });

  test('refreshes session after token refresh Hub event', async () => {
    // Arrange
    const user = { email: 'refresh@example.com' };
    Auth.currentAuthenticatedUser
      .mockRejectedValueOnce(createUnauthenticatedError())
      .mockResolvedValueOnce(user);

    // Act
    render(
      <SessionProvider>
        <SessionStateReader />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('anon');
    });

    await waitFor(() => {
      expect(Hub.listen).toHaveBeenCalledWith('auth', expect.any(Function));
    });

    const authListener = Hub.listen.mock.calls[0][1];

    act(() => {
      authListener({ payload: { event: 'tokenRefresh' } });
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('auth');
      expect(screen.getByTestId('email').textContent).toBe(user.email);
    });
  });

  test('throws when useSession is used outside provider', () => {
    // Arrange
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const renderOutsideProvider = () => render(<UnsafeSessionReader />);

    // Assert
    expect(renderOutsideProvider).toThrow('useSession must be used within SessionProvider');

    consoleErrorSpy.mockRestore();
  });

  test('surfaces fatal errors when currentSession rejects', async () => {
    // Arrange
    const sessionError = new Error('Session refresh failed');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    Auth.currentSession.mockRejectedValueOnce(sessionError);
    Auth.currentAuthenticatedUser.mockImplementation(() => Auth.currentSession());

    // Act
    render(
      <TestErrorBoundary>
        <SessionProvider>
          <SessionStateReader />
        </SessionProvider>
      </TestErrorBoundary>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('session-error').textContent).toBe(sessionError.message);
    });

    consoleErrorSpy.mockRestore();
  });

  test('surfaces fatal errors when currentAuthenticatedUser throws unexpected error', async () => {
    // Arrange
    const networkError = new Error('Network failure');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    Auth.currentAuthenticatedUser.mockRejectedValueOnce(networkError);

    // Act
    render(
      <TestErrorBoundary>
        <SessionProvider>
          <SessionStateReader />
        </SessionProvider>
      </TestErrorBoundary>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('session-error').textContent).toBe(networkError.message);
    });

    consoleErrorSpy.mockRestore();
  });
});
