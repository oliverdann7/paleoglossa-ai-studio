import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TutorService } from '../../lib/services/tutorService.js';
import { AvailabilityService, type ResolvedSlot } from '../../lib/services/availabilityService.js';
import { BookingService } from '../../lib/services/bookingService.js';
import type { TutorProfile } from '../../types/firestore.js';
import {
  MARKETPLACE_LESSON_DURATIONS_MIN,
  type LessonDurationMin,
} from '../../lib/constants/marketplace.js';

export function BookingCheckout() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [duration, setDuration] = useState<LessonDurationMin>(60);
  const [slots, setSlots] = useState<ResolvedSlot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    (async () => {
      const t = await TutorService.get(uid);
      if (!active) return;
      setTutor(t);
      const from = Date.now();
      const to = from + 14 * 24 * 60 * 60 * 1000;
      const s = await AvailabilityService.getSlots(uid, from, to, duration);
      if (!active) return;
      setSlots(s);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [uid, duration]);

  const onBook = async () => {
    if (!uid || !tutor || !selected) return;
    setSubmitting(true);
    setError(null);
    const res = await BookingService.create({
      tutorId: uid,
      languageId: tutor.languagesTaught[0]?.languageId || 'grc',
      startAt: selected,
      durationMin: duration,
    });
    setSubmitting(false);
    if (!res) {
      setError('Could not create booking. The slot may already be taken.');
      return;
    }
    if (res.devMode || !res.clientSecret) {
      navigate(`/app/lessons/${res.bookingId}?devMode=1`);
      return;
    }
    navigate(`/app/lessons/${res.bookingId}?clientSecret=${encodeURIComponent(res.clientSecret)}`);
  };

  if (loading) return <div className="p-6">Loading availability…</div>;
  if (!tutor) return <div className="p-6">Tutor not found.</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Book a lesson with {tutor.displayName}</h1>

      <label className="block mt-4 text-sm">
        Duration
        <select
          className="ml-2 border rounded px-2 py-1"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value) as LessonDurationMin)}
        >
          {MARKETPLACE_LESSON_DURATIONS_MIN.map((d) => (
            <option key={d} value={d}>
              {d} min
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4">
        <div className="font-semibold mb-2">Pick a slot</div>
        {slots.length === 0 ? (
          <p className="text-stone-600 text-sm">No slots available in the next 14 days.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {slots.slice(0, 60).map((s) => {
              const d = new Date(s.startAt);
              const label = d.toLocaleString();
              const isSel = selected === s.startAt;
              return (
                <button
                  key={s.startAt}
                  onClick={() => setSelected(s.startAt)}
                  className={`text-xs border rounded px-2 py-1 ${
                    isSel ? 'bg-stone-900 text-white' : 'bg-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 text-sm">
        Total: <strong>${((tutor.hourlyRateCents * duration) / 60 / 100).toFixed(2)}</strong>{' '}
        {tutor.currency}
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      <button
        onClick={onBook}
        disabled={!selected || submitting}
        className="mt-4 px-4 py-2 rounded bg-stone-900 text-white disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Confirm booking'}
      </button>
    </div>
  );
}

export default BookingCheckout;
