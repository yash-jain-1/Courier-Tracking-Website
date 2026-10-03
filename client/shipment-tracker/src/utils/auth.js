const TOKEN_KEY = 'token';
const AUTH_CHANGE_EVENT = 'auth-change';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const notifyAuthChange = () => window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  notifyAuthChange();
};

// Reads the JWT `exp` claim without verifying the signature (the server does that)
const getTokenExpiry = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  const expiry = getTokenExpiry(token);
  return expiry !== null && expiry > Date.now();
};

// Subscribe to login/logout in this tab and in other tabs; returns an unsubscribe function
export const onAuthChange = (callback) => {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};
