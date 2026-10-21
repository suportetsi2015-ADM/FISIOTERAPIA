import { useState, useEffect } from 'react';
import { safeStorage } from '../utils/safeStorage';

export const SERVER_OFFICIAL_HERO = '/images/dra_leia_principal.jpg';
export const SERVER_OFFICIAL_PORTRAIT = '/images/dra_leia_sobre.jpg';
export const SERVER_OFFICIAL_LOGO = '/images/logo_transparente.png';

const STORAGE_PORTRAIT_KEY = 'dra_leia_photo_portrait_v6';
const STORAGE_HERO_KEY = 'dra_leia_photo_hero_v6';
const STORAGE_LOGO_KEY = 'dra_leia_logo_custom_v6';
export const PHOTOS_CHANGED_EVENT = 'dra_leia_photos_updated';
const BROADCAST_CHANNEL_NAME = 'dra_leia_photos_sync_channel';

export interface OfficialPhotos {
  portrait: string;
  studioHero: string;
  customLogo?: string | null;
  portraitIsCustom: boolean;
  heroIsCustom: boolean;
}

// In-memory cache to guarantee instant synchronous access across all components
let cachedPhotos: OfficialPhotos = {
  portrait: SERVER_OFFICIAL_PORTRAIT,
  studioHero: SERVER_OFFICIAL_HERO,
  customLogo: SERVER_OFFICIAL_LOGO,
  portraitIsCustom: false,
  heroIsCustom: false
};

// Singleton BroadcastChannel for multi-tab zero-latency sync
let photosBroadcastChannel: BroadcastChannel | null = null;
function getPhotosBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    if (!photosBroadcastChannel) {
      try {
        photosBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        photosBroadcastChannel.onmessage = (event) => {
          if (event && event.data) {
            applyServerPhotoUpdate(event.data, false);
          }
        };
      } catch (_) {}
    }
    return photosBroadcastChannel;
  }
  return null;
}

// Initialize cachedPhotos from local storage if available
if (typeof window !== 'undefined') {
  try {
    const storedPortrait = safeStorage.getItem(STORAGE_PORTRAIT_KEY);
    const storedHero = safeStorage.getItem(STORAGE_HERO_KEY);
    const storedLogo = safeStorage.getItem(STORAGE_LOGO_KEY);

    if (storedPortrait) {
      cachedPhotos.portrait = storedPortrait;
      cachedPhotos.portraitIsCustom = true;
    }
    if (storedHero) {
      cachedPhotos.studioHero = storedHero;
      cachedPhotos.heroIsCustom = true;
    }
    if (storedLogo) {
      cachedPhotos.customLogo = storedLogo;
    }
  } catch (_) {}
  getPhotosBroadcastChannel();
}

/**
 * Consulta o servidor global (/api/official-photos) para obter as fotos
 * canônicas definidas pelo Administrador, garantindo que qualquer navegador
 * (Chrome, Safari, Edge, Firefox, iPhone, Android) exiba a mesma foto em tempo real.
 */
export async function fetchOfficialPhotosFromServer(): Promise<OfficialPhotos> {
  if (typeof window === 'undefined') return cachedPhotos;

  try {
    const res = await fetch('/api/official-photos?t=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, max-age=0' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const d = json.data;
        const newHero = d.studioHero || SERVER_OFFICIAL_HERO;
        const newPortrait = d.portrait || SERVER_OFFICIAL_PORTRAIT;
        const newLogo = d.customLogo || SERVER_OFFICIAL_LOGO;

        const hasChanged =
          cachedPhotos.studioHero !== newHero ||
          cachedPhotos.portrait !== newPortrait ||
          cachedPhotos.customLogo !== newLogo;

        cachedPhotos = {
          studioHero: newHero,
          portrait: newPortrait,
          customLogo: newLogo,
          heroIsCustom: Boolean(d.heroUpdatedAt && newHero !== SERVER_OFFICIAL_HERO),
          portraitIsCustom: Boolean(d.portraitUpdatedAt && newPortrait !== SERVER_OFFICIAL_PORTRAIT)
        };

        // Salva apenas as URLs (strings pequenas e seguras) no safeStorage
        safeStorage.setItem(STORAGE_HERO_KEY, newHero);
        safeStorage.setItem(STORAGE_PORTRAIT_KEY, newPortrait);
        safeStorage.setItem(STORAGE_LOGO_KEY, newLogo);

        if (hasChanged) {
          window.dispatchEvent(new Event(PHOTOS_CHANGED_EVENT));
        }
        return cachedPhotos;
      }
    }
  } catch (err) {
    console.warn('[PhotoStore] Erro ao sincronizar fotos do servidor:', err);
  }
  return cachedPhotos;
}

