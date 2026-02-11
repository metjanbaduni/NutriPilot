import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

const SessionContext = createContext(null);

const AUTH_CHANNEL = 'auth';
const AUTH_EVENTS = {
  SIGN_IN: 'signIn',
  SIGN_OUT: 'signOut',
  TOKEN_REFRESH: 'tokenRefresh',
};
const SESSION_EVENTS = new Set([
  AUTH_EVENTS.SIGN_IN,
  AUTH_EVENTS.SIGN_OUT,
  AUTH_EVENTS.TOKEN_REFRESH,
]);

const UNAUTHENTICATED_ERROR_NAMES = new Set([
  'NotAuthorizedException',
  'UserNotFoundException',
  'NotAuthenticatedException',
  'UserUnauthenticatedException',
  'UserUnAuthenticatedException',
]);
const NOT_AUTHENTICATED_MESSAGE = 'The user is not authenticated';
const NO_CURRENT_USER_MESSAGE = 'No current user';
const NOT_AUTHENTICATED_SUBSTRING = 'not authenticated';
const NEEDS_AUTHENTICATED_SUBSTRING = 'needs to be authenticated';

const INITIAL_SESSION_STATE = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
};

// Amplify reports unauthenticated states inconsistently across APIs, so check multiple signals.
function isUnauthenticatedError(error) {
  if (!error) {
    return false;
  }

  const identifier = error.name || error.code;
  if (identifier && UNAUTHENTICATED_ERROR_NAMES.has(identifier)) {
    return true;
  }

  const message = String(error.message || '');
  if (message === NOT_AUTHENTICATED_MESSAGE || message === NO_CURRENT_USER_MESSAGE) {
    return true;
  }

  const normalized = message.toLowerCase();
  if (normalized.includes(NOT_AUTHENTICATED_SUBSTRING)) {
    return true;
  }
  return normalized.includes(NEEDS_AUTHENTICATED_SUBSTRING);
}

async function fetchSessionUser() {
  try {
    const user = await getCurrentUser();
    return { isAuthenticated: true, user };
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      return { isAuthenticated: false, user: null };
    }
    throw error;
  }
}

async function refreshSession(setSession, setFatalError) {
  setSession((prev) => ({ ...prev, isLoading: true }));
  try {
    const { isAuthenticated, user } = await fetchSessionUser();
    setSession({ isLoading: false, isAuthenticated, user });
  } catch (error) {
    setFatalError(error);
  }
}

function isSessionEvent(event) {
  return SESSION_EVENTS.has(event);
}

/**
 * Provides session state sourced from Amplify Auth events.
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function SessionProvider({ children }) {
  const [session, setSession] = useState(INITIAL_SESSION_STATE);
  const [fatalError, setFatalError] = useState(null);

  if (fatalError) {
    // Fail fast in Phase 2; error boundaries are introduced in later tasks.
    throw fatalError;
  }

  useEffect(() => {
    let isMounted = true;
    const setSessionSafe = (nextState) => {
      if (isMounted) {
        setSession(nextState);
      }
    };
    const setFatalErrorSafe = (error) => {
      if (isMounted) {
        setFatalError(error);
      }
    };
    const handleAuthEvent = ({ payload }) => {
      const event = payload?.event;
      if (!isSessionEvent(event)) {
        return;
      }
      refreshSession(setSessionSafe, setFatalErrorSafe);
    };

    refreshSession(setSessionSafe, setFatalErrorSafe);
    const removeListener = Hub.listen(AUTH_CHANNEL, handleAuthEvent);

    return () => {
      isMounted = false;
      if (typeof removeListener === 'function') {
        removeListener();
      }
    };
  }, []);

  const value = useMemo(() => session, [session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * Reads the current session state from context.
 * @returns {{ isLoading: boolean, isAuthenticated: boolean, user: any }}
 */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
