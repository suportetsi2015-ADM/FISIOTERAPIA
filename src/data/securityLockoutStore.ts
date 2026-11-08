import { useState, useEffect } from 'react';
import { safeStorage } from '../utils/safeStorage';

export interface SecurityAlert {
  id: string;
  portal: 'admin' | 'usuario';
  attempts: number;
  timestamp: number;
  dateFormatted: string;
  userAgent: string;
  status: 'bloqueado' | 'desbloqueado_pelo_admin';
  message: string;
}

export interface PortalLockoutState {
  attempts: number;
  isBlocked: boolean;
  lockoutUntil: number;
  lastFailedAt: number;
}

const USER_LOCKOUT_KEY = 'dra_leia_user_lockout_state_v1';
const ADMIN_LOCKOUT_KEY = 'dra_leia_admin_lockout_state_v1';
const SECURITY_ALERTS_KEY = 'dra_leia_security_alerts_list_v1';
const SECURITY_EVENT = 'dra_leia_security_lockout_event';

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos de bloqueio

function getInitialLockoutState(key: string): PortalLockoutState {
  try {
    const raw = safeStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Se já passou o tempo de bloqueio, reseta
      if (parsed.isBlocked && parsed.lockoutUntil && Date.now() > parsed.lockoutUntil) {
        return { attempts: 0, isBlocked: false, lockoutUntil: 0, lastFailedAt: 0 };
      }
      return parsed;
    }
  } catch (_) {}
  return { attempts: 0, isBlocked: false, lockoutUntil: 0, lastFailedAt: 0 };
}

export function getPortalLockout(portal: 'admin' | 'usuario'): PortalLockoutState {
  const key = portal === 'admin' ? ADMIN_LOCKOUT_KEY : USER_LOCKOUT_KEY;
  const state = getInitialLockoutState(key);
  if (state.isBlocked && state.lockoutUntil && Date.now() > state.lockoutUntil) {
    const reset = { attempts: 0, isBlocked: false, lockoutUntil: 0, lastFailedAt: 0 };
    safeStorage.setItem(key, JSON.stringify(reset));
    return reset;
  }
  return state;
}

export function getSecurityAlerts(): SecurityAlert[] {
  try {
    const raw = safeStorage.getItem(SECURITY_ALERTS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (_) {}
  return [];
}

export function saveSecurityAlerts(alerts: SecurityAlert[]): void {
  safeStorage.setItem(SECURITY_ALERTS_KEY, JSON.stringify(alerts));
  // Sincroniza com servidor backend persistente
  if (typeof window !== 'undefined') {
    fetch('/api/security-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: alerts })
    }).catch(() => {});
  }
}

// Sincroniza alertas do servidor na inicialização
if (typeof window !== 'undefined') {
  fetch('/api/security-alerts')
    .then(r => r.json())
    .then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        safeStorage.setItem(SECURITY_ALERTS_KEY, JSON.stringify(res.data));
        window.dispatchEvent(new Event(SECURITY_EVENT));
      }
    })
    .catch(() => {});
}

export interface AttemptResult {
  allowed: boolean;
  attempts: number;
  remainingAttempts: number;
  isBlocked: boolean;
  lockoutUntil?: number;
  errorMessage: string;
}

/**
 * Registra uma tentativa incorreta de senha no Portal selecionado
 */