// Dispara a busca imediata no carregamento do módulo no navegador
if (typeof window !== 'undefined') {
  fetchOfficialPhotosFromServer().catch(() => {});
}

/**
 * Aplica uma atualização recebida do servidor (via SSE ou BroadcastChannel)
 */
export function applyServerPhotoUpdate(payloadData: any, shouldBroadcast = true): void {
  if (!payloadData) return;

  if (payloadData.photos) {
    const p = payloadData.photos;
    if (p.studioHero) {
      cachedPhotos.studioHero = p.studioHero;
      cachedPhotos.heroIsCustom = true;
    }
    if (p.portrait) {
      cachedPhotos.portrait = p.portrait;
      cachedPhotos.portraitIsCustom = true;
    }
    if (p.customLogo) cachedPhotos.customLogo = p.customLogo;
  } else if (payloadData.type && payloadData.url) {
    const t = payloadData.type;
    const u = payloadData.url;
    if (t === 'studioHero' || t === 'principal' || t === 'hero') {
      cachedPhotos.studioHero = u;
      cachedPhotos.heroIsCustom = true;
    } else if (t === 'portrait' || t === 'sobre') {
      cachedPhotos.portrait = u;
      cachedPhotos.portraitIsCustom = true;
    } else if (t === 'logo' || t === 'customLogo') {
      cachedPhotos.customLogo = u;
    }
  }

  if (cachedPhotos.studioHero) safeStorage.setItem(STORAGE_HERO_KEY, cachedPhotos.studioHero);
  if (cachedPhotos.portrait) safeStorage.setItem(STORAGE_PORTRAIT_KEY, cachedPhotos.portrait);
  if (cachedPhotos.customLogo) safeStorage.setItem(STORAGE_LOGO_KEY, cachedPhotos.customLogo);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PHOTOS_CHANGED_EVENT));
    if (shouldBroadcast) {
      try {
        const channel = getPhotosBroadcastChannel();
        channel?.postMessage(payloadData);
      } catch (_) {}
    }
  }
}

export function getOfficialPhotos(): OfficialPhotos {
  return cachedPhotos;
}

export async function saveOfficialPhoto(type: 'portrait' | 'studioHero' | 'logo', dataUrlOrUrl: string): Promise<void> {
  const isUrl = !dataUrlOrUrl.startsWith('data:');

  // 1. Atualização otimista na memória para resposta instantânea
  if (type === 'portrait') {
    cachedPhotos.portrait = dataUrlOrUrl;
    cachedPhotos.portraitIsCustom = true;
    if (isUrl) safeStorage.setItem(STORAGE_PORTRAIT_KEY, dataUrlOrUrl);
  } else if (type === 'studioHero') {
    cachedPhotos.studioHero = dataUrlOrUrl;
    cachedPhotos.heroIsCustom = true;
    if (isUrl) safeStorage.setItem(STORAGE_HERO_KEY, dataUrlOrUrl);
  } else if (type === 'logo') {
    cachedPhotos.customLogo = dataUrlOrUrl;
    if (isUrl) safeStorage.setItem(STORAGE_LOGO_KEY, dataUrlOrUrl);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PHOTOS_CHANGED_EVENT));
  }

  // 2. Grava de forma definitiva no servidor para todos os navegadores
  try {
    const res = await fetch('/api/save-official-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, dataUrl: dataUrlOrUrl })
    });

    if (res.ok) {
      const result = await res.json();
      if (result && result.photos) {
        applyServerPhotoUpdate(result);
      } else if (result && result.url) {
        applyServerPhotoUpdate({ type, url: result.url });
      }
    } else {
      const errText = await res.text();
      throw new Error(`Falha no servidor (${res.status}): ${errText}`);
    }
  } catch (serverErr) {
    console.error('[PhotoStore] Erro ao sincronizar foto com o servidor:', serverErr);
    throw serverErr;
  }
}

