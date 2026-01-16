import { API } from 'aws-amplify';

/**
 * Wrapper around Amplify API module to enforce consistent error handling.
 * @param {string} path - API path
 * @param {object} init - Amplify request init
 */
export async function get(path, init) {
  try {
    return await API.get('nutripilotapi', path, init);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function post(path, init) {
  try {
    return await API.post('nutripilotapi', path, init);
  } catch (error) {
    throw normalizeError(error);
  }
}

function normalizeError(error) {
  const message = error?.message || 'Request failed';
  return new Error(message);
}
