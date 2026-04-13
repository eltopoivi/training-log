'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Sport } from './sports';

export interface TrainingEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sport: Sport;
  name: string;
  durationMin: number;
  distanceKm?: number;
  elevationM?: number;
  avgHr?: number;
  rpe?: number; // 1–10
  notes?: string;
}

export interface WellnessEntry {
  id: string;
  date: string;
  sleepHours?: number;
  sleepQuality?: number; // 1–5
  mood?: number;
  energy?: number;
  soreness?: number;
  weightKg?: number;
  restingHr?: number;
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snack',
};

export interface NutritionEntry {
  id: string;
  date: string;
  meal: MealType;
  description: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
}

export const STORAGE_KEYS = {
  training: 'tracker.v1.training',
  wellness: 'tracker.v1.wellness',
  nutrition: 'tracker.v1.nutrition',
  profile: 'tracker.v1.profile',
} as const;

export function newId(): string {
  // crypto.randomUUID is available in all modern browsers + Node 20+
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Read/write a namespaced localStorage array. Data loads on mount (client-only).
 * `loading` is true until the first hydration to avoid SSR/CSR mismatches.
 */
export function useLocalStore<T>(
  key: string,
  initial: T[] = [],
): {
  data: T[];
  loading: boolean;
  set: (updater: T[] | ((prev: T[]) => T[])) => void;
} {
  const [data, setData] = useState<T[]>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setData(JSON.parse(raw) as T[]);
    } catch {
      // ignore corrupt entries
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (updater: T[] | ((prev: T[]) => T[])) => {
      setData((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T[]) => T[])(prev) : updater;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // quota exceeded or SSR — ignore
        }
        return next;
      });
    },
    [key],
  );

  return { data, loading, set };
}

export function useProfile(): {
  profile: UserProfile;
  loading: boolean;
  save: (p: UserProfile) => void;
} {
  const [profile, setProfile] = useState<UserProfile>({ name: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.profile);
      if (raw) setProfile(JSON.parse(raw) as UserProfile);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const save = useCallback((p: UserProfile) => {
    setProfile(p);
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, []);

  return { profile, loading, save };
}

/** Dump all data for export. */
export function dumpAll(): {
  training: TrainingEntry[];
  wellness: WellnessEntry[];
  nutrition: NutritionEntry[];
  profile: UserProfile | null;
  exportedAt: string;
  version: 1;
} {
  const read = <T>(k: string): T[] => {
    try {
      return JSON.parse(localStorage.getItem(k) ?? '[]') as T[];
    } catch {
      return [];
    }
  };
  const readProfile = (): UserProfile | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.profile);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  };
  return {
    training: read<TrainingEntry>(STORAGE_KEYS.training),
    wellness: read<WellnessEntry>(STORAGE_KEYS.wellness),
    nutrition: read<NutritionEntry>(STORAGE_KEYS.nutrition),
    profile: readProfile(),
    exportedAt: new Date().toISOString(),
    version: 1,
  };
}

/** Replace everything with the payload. Throws on invalid shape. */
export function restoreAll(payload: unknown): void {
  if (!payload || typeof payload !== 'object') throw new Error('Payload inválido');
  const p = payload as Record<string, unknown>;
  const isArr = (v: unknown) => Array.isArray(v);
  if (!isArr(p.training) || !isArr(p.wellness) || !isArr(p.nutrition)) {
    throw new Error('Faltan campos training/wellness/nutrition');
  }
  localStorage.setItem(STORAGE_KEYS.training, JSON.stringify(p.training));
  localStorage.setItem(STORAGE_KEYS.wellness, JSON.stringify(p.wellness));
  localStorage.setItem(STORAGE_KEYS.nutrition, JSON.stringify(p.nutrition));
  if (p.profile && typeof p.profile === 'object') {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(p.profile));
  }
}

export function clearAll(): void {
  localStorage.removeItem(STORAGE_KEYS.training);
  localStorage.removeItem(STORAGE_KEYS.wellness);
  localStorage.removeItem(STORAGE_KEYS.nutrition);
  localStorage.removeItem(STORAGE_KEYS.profile);
}
