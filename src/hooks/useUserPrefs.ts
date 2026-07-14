import { useState, useEffect, useCallback } from 'react';
import type { BoardSize, Difficulty } from '../types';

// MARK: Schema
// bump CURRENT_VERSION whenever the shape changes to trigger a clean migration
const STORAGE_KEY = 'lq_prefs';
const CURRENT_VERSION = 1;

interface UserPrefs {
  version: number;
  isDark: boolean;
  boardSize: BoardSize;
  difficulty: Difficulty;
  autoCross: boolean;
}

const defaults: UserPrefs = {
  version: CURRENT_VERSION,
  isDark: true,
  boardSize: 8,
  difficulty: 'medium',
  autoCross: true,
};

// MARK: Load
function load(): UserPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<UserPrefs>;
    // discard saved data if the schema version changed
    if (parsed.version !== CURRENT_VERSION) return defaults;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

// MARK: Save
function save(prefs: UserPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage quota exceeded or private-browsing restriction — fail silently
  }
}

// MARK: Hook
export function useUserPrefs() {
  const [prefs, setPrefs] = useState<UserPrefs>(load);

  // persist on every change
  useEffect(() => { save(prefs); }, [prefs]);

  const setPref = useCallback(<K extends keyof Omit<UserPrefs, 'version'>>(
    key: K,
    value: UserPrefs[K],
  ) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  }, []);

  return { prefs, setPref };
}
