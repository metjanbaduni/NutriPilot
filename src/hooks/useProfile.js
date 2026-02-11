import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { fetchProfile } from '../api/profile';

const PROFILE_FETCH_ERROR_MESSAGE = 'Unable to load profile';
const MISSING_PROVIDER_MESSAGE = 'useProfile must be used within ProfileProvider';

const ProfileContext = createContext(null);

function normalizeProfileError(error) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(PROFILE_FETCH_ERROR_MESSAGE);
}

function normalizeProfileResponse(response) {
  return {
    profile: response?.profile ?? null,
    targets: response?.targets ?? null,
  };
}

/**
 * Provides profile state and refetch actions to child components.
 * @param {{children: React.ReactNode}} props - Provider props.
 * @returns {JSX.Element} Context provider wrapping children.
 */
export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [targets, setTargets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(false);

  const refetchProfile = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchProfile();
      if (!isMountedRef.current) return;
      const normalized = normalizeProfileResponse(response);
      setProfile(normalized.profile);
      setTargets(normalized.targets);
    } catch (requestError) {
      if (!isMountedRef.current) return;
      setError(normalizeProfileError(requestError));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    refetchProfile();
    return () => {
      isMountedRef.current = false;
    };
  }, [refetchProfile]);

  const value = useMemo(
    () => ({ profile, targets, isLoading, error, refetchProfile }),
    [profile, targets, isLoading, error, refetchProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

/**
 * Reads profile data and actions from ProfileProvider.
 * @returns {{profile: object|null, targets: object|null, isLoading: boolean, error: Error|null,
 *   refetchProfile: Function}}
 * Context values for profile hydration and refresh.
 * @throws {Error} If used outside ProfileProvider.
 */
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  }
  return context;
}
