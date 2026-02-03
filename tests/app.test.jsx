import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Auth } from 'aws-amplify';
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
  test('renders dashboard placeholder', () => {
    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});

describe('SessionProvider', () => {
  beforeEach(() => {
    Auth.currentAuthenticatedUser.mockRejectedValue(createUnauthenticatedError());
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
