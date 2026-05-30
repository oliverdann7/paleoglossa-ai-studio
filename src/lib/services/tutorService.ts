import { apiFetch } from './apiFetch.js';
import type { TutorProfile } from '../../types/firestore.js';

export interface TutorListFilters {
  languageId?: string;
  maxPriceCents?: number;
  minRating?: number;
}

export type TutorProfileInput = Pick<
  TutorProfile,
  | 'displayName'
  | 'headline'
  | 'bio'
  | 'avatarUrl'
  | 'videoIntroUrl'
  | 'timezone'
  | 'country'
  | 'currency'
  | 'hourlyRateCents'
  | 'languagesTaught'
  | 'spokenLanguages'
  | 'credentials'
  | 'tags'
>;

export class TutorService {
  static async list(filters: TutorListFilters = {}): Promise<TutorProfile[]> {
    const qs = new URLSearchParams();
    if (filters.languageId) qs.set('languageId', filters.languageId);
    if (filters.maxPriceCents != null) qs.set('maxPriceCents', String(filters.maxPriceCents));
    if (filters.minRating != null) qs.set('minRating', String(filters.minRating));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    try {
      return await apiFetch<TutorProfile[]>(`/api/tutors${suffix}`, { skipAuth: true });
    } catch {
      return [];
    }
  }

  static async get(uid: string): Promise<TutorProfile | null> {
    try {
      return await apiFetch<TutorProfile>(`/api/tutors/${encodeURIComponent(uid)}`, {
        skipAuth: true,
      });
    } catch {
      return null;
    }
  }

  static async getMyProfile(): Promise<TutorProfile | null> {
    try {
      return await apiFetch<TutorProfile | null>('/api/tutors/me/profile');
    } catch {
      return null;
    }
  }

  static async upsertMyProfile(input: TutorProfileInput): Promise<TutorProfile | null> {
    try {
      return await apiFetch<TutorProfile>('/api/tutors/me', { method: 'POST', body: input });
    } catch {
      return null;
    }
  }

  static async publish(): Promise<boolean> {
    try {
      await apiFetch('/api/tutors/me/publish', { method: 'POST', body: {} });
      return true;
    } catch {
      return false;
    }
  }
}