export function recordFailedAttempt(portal: 'admin' | 'usuario'): AttemptResult {
  const key = portal === 'admin' ? ADMIN_LOCKOUT_KEY : USER_LOCKOUT_KEY;
  const current = getPortalLockout(portal);

  // Se já está bloqueado, não permite
  if (current.isBlocked && current.lockoutUntil && Date.now() < current.lockoutUntil) {
    return {
      allowed: false,
      attempts: current.attempts,
      remainingAttempts: 0,
      isBlocked: true,
      lockoutUntil: current.lockoutUntil,
      errorMessage: `PLATAFORMA BLOQUEADA! Limite de tentativas excedido. O Administrador foi notificado.`
    };
  }

  const newAttempts = current.attempts + 1;
  const isNowBlocked = newAttempts >= 3;
  const lockoutUntil = isNowBlocked ? Date.now() + LOCKOUT_DURATION_MS : 0;

  const newState: PortalLockoutState = {
    attempts: newAttempts,
    isBlocked: isNowBlocked,
    lockoutUntil,
    lastFailedAt: Date.now()
  };

  safeStorage.setItem(key, JSON.stringify(newState));

  // Se bloqueou na 3ª tentativa, gera alerta formal para o ADMINISTRADOR
  if (isNowBlocked) {
    const portalName = portal === 'admin' ? 'Portal do Administrador' : 'Portal do Usuário';
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR');
    
    const newAlert: SecurityAlert = {
      id: 'alert_' + Date.now(),
      portal,
      attempts: newAttempts,
      timestamp: Date.now(),
      dateFormatted,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconhecido',
      status: 'bloqueado',
      message: `Bloqueio de segurança ativado por 3 tentativas consecutivas de senha incorreta no ${portalName}.`
    };

    const existingAlerts = getSecurityAlerts();
    const updatedAlerts = [newAlert, ...existingAlerts];
    saveSecurityAlerts(updatedAlerts);

    // Notifica em tempo real a aplicação
    window.dispatchEvent(new CustomEvent('dra_leia_security_lockout_triggered', { detail: newAlert }));
  }

  window.dispatchEvent(new Event(SECURITY_EVENT));

  const remaining = Math.max(0, 3 - newAttempts);
  let errorMessage = '';
  if (isNowBlocked) {
    errorMessage = `ACESSO BLOQUEADO! Você errou a senha 3 vezes. A plataforma foi bloqueada por segurança e o Administrador foi notificado.`;
  } else if (remaining === 1) {
    errorMessage = `Senha incorreta! ATENÇÃO: Esta é sua última tentativa (resta 1) antes do bloqueio da plataforma!`;
  } else {
    errorMessage = `Senha incorreta. Tentativa ${newAttempts} de 3. Restam ${remaining} tentativa(s) antes do bloqueio de segurança.`;
  }

  return {
    allowed: !isNowBlocked,
    attempts: newAttempts,
    remainingAttempts: remaining,
    isBlocked: isNowBlocked,
    lockoutUntil,
    errorMessage
  };
}

/**
 * Reseta as tentativas após login bem-sucedido com senha correta
 */
export function recordSuccessfulLogin(portal: 'admin' | 'usuario'): void {
  const key = portal === 'admin' ? ADMIN_LOCKOUT_KEY : USER_LOCKOUT_KEY;
  const reset: PortalLockoutState = {
    attempts: 0,
    isBlocked: false,
    lockoutUntil: 0,
    lastFailedAt: 0
  };
  safeStorage.setItem(key, JSON.stringify(reset));
  window.dispatchEvent(new Event(SECURITY_EVENT));
}

/**
 * Desbloqueia o portal pelo Administrador com liberação total imediata
 */
export function adminUnlockPortal(portal?: 'admin' | 'usuario' | 'all'): void {
  if (!portal || portal === 'all' || portal === 'usuario') {
    safeStorage.setItem(USER_LOCKOUT_KEY, JSON.stringify({ attempts: 0, isBlocked: false, lockoutUntil: 0, lastFailedAt: 0 }));
  }
  if (!portal || portal === 'all' || portal === 'admin') {
    safeStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify({ attempts: 0, isBlocked: false, lockoutUntil: 0, lastFailedAt: 0 }));
  }

  // Atualiza status dos alertas para 'desbloqueado_pelo_admin'
  const alerts = getSecurityAlerts().map(a => ({
    ...a,
    status: 'desbloqueado_pelo_admin' as const
  }));
  saveSecurityAlerts(alerts);

  window.dispatchEvent(new Event(SECURITY_EVENT));
  window.dispatchEvent(new CustomEvent('dra_leia_portal_unlocked'));
}

/**
 * Hook do React para monitorar estado de bloqueio e alertas
 */
export function usePortalSecurity(portal: 'admin' | 'usuario') {
  const [lockout, setLockout] = useState<PortalLockoutState>(() => getPortalLockout(portal));
  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => getSecurityAlerts());

  useEffect(() => {
    const handleUpdate = () => {
      setLockout(getPortalLockout(portal));
      setAlerts(getSecurityAlerts());
    };

    window.addEventListener(SECURITY_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('dra_leia_portal_unlocked', handleUpdate);

    // Timer para atualizar contagem regressiva se bloqueado
    const timer = setInterval(() => {
      const current = getPortalLockout(portal);
      setLockout(current);
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener(SECURITY_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('dra_leia_portal_unlocked', handleUpdate);
    };
  }, [portal]);

  const remainingSeconds = lockout.isBlocked && lockout.lockoutUntil
    ? Math.max(0, Math.ceil((lockout.lockoutUntil - Date.now()) / 1000))
    : 0;

  return {
    lockout,
    isBlocked: lockout.isBlocked && remainingSeconds > 0,
    remainingSeconds,
    alerts,
    activeAlertsCount: alerts.filter(a => a.status === 'bloqueado').length,
    unlock: (target?: 'admin' | 'usuario' | 'all') => adminUnlockPortal(target)
  };
}
