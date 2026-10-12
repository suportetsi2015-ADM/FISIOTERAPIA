import { useState, useEffect } from 'react';
import { safeStorage } from '../utils/safeStorage';

const USER_TOKEN_KEY = 'dra_leia_user_auth_token_v1';
const USER_PASSWORD_KEY = 'dra_leia_user_custom_password_v1';
const DEFAULT_USER_PASSWORD = 'pilates2509@27';
const USER_AUTH_CHANGED_EVENT = 'dra_leia_user_auth_changed';

export function getUserPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_USER_PASSWORD;
  return safeStorage.getItem(USER_PASSWORD_KEY) || DEFAULT_USER_PASSWORD;
}

export function setUserPassword(newPassword: string): void {
  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error('A senha deve ter pelo menos 4 caracteres.');
  }
  const cleanPass = newPassword.trim();
  safeStorage.setItem(USER_PASSWORD_KEY, cleanPass);
  window.dispatchEvent(new Event(USER_AUTH_CHANGED_EVENT));

  if (typeof window !== 'undefined') {
    fetch('/api/auth-passwords')
      .then((r) => r.json())
      .then((res) => {
        const existing = res?.data || {};
        fetch('/api/auth-passwords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...existing, userPassword: cleanPass })
        }).catch(() => {});
      })
      .catch(() => {
        fetch('/api/auth-passwords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userPassword: cleanPass })
        }).catch(() => {});
      });
  }
}

// Sincronização inicial com o servidor
if (typeof window !== 'undefined') {
  fetch('/api/auth-passwords')
    .then((r) => r.json())
    .then((res) => {
      if (res?.success && res.data?.userPassword) {
        safeStorage.setItem(USER_PASSWORD_KEY, res.data.userPassword);
        window.dispatchEvent(new Event(USER_AUTH_CHANGED_EVENT));
      }
    })
    .catch(() => {});
}

export function verifyUserLogin(password: string): boolean {
  const currentPassword = getUserPassword();
  if (password.trim() === currentPassword || password.trim() === DEFAULT_USER_PASSWORD) {
    const sessionToken = 'user_session_' + Date.now();
    try {
      sessionStorage.setItem(USER_TOKEN_KEY, sessionToken);
    } catch (_) {}
    safeStorage.setItem(USER_TOKEN_KEY, sessionToken);
    window.dispatchEvent(new Event(USER_AUTH_CHANGED_EVENT));
    return true;
  }
  return false;
}

export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;

  const search = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();
  if (
    search.get('userlogin') === '1' ||
    search.get('logout') === 'user' ||
    hash === '#userlogin' ||
    hash.includes('userlogin')
  ) {
    try {
      sessionStorage.removeItem(USER_TOKEN_KEY);
    } catch (_) {}
    safeStorage.removeItem(USER_TOKEN_KEY);
    return false;
  }

  let sessionTok: string | null = null;
  try {
    sessionTok = sessionStorage.getItem(USER_TOKEN_KEY);
  } catch (_) {}
  const token = sessionTok || safeStorage.getItem(USER_TOKEN_KEY);
  return Boolean(token);
}

export function userLogout(): void {
  try {
    sessionStorage.removeItem(USER_TOKEN_KEY);
  } catch (_) {}
  safeStorage.removeItem(USER_TOKEN_KEY);
  window.dispatchEvent(new Event(USER_AUTH_CHANGED_EVENT));
}

export function useUserAuth(): {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
} {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isUserLoggedIn());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(isUserLoggedIn());
    };
    window.addEventListener(USER_AUTH_CHANGED_EVENT, handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener(USER_AUTH_CHANGED_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return {
    isAuthenticated,
    login: (pass: string) => verifyUserLogin(pass),
    logout: () => userLogout()
  };
}