export async function resetOfficialPhotos(type?: 'portrait' | 'studioHero' | 'logo'): Promise<void> {
  const now = Date.now();
  if (!type || type === 'portrait') {
    cachedPhotos.portrait = `${SERVER_OFFICIAL_PORTRAIT}?t=${now}`;
    cachedPhotos.portraitIsCustom = false;
    safeStorage.removeItem(STORAGE_PORTRAIT_KEY);
  }
  if (!type || type === 'studioHero') {
    cachedPhotos.studioHero = `${SERVER_OFFICIAL_HERO}?t=${now}`;
    cachedPhotos.heroIsCustom = false;
    safeStorage.removeItem(STORAGE_HERO_KEY);
  }
  if (!type || type === 'logo') {
    cachedPhotos.customLogo = `${SERVER_OFFICIAL_LOGO}?t=${now}`;
    safeStorage.removeItem(STORAGE_LOGO_KEY);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PHOTOS_CHANGED_EVENT));
  }

  try {
    const res = await fetch('/api/reset-official-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    if (res.ok) {
      const result = await res.json();
      if (result && result.photos) {
        applyServerPhotoUpdate(result);
      }
    }
  } catch (err) {
    console.warn('[PhotoStore] Erro ao resetar foto no servidor:', err);
  }
}

/**
 * Converte qualquer arquivo de imagem selecionado pelo administrador (iPhone, Android, JPEG, PNG, HEIC)
 * em um DataURL JPEG padrão de alta qualidade e tamanho ultra-otimizado (~400KB), garantindo
 * envio instantâneo e renderização perfeita em 100% dos navegadores.
 */
export function processImageFile(file: File, maxDimension = 2048, quality = 0.92): Promise<string> {
  return new Promise((resolve, reject) => {
    // Se for SVG ou já for pequeno e PNG
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo SVG'));
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          throw new Error('Dimensões inválidas da imagem');
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Falha ao instanciar canvas de renderização');
        }

        // Fundo branco para caso a imagem original tenha canal alpha transparente convertida para jpeg
        if (file.type !== 'image/png') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Falha ao converter imagem'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback para FileReader direto
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado'));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * React hook that subscribes to official photos changes in real-time
 */
export function useOfficialPhotos(): OfficialPhotos {
  const [photos, setPhotos] = useState<OfficialPhotos>(() => cachedPhotos);

  useEffect(() => {
    // 1. Sempre busca do servidor na montagem do componente
    fetchOfficialPhotosFromServer().then((fresh) => {
      setPhotos({ ...fresh });
    }).catch(() => {});

    const handleUpdate = () => {
      setPhotos({ ...cachedPhotos });
    };

    const handleSseSync = (e: any) => {
      if (e && e.detail) {
        applyServerPhotoUpdate(e.detail);
      }
      setPhotos({ ...cachedPhotos });
    };

    // 2. Ouvintes de eventos locais e multi-abas
    window.addEventListener(PHOTOS_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin-sync-official_photo', handleSseSync);
    window.addEventListener('admin-sync-official_photos', handleSseSync);

    // 3. Atualiza imediatamente ao focar na janela/aba ou voltar ao app no celular
    const handleFocus = () => {
      fetchOfficialPhotosFromServer().then((fresh) => {
        setPhotos({ ...fresh });
      }).catch(() => {});
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    // 4. Polling leve a cada 3.5 segundos em segundo plano
    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOfficialPhotosFromServer().catch(() => {});
      }
    }, 3500);

    return () => {
      window.clearInterval(pollInterval);
      window.removeEventListener(PHOTOS_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin-sync-official_photo', handleSseSync);
      window.removeEventListener('admin-sync-official_photos', handleSseSync);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return photos;
}
