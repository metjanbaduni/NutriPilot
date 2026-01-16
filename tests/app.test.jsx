const React = require('react');
const { render, screen } = require('@testing-library/react');
const { MemoryRouter } = require('react-router-dom');
const App = require('../src/components/App').default;
const { SessionProvider, useSession } = require('../src/context/SessionContext');

function SessionConsumer() {
  const { user } = useSession();
  return <div data-testid="user-email">{user?.email || 'anon'}</div>;
}

describe('App routing', () => {
  test('renders dashboard headline', () => {
    render(
      <SessionProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </SessionProvider>
    );

    expect(screen.getByText(/NutriPilot Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Start logging meals/i)).toBeInTheDocument();
  });
});

describe('SessionProvider', () => {
  test('provides default anonymous user', () => {
    render(
      <SessionProvider>
        <SessionConsumer />
      </SessionProvider>
    );

    expect(screen.getByTestId('user-email').textContent).toBe('anon');
  });
});
