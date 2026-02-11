import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProfileProvider, useProfile } from '../../src/hooks/useProfile';
import { fetchProfile } from '../../src/api/profile';

jest.mock('../../src/api/profile', () => ({
  fetchProfile: jest.fn(),
}));

function createDeferred() {
  let resolvePromise;
  let rejectPromise;

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return { promise, resolve: resolvePromise, reject: rejectPromise };
}

function ProfileStateConsumer() {
  const { profile, targets, isLoading, error, refetchProfile } = useProfile();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="error">{error ? error.message : ''}</div>
      <div data-testid="profile">{profile ? JSON.stringify(profile) : ''}</div>
      <div data-testid="targets">{targets ? JSON.stringify(targets) : ''}</div>
      <button type="button" onClick={() => refetchProfile()}>
        Refetch Profile
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ProfileProvider>
      <ProfileStateConsumer />
    </ProfileProvider>
  );
}

describe('useProfile', () => {
  beforeEach(() => {
    fetchProfile.mockReset();
  });

  test('starts with loading true before fetch resolves', async () => {
    // Arrange
    const deferred = createDeferred();
    fetchProfile.mockReturnValueOnce(deferred.promise);
    renderWithProvider();

    // Act
    await waitFor(() => {
      expect(fetchProfile).toHaveBeenCalledTimes(1);
    });

    // Assert
    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('error').textContent).toBe('');

    deferred.resolve({ success: true, profile: null, targets: null });
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  test('populates profile and targets on successful fetch', async () => {
    // Arrange
    const profile = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
    };
    const targets = {
      proteinGrams: 187,
      carbGrams: 374,
      fatGrams: 99,
      calories: 3135,
      tdee: 2726,
    };
    fetchProfile.mockResolvedValueOnce({ success: true, profile, targets });
    renderWithProvider();

    // Act
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Assert
    expect(fetchProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('error').textContent).toBe('');
    expect(screen.getByTestId('profile').textContent).toBe(JSON.stringify(profile));
    expect(screen.getByTestId('targets').textContent).toBe(JSON.stringify(targets));
  });

  test('sets error and clears loading when fetch fails', async () => {
    // Arrange
    fetchProfile.mockRejectedValueOnce(new Error('boom'));
    renderWithProvider();

    // Act
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Assert
    expect(fetchProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('error').textContent).toBe('boom');
    expect(screen.getByTestId('profile').textContent).toBe('');
    expect(screen.getByTestId('targets').textContent).toBe('');
  });

  test('refetchProfile runs fetch again and updates state', async () => {
    // Arrange
    const firstProfile = {
      bodyWeightKg: 70,
      heightCm: 175,
      ageYears: 30,
      gender: 'female',
      activityLevel: 'light',
      goal: 'maintain',
    };
    const secondProfile = {
      bodyWeightKg: 80,
      heightCm: 185,
      ageYears: 35,
      gender: 'male',
      activityLevel: 'active',
      goal: 'bulk',
    };
    const firstTargets = {
      proteinGrams: 140,
      carbGrams: 210,
      fatGrams: 70,
      calories: 2030,
      tdee: 2200,
    };
    const secondTargets = {
      proteinGrams: 208,
      carbGrams: 576,
      fatGrams: 107,
      calories: 4067,
      tdee: 3230,
    };
    fetchProfile
      .mockResolvedValueOnce({ success: true, profile: firstProfile, targets: firstTargets })
      .mockResolvedValueOnce({ success: true, profile: secondProfile, targets: secondTargets });
    renderWithProvider();

    // Act
    await waitFor(() => {
      expect(screen.getByTestId('profile').textContent).toBe(JSON.stringify(firstProfile));
    });
    fireEvent.click(screen.getByRole('button', { name: /refetch profile/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('profile').textContent).toBe(JSON.stringify(secondProfile));
    });
    expect(fetchProfile).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('targets').textContent).toBe(JSON.stringify(secondTargets));
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('error').textContent).toBe('');
  });
});
