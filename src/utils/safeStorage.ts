/**
 * Camada de armazenamento resiliente a navegadores com proteção estrita (Brave Shields, Safari ITP,
 * iframes do Google AI Studio e navegação anônima).
 * Se o acesso ao localStorage for bloqueado pelo navegador, usa fallback transparente em memória
 * sem lançar SecurityError ou quebrar a renderização da aplicação.
 */

const memoryFallback = new Map<string, string>();

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (_) {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return memoryFallback.get(key) || null;
    try {
      if (storageAvailable) {
        return window.localStorage.getItem(key);
      }
    } catch (_) {}
    return memoryFallback.get(key) || null;
  },

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') {
      memoryFallback.set(key, value);
      return;
    }
    try {
      if (storageAvailable) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (_) {}
    memoryFallback.set(key, value);
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') {
      memoryFallback.delete(key);
      return;
    }
    try {
      if (storageAvailable) {
        window.localStorage.removeItem(key);
      }
    } catch (_) {}
    memoryFallback.delete(key);
  },

  clear(): void {
    if (typeof window === 'undefined') {
      memoryFallback.clear();
      return;
    }
    try {
      if (storageAvailable) {
        window.localStorage.clear();
      }
    } catch (_) {}
    memoryFallback.clear();
  }
};
