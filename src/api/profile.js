import { get, post } from './client';

const PROFILE_PATH = '/profile';
const API_CLIENT_ERROR_NAME = 'ApiClientError';

function normalizeProfileResponse(response) {
  return {
    success: response?.success ?? true,
    profile: response?.profile ?? null,
    targets: response?.targets ?? null,
  };
}

function normalizeProfileApiError(error, fallbackMessage) {
  if (error?.name === API_CLIENT_ERROR_NAME) {
    return error;
  }

  return new Error(fallbackMessage);
}

/**
 * Fetches the authenticated user's profile and targets from the API.
 * @returns {Promise<{success: boolean, profile: object|null, targets: object|null}>}
 * @throws {Error} When the profile request fails.
 */
export async function fetchProfile() {
  try {
    const response = await get(PROFILE_PATH);
    return normalizeProfileResponse(response);
  } catch (error) {
    throw normalizeProfileApiError(error, 'Unable to load profile');
  }
}

/**
 * Saves profile fields and returns updated profile/target values.
 * @param {object} profilePayload - User profile fields for macro recalculation.
 * @returns {Promise<{success: boolean, profile: object|null, targets: object|null}>}
 * @throws {Error} When the save request fails.
 */
export async function saveProfile(profilePayload) {
  try {
    const response = await post(PROFILE_PATH, { body: profilePayload });
    return normalizeProfileResponse(response);
  } catch (error) {
    throw normalizeProfileApiError(error, 'Unable to save profile');
  }
}
