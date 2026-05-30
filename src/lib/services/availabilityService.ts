import { apiFetch } from './apiFetch.js';

export interface ResolvedSlot {
  startAt: string;
  endMs: number;
}

export class AvailabilityService {
  static async putRecurring(
    weekday: number,
    slots: { startMin: number; endMin: number }[]
  ): Promise<boolean> {
    try {
      await apiFetch(`/api/tutors/me/availability/recurring/${weekday}`, {
        method: 'PUT',
        body: { slots },
      });
      return true;
    } catch {
      return false;
    }
  }

  static async putException(
    date: string,
    blocks: { startMin: number; endMin: number }[],
    extraSlots: { startMin: number; endMin: number }[] = []
  ): Promise<boolean> {
    try {
      await apiFetch(`/api/tutors/me/availability/exception/${date}`, {
        method: 'PUT',
        body: { blocks, extraSlots },
      });
      return true;
    } catch {
      return false;
    }
  }

  static async getSlots(
    tutorUid: string,
    fromMs: number,
    toMs: number,
    durationMin: 30 | 60 | 90 = 60
  ): Promise<ResolvedSlot[]> {
    const qs = new URLSearchParams({
      from: String(fromMs),
      to: String(toMs),
      duration: String(durationMin),
    });
    try {
      return await apiFetch<ResolvedSlot[]>(
        `/api/tutors/${encodeURIComponent(tutorUid)}/slots?${qs.toString()}`,
        { skipAuth: true }
      );
    } catch {
      return [];
    }
  }
}
