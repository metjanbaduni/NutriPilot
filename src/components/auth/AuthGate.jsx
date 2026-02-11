import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { signOut as amplifySignOut } from 'aws-amplify/auth';
import { useSession } from '../../context/SessionContext';

const LOGIN_ROUTE = '/login';
const LOADING_MESSAGE = 'Loading session...';

const AuthGateContext = createContext(null);

function renderChildren(children, contextValue) {
  if (typeof children === 'function') {
    return children(contextValue);
  }
  return children || null;
}

/**
 * Reads AuthGate actions such as sign-out.
 * @returns {{ signOut: () => Promise<void> }}
 */
export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    throw new Error('useAuthGate must be used within AuthGate');
  }
  return ctx;
}

/**
 * Guards authenticated content and exposes auth actions to descendants.
 * @param {{ children: React.ReactNode | ((actions: { signOut: () => Promise<void> }) => React.ReactNode) }} props
 * @returns {JSX.Element | null}
 */
export default function AuthGate({ children }) {
  const { isLoading, isAuthenticated } = useSession();
  const signOut = useCallback(async () => {
    await amplifySignOut();
  }, []);
  const contextValue = useMemo(() => ({ signOut }), [signOut]);

  if (isLoading) {
    return <div role="status">{LOADING_MESSAGE}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_ROUTE} replace />;
  }

  return (
    <AuthGateContext.Provider value={contextValue}>
      {renderChildren(children, contextValue)}
    </AuthGateContext.Provider>
  );
}
