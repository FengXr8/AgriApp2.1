import type { FarmSelection } from '../types';

const STORAGE_KEY = 'agriapp.currentFarmSelection';
let memorySelection: FarmSelection | null = null;
const listeners = new Set<(selection: FarmSelection | null) => void>();

function isSameSelection(a: FarmSelection | null, b: FarmSelection | null): boolean {
  return (a?.farmId || '') === (b?.farmId || '') && (a?.plotId || '') === (b?.plotId || '');
}

function getStorage(): Storage | null {
  if (typeof globalThis === 'undefined') return null;
  const storage = (globalThis as any).localStorage;
  return storage && typeof storage.getItem === 'function' ? storage : null;
}

export const farmSelectionService = {
  getSelection: (): FarmSelection | null => {
    const storage = getStorage();
    if (storage) {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return memorySelection;
      try {
        memorySelection = JSON.parse(raw);
        return memorySelection;
      } catch {
        storage.removeItem(STORAGE_KEY);
      }
    }
    return memorySelection;
  },

  setSelection: (selection: FarmSelection): void => {
    if (isSameSelection(farmSelectionService.getSelection(), selection)) {
      return;
    }
    memorySelection = selection;
    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(selection));
    }
    listeners.forEach(listener => listener(memorySelection));
  },

  clearSelection: (): void => {
    if (farmSelectionService.getSelection() === null) {
      return;
    }
    memorySelection = null;
    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }
    listeners.forEach(listener => listener(null));
  },

  subscribe: (listener: (selection: FarmSelection | null) => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
