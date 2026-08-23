/**
 * Centralized ZeroTrace Authentication & Session Management.
 * Uses localStorage as the primary persistence layer with sessionStorage synchronization.
 */

const AUTH_KEY = "zerotrace_auth";
const RETURN_KEY = "zerotrace_return";

/**
 * Retrieve current authenticated user object or null.
 * Checks localStorage first, then falls back to sessionStorage and synchronizes.
 */
export function getStoredAuth() {
  try {
    const rawLocal = localStorage.getItem(AUTH_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && typeof parsed === "object" && parsed.authenticated) {
        return parsed;
      }
    }

    const rawSession = sessionStorage.getItem(AUTH_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed && typeof parsed === "object" && parsed.authenticated) {
        // Sync to localStorage
        try {
          localStorage.setItem(AUTH_KEY, JSON.stringify(parsed));
        } catch {}
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse stored auth", err);
  }
  return null;
}

/**
 * Check whether the user is currently authenticated.
 */
export function isAuthenticated() {
  return Boolean(getStoredAuth()?.authenticated);
}

/**
 * Persist user authentication state to both localStorage and sessionStorage,
 * then notify all open listeners across tabs/components.
 */
export function setStoredAuth(userData) {
  try {
    const payload = JSON.stringify(userData);
    localStorage.setItem(AUTH_KEY, payload);
    sessionStorage.setItem(AUTH_KEY, payload);
  } catch (err) {
    console.error("Failed to save auth state", err);
  }
  window.dispatchEvent(new Event("zerotrace-auth-changed"));
}

/**
 * Clear authentication state from all storage keys and notify listeners.
 */
export function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(RETURN_KEY);
  } catch (err) {
    console.error("Failed to clear auth state", err);
  }
  window.dispatchEvent(new Event("zerotrace-auth-changed"));
}

/**
 * Save destination route for post-authentication redirect.
 */
export function setReturnUrl(url) {
  try {
    sessionStorage.setItem(RETURN_KEY, url);
  } catch {}
}

/**
 * Retrieve and clear the saved return URL, falling back to a default route.
 */
export function getAndClearReturnUrl(fallback = "/dashboard") {
  try {
    const url = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    return url || fallback;
  } catch {
    return fallback;
  }
}
