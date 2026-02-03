import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { signOut } from 'aws-amplify/auth';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthGate, { useAuthGate } from '../../../src/components/auth/AuthGate';
import { useSession } from '../../../src/context/SessionContext';

jest.mock('../../../src/context/SessionContext', () => ({
  useSession: jest.fn(),
}));

const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function renderWithRouter(ui, initialEntries = ['/protected']) {
  return render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

function SignOutConsumer() {
  const { signOut } = useAuthGate();
  return (
    <button type="button" onClick={() => signOut()}>
      Sign Out
    </button>
  );
}

function RenderPropConsumer() {
  return (
    <AuthGate>
      {({ signOut }) => (
        <button type="button" onClick={() => signOut()}>
          Render Prop Sign Out
        </button>
      )}
    </AuthGate>
  );
}

function UnsafeAuthGateConsumer() {
  useAuthGate();
  return <div>unsafe</div>;
}

describe('AuthGate', () => {
  beforeEach(() => {
    useSession.mockReset();
    signOut.mockReset();
  });

  test('renders loading state while session resolves', () => {
    // Arrange
    useSession.mockReturnValue({ isLoading: true, isAuthenticated: false });

    // Act
    renderWithRouter(
      <AuthGate>
        <div>Secret</div>
      </AuthGate>
    );

    // Assert
    expect(screen.getByText('Loading session...')).toBeInTheDocument();
  });

  test('redirects unauthenticated users to /login', () => {
    // Arrange
    useSession.mockReturnValue({ isLoading: false, isAuthenticated: false });

    // Act
    renderWithRouter(
      <AuthGate>
        <div>Secret</div>
      </AuthGate>
    );

    // Assert
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  test('renders children when authenticated', () => {
    // Arrange
    useSession.mockReturnValue({ isLoading: false, isAuthenticated: true });

    // Act
    renderWithRouter(
      <AuthGate>
        <div>Secret</div>
      </AuthGate>
    );

    // Assert
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  test('calls Auth.signOut when signOut action is invoked', async () => {
    // Arrange
    useSession.mockReturnValue({ isLoading: false, isAuthenticated: true });

    // Act
    renderWithRouter(
      <AuthGate>
        <SignOutConsumer />
      </AuthGate>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    // Assert
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });
  });

  test('supports render-prop children and calls signOut', async () => {
    // Arrange
    useSession.mockReturnValue({ isLoading: false, isAuthenticated: true });

    // Act
    renderWithRouter(<RenderPropConsumer />);

    fireEvent.click(screen.getByRole('button', { name: /render prop sign out/i }));

    // Assert
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });
  });

  test('throws when useAuthGate is used outside provider', () => {
    // Arrange
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const renderOutsideProvider = () => render(<UnsafeAuthGateConsumer />);

    // Assert
    expect(renderOutsideProvider).toThrow('useAuthGate must be used within AuthGate');

    consoleErrorSpy.mockRestore();
  });
});
