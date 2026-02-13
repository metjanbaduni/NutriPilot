import React from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import AuthGate from './auth/AuthGate';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import ProfileForm from './profile/ProfileForm';
import { SessionProvider, useSession } from '../context/SessionContext';

const ROUTES = {
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  settings: '/settings',
};

const PLACEHOLDER_LABELS = {
  dashboard: 'Dashboard',
};

const MODAL_HOST_ID = 'modal-host';

function DashboardPlaceholder() {
  return (
    <div className="space-y-3">
      <div>{PLACEHOLDER_LABELS.dashboard}</div>
      <Link className="auth-link" to={ROUTES.settings}>
        Profile Settings
      </Link>
    </div>
  );
}

function SettingsPlaceholder() {
  return <ProfileForm />;
}

function AuthRedirect({ children }) {
  const { isLoading, isAuthenticated } = useSession();

  if (isLoading) {
    return <div role="status">Loading session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
}

function AuthenticatedShell({ children, signOut }) {
  return (
    <div>
      <button type="button" onClick={signOut}>
        Sign Out
      </button>
      {children}
    </div>
  );
}

/**
 * App route skeleton with placeholder views and modal host.
 * @returns {JSX.Element} App routes and modal host container.
 */
export default function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route
          path={ROUTES.login}
          element={
            <AuthRedirect>
              <LoginForm />
            </AuthRedirect>
          }
        />
        <Route
          path={ROUTES.signup}
          element={
            <AuthRedirect>
              <RegisterForm />
            </AuthRedirect>
          }
        />
        <Route
          path={ROUTES.dashboard}
          element={
            <AuthGate>
              {({ signOut }) => (
                <AuthenticatedShell signOut={signOut}>
                  <DashboardPlaceholder />
                </AuthenticatedShell>
              )}
            </AuthGate>
          }
        />
        <Route
          path={ROUTES.settings}
          element={
            <AuthGate>
              {({ signOut }) => (
                <AuthenticatedShell signOut={signOut}>
                  <SettingsPlaceholder />
                </AuthenticatedShell>
              )}
            </AuthGate>
          }
        />
      </Routes>
      <div id={MODAL_HOST_ID} />
    </SessionProvider>
  );
}
