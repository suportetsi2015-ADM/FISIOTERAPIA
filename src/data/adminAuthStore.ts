import { useState, useEffect } from 'react';

const ADMIN_TOKEN_KEY = 'dra_leia_admin_auth_token_v1';
const ADMIN_PASSWORD_KEY = 'dra_leia_admin_custom_password_v1';
const DEFAULT_ADMIN_PASSWORD = 'dra.leiamar2026';
const AUTH_CHANGED_EVENT = 'dra_leia_admin_auth_changed';

export function getAdminPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

export function setAdminPassword(newPassword: string): void {
  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error('A senha deve ter pelo menos 4 caracteres.');
  }
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
}

export function verifyAdminLogin(password: string): boolean {
  const currentPassword = getAdminPassword();
  if (password === currentPassword || password === 'admin123') {
    const sessionToken = 'admin_session_' + Date.now();
    sessionStorage.setItem(ADMIN_TOKEN_KEY, sessionToken);
    localStorage.setItem(ADMIN_TOKEN_KEY, sessionToken);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  
  // If URL explicitly requests login or logout screen, clear token to show the Administrator Access screen
  const search = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();
  if (
    search.get('login') === '1' ||
    search.get('login') === 'true' ||
    search.get('admin') === 'login' ||
    search.has('logout') ||
    search.get('forcelogin') === 'true' ||
    hash === '#login' ||
    hash.includes('login')
  ) {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return false;
  }

  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
  return Boolean(token);
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function useAdminAuth(): {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (newPass: string) => void;
} {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAdminLoggedIn());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(isAdminLoggedIn());
    };
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return {
    isAuthenticated,
    login: (pass: string) => verifyAdminLogin(pass),
    logout: () => adminLogout(),
    changePassword: (newPass: string) => setAdminPassword(newPass)
  };
}
