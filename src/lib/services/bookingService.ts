import { apiFetch } from './apiFetch.js';
import type { Booking, TutorReview } from '../../types/firestore.js';

export interface CreateBookingResponse {
  bookingId: string;
  clientSecret?: string;
  paymentIntentId?: string;
  priceCents: number;
  platformFeeCents: number;
  currency: string;
  devMode?: boolean;
}

export class BookingService {
  static async create(input: {
    tutorId: string;
    languageId: string;
    startAt: string;
    durationMin: 30 | 60 | 90;
    lessonGoal?: string;
    attachedTextId?: string;
  }): Promise<CreateBookingResponse | null> {
    try {
      return await apiFetch<CreateBookingResponse>('/api/bookings', {
        method: 'POST',
        body: input,
      });
    } catch {
      return null;
    }
  }

  static async listMine(): Promise<Booking[]> {
    try {
      return await apiFetch<Booking[]>('/api/bookings/mine');
    } catch {
      return [];
    }
  }

  static async get(id: string): Promise<Booking | null> {
    try {
      return await apiFetch<Booking>(`/api/bookings/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  }

  static async cancel(id: string, reason?: string): Promise<{ refundCents: number } | null> {
    try {
      return await apiFetch<{ refundCents: number }>(
        `/api/bookings/${encodeURIComponent(id)}/cancel`,
        { method: 'POST', body: { reason } }
      );
    } catch {
      return null;
    }
  }

  static async review(
    bookingId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    body: string
  ): Promise<boolean> {
    try {
      await apiFetch(`/api/bookings/${encodeURIComponent(bookingId)}/review`, {
        method: 'POST',
        body: { rating, body },
      });
      return true;
    } catch {
      return false;
    }
  }

  static async reviewsFor(tutorUid: string): Promise<TutorReview[]> {
    try {
      return await apiFetch<TutorReview[]>(
        `/api/tutors/${encodeURIComponent(tutorUid)}/reviews`,
        { skipAuth: true }
      );
    } catch {
      return [];
    }
  }
}
