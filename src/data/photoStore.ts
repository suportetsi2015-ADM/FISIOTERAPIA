import { useState, useEffect } from 'react';

// URL fixa do servidor para entrega global em qualquer dispositivo/navegador no domínio leiamarpilates.online
export const SERVER_OFFICIAL_HERO = '/images/dra_leia_principal.jpg';
export const SERVER_OFFICIAL_PORTRAIT = '/images/dra_leia_sobre.jpg';

const STORAGE_PORTRAIT_KEY = 'dra_leia_photo_portrait_v3';
const STORAGE_HERO_KEY = 'dra_leia_photo_hero_v3';
const PHOTOS_CHANGED_EVENT = 'dra_leia_photos_updated';

export interface OfficialPhotos {
  portrait: string;
  studioHero: string;
  portraitIsCustom: boolean;
  heroIsCustom: boolean;
}

export function getOfficialPhotos(): OfficialPhotos {
  if (typeof window === 'undefined') {
    return {
      portrait: SERVER_OFFICIAL_PORTRAIT,
      studioHero: SERVER_OFFICIAL_HERO,
      portraitIsCustom: false,
      heroIsCustom: false
    };
  }

  const storedPortrait = localStorage.getItem(STORAGE_PORTRAIT_KEY);
  const storedHero = localStorage.getItem(STORAGE_HERO_KEY);

  return {
    portrait: storedPortrait || SERVER_OFFICIAL_PORTRAIT,
    studioHero: storedHero || SERVER_OFFICIAL_HERO,
    portraitIsCustom: Boolean(storedPortrait),
    heroIsCustom: Boolean(storedHero)
  };
}

export async function saveOfficialPhoto(type: 'portrait' | 'studioHero', dataUrl: string): Promise<void> {
  // 1. Salva no localStorage local para renderização em tempo real instantânea
  try {
    if (type === 'portrait') {
      localStorage.setItem(STORAGE_PORTRAIT_KEY, dataUrl);
    } else {
      localStorage.setItem(STORAGE_HERO_KEY, dataUrl);
    }
    window.dispatchEvent(new Event(PHOTOS_CHANGED_EVENT));
  } catch (error) {
    console.warn('LocalStorage limit:', error);
  }

  // 2. Grava de forma definitiva no servidor (public/images/ e src/assets/images/)
  // Para que TODOS os navegadores, clientes e celulares no domínio leiamarpilates.online recebam a foto real
  try {
    await fetch('/api/save-official-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, dataUrl })
    });
    window.dispatchEvent(new Event(PHOTOS_CHANGED_EVENT));
  } catch (serverErr) {
    console.warn('Erro ao sincronizar foto com o servidor:', serverErr);
  }
}

export function resetOfficialPhotos(type?: 'portrait' | 'studioHero'): void {
  if (!type || type === 'portrait') {
    localStorage.removeItem(STORAGE_PORTRAIT_KEY);
  }
  if (!type || type === 'studioHero') {
    localStorage.removeItem(STORAGE_HERO_KEY);
  }
  window.dispatchEvent(new Event(PHOTOS_CHANGED_EVENT));
}

/**
 * Loads the image file.
 * If file size <= 3.5MB, reads 100% verbatim as DataURL without canvas manipulation or alteration.
 * If file is larger, gently scales down to fit local storage limit.
 */
export function processImageFile(file: File, maxDimension = 2000, quality = 0.95): Promise<string> {
  return new Promise((resolve, reject) => {
    // If under 3.5MB, keep 100% original binary stream without any modification
    if (file.size <= 3.5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo original'));
      reader.readAsDataURL(file);
      return;
    }

    // Only for very large files (>3.5MB) to avoid exceeding browser localStorage
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          reject(new Error('Falha ao processar contexto da imagem'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Erro ao carregar arquivo de imagem'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * React hook that subscribes to official photos changes in real-time
 */
export function useOfficialPhotos(): OfficialPhotos {
  const [photos, setPhotos] = useState<OfficialPhotos>(getOfficialPhotos);

  useEffect(() => {
    const handleUpdate = () => {
      setPhotos(getOfficialPhotos());
    };

    window.addEventListener(PHOTOS_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PHOTOS_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return photos;
}
