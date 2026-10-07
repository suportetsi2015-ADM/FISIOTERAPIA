import { useState, useEffect } from 'react';

const USER_TOKEN_KEY = 'dra_leia_user_auth_token_v1';
const USER_PASSWORD_KEY = 'dra_leia_user_custom_password_v1';
const DEFAULT_USER_PASSWORD = 'pilates2509@27';
const USER_AUTH_CHANGED_EVENT = 'dra_leia_user_auth_changed';

export function getUserPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_USER_PASSWORD;
  return localStorage.getItem(USER_PASSWORD_KEY) || DEFAULT_USER_PASSWORD;
}

export function setUserPassword(newPassword: string): void {
  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error('A senha deve ter pelo menos 4 caracteres.');
  }
  localStorage.setItem(USER_PASSWORD_KEY, newPassword.trim());
}

export function verifyUserLogin(password: string): boolean {
  const currentPassword = getUserPassword();
  if (password.trim() === currentPassword || password.trim() === DEFAULT_USER_PASSWORD) {
    const sessionToken = 'user_session_' + Date.now();
    sessionStorage.setItem(USER_TOKEN_KEY, sessionToken);
    localStorage.setItem(USER_TOKEN_KEY, sessionToken);
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
    sessionStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_TOKEN_KEY);
    return false;
  }

  const token = sessionStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem(USER_TOKEN_KEY);
  return Boolean(token);
}

export function userLogout(): void {
  sessionStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_TOKEN_KEY);
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
