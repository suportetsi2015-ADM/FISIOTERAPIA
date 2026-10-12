import { useState, useEffect } from 'react';
import { FaqItem } from '../types';
import { FAQS as INITIAL_FAQS } from './content';

const FAQ_STORAGE_KEY = 'dra_leia_faqs_v1';

export function getStoredFaqs(): FaqItem[] {
  try {
    const saved = localStorage.getItem(FAQ_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler faqs do localStorage:', e);
  }
  return INITIAL_FAQS;
}

export function saveStoredFaqs(faqs: FaqItem[]): void {
  try {
    localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(faqs));
    window.dispatchEvent(new Event('dra_leia_faqs_updated'));
    if (typeof window !== 'undefined') {
      fetch('/api/faq-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqs)
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao salvar faqs no localStorage:', e);
  }
}

export function resetStoredFaqs(): FaqItem[] {
  try {
    localStorage.removeItem(FAQ_STORAGE_KEY);
    window.dispatchEvent(new Event('dra_leia_faqs_updated'));
    if (typeof window !== 'undefined') {
      fetch('/api/faq-data', { method: 'DELETE' }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao resetar faqs:', e);
  }
  return INITIAL_FAQS;
}

// Sincronização inicial com o servidor
if (typeof window !== 'undefined') {
  fetch('/api/faq-data')
    .then((r) => r.json())
    .then((res) => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(res.data));
        window.dispatchEvent(new Event('dra_leia_faqs_updated'));
      }
    })
    .catch(() => {});
}

export function useFaqs(): {
  faqs: FaqItem[];
  addFaq: (faq: Omit<FaqItem, 'id'>) => void;
  updateFaq: (id: string, updated: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;
  reorderFaqs: (newFaqs: FaqItem[]) => void;
  resetFaqs: () => void;
} {
  const [faqs, setFaqs] = useState<FaqItem[]>(getStoredFaqs);

  useEffect(() => {
    const handleUpdate = () => {
      setFaqs(getStoredFaqs());
    };
    window.addEventListener('dra_leia_faqs_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin-sync-faq_data', handleUpdate);
    return () => {
      window.removeEventListener('dra_leia_faqs_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin-sync-faq_data', handleUpdate);
    };
  }, []);

  const addFaq = (faq: Omit<FaqItem, 'id'>) => {
    const current = getStoredFaqs();
    const newId = `faq-${Date.now()}`;
    const updated = [...current, { ...faq, id: newId }];
    saveStoredFaqs(updated);
    setFaqs(updated);
  };

  const updateFaq = (id: string, updated: Partial<FaqItem>) => {
    const current = getStoredFaqs();
    const list = current.map(item => (item.id === id ? { ...item, ...updated } : item));
    saveStoredFaqs(list);
    setFaqs(list);
  };

  const deleteFaq = (id: string) => {
    const current = getStoredFaqs();
    const list = current.filter(item => item.id !== id);
    saveStoredFaqs(list);
    setFaqs(list);
  };

  const reorderFaqs = (newFaqs: FaqItem[]) => {
    saveStoredFaqs(newFaqs);
    setFaqs(newFaqs);
  };

  const resetFaqs = () => {
    const list = resetStoredFaqs();
    setFaqs(list);
  };

  return { faqs, addFaq, updateFaq, deleteFaq, reorderFaqs, resetFaqs };
}
