import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookingService } from '../../lib/services/bookingService.js';
import type { Booking } from '../../types/firestore.js';

export function LessonRoom() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [reviewBody, setReviewBody] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    BookingService.get(bookingId).then((data) => {
      if (active) {
        setBooking(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [bookingId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!booking || !bookingId) return <div className="p-6">Booking not found.</div>;

  const onCancel = async () => {
    const res = await BookingService.cancel(bookingId);
    if (res) setMessage(`Cancelled. Refund: $${(res.refundCents / 100).toFixed(2)}`);
  };

  const onSubmitReview = async () => {
    const ok = await BookingService.review(bookingId, rating, reviewBody);
    setMessage(ok ? 'Thanks for your review.' : 'Could not submit review.');
  };

  const canCancel = ['pending_payment', 'confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed';

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Lesson</h1>
      <div className="text-stone-600 mt-1">
        {new Date(booking.startAt as string).toLocaleString()} · {booking.durationMin} min ·{' '}
        {booking.status}
      </div>

      {booking.videoRoomUrl && (
        <div className="mt-4 rounded overflow-hidden border" style={{ height: 480 }}>
          <iframe
            title="Lesson room"
            src={booking.videoRoomUrl}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full"
          />
        </div>
      )}

      {!booking.videoRoomUrl && booking.status === 'pending_payment' && (
        <div className="mt-4 text-sm text-stone-600">
          Awaiting payment confirmation. The video room will appear here once payment is complete.
        </div>
      )}

      <div className="mt-6 space-x-3">
        {canCancel && (
          <button onClick={onCancel} className="px-3 py-2 rounded border">
            Cancel lesson
          </button>
        )}
      </div>

      {canReview && (
        <section className="mt-8 border-t pt-6">
          <h2 className="font-semibold">Leave a review</h2>
          <div className="mt-2">
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              className="border rounded px-2 py-1"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="mt-2 w-full border rounded px-2 py-1"
            rows={4}
            value={reviewBody}
            onChange={(e) => setReviewBody(e.target.value)}
          />
          <button onClick={onSubmitReview} className="mt-2 px-3 py-2 rounded bg-stone-900 text-white">
            Submit review
          </button>
        </section>
      )}

      {message && <div className="mt-4 text-sm text-stone-700">{message}</div>}
    </div>
  );
}

export default LessonRoom;
