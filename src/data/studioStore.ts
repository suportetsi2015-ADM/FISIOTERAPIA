import { useState, useEffect } from 'react';
import { StudioImage } from '../types';
import { STUDIO_IMAGES as DEFAULT_STUDIO_IMAGES } from './content';

const STORAGE_KEY = 'dra_leia_studio_gallery_v2';
const STUDIO_GALLERY_CHANGED_EVENT = 'dra_leia_studio_gallery_changed';

export function getStoredStudioImages(): StudioImage[] {
  if (typeof window === 'undefined') return DEFAULT_STUDIO_IMAGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STUDIO_IMAGES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STUDIO_IMAGES;
  } catch {
    return DEFAULT_STUDIO_IMAGES;
  }
}

export function saveStoredStudioImages(images: StudioImage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    window.dispatchEvent(new Event(STUDIO_GALLERY_CHANGED_EVENT));
    if (typeof window !== 'undefined') {
      fetch('/api/studio-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(images)
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Erro ao salvar galeria do estúdio:', error);
    throw new Error('Não foi possível salvar as fotos. Reduza o tamanho ou a quantidade de imagens.');
  }
}

export function addStudioImage(newImage: Omit<StudioImage, 'id'> & { id?: string }): StudioImage {
  const current = getStoredStudioImages();
  const created: StudioImage = {
    id: newImage.id || `studio-img-${Date.now()}`,
    title: newImage.title.trim() || 'Procedimento / Espaço Dra. Léia Mar',
    description: newImage.description.trim() || 'Atendimento privativo e especializado em Pilates e Fisioterapia.',
    url: newImage.url,
    aspect: newImage.aspect || 'landscape'
  };
  const updated = [created, ...current];
  saveStoredStudioImages(updated);
  return created;
}

export function updateStudioImage(id: string, updates: Partial<Omit<StudioImage, 'id'>>): void {
  const current = getStoredStudioImages();
  const updated = current.map(item => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveStoredStudioImages(updated);
}

export function deleteStudioImage(id: string): void {
  const current = getStoredStudioImages();
  const updated = current.filter(item => item.id !== id);
  saveStoredStudioImages(updated);
}

export function resetStoredStudioImages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(STUDIO_GALLERY_CHANGED_EVENT));
    if (typeof window !== 'undefined') {
      fetch('/api/studio-data', { method: 'DELETE' }).catch(() => {});
    }
  } catch (error) {
    console.error('Erro ao restaurar galeria:', error);
  }
}

// Sincronização inicial com o servidor
if (typeof window !== 'undefined') {
  fetch('/api/studio-data')
    .then((r) => r.json())
    .then((res) => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        window.dispatchEvent(new Event(STUDIO_GALLERY_CHANGED_EVENT));
      }
    })
    .catch(() => {});
}

export function useStudioImages(): StudioImage[] {
  const [images, setImages] = useState<StudioImage[]>(getStoredStudioImages());

  useEffect(() => {
    const handleUpdate = () => {
      setImages(getStoredStudioImages());
    };
    window.addEventListener(STUDIO_GALLERY_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin-sync-studio_data', handleUpdate);
    return () => {
      window.removeEventListener(STUDIO_GALLERY_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin-sync-studio_data', handleUpdate);
    };
  }, []);

  return images;
}
