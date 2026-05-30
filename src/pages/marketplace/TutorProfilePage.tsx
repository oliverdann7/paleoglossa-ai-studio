import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TutorService } from '../../lib/services/tutorService.js';
import type { TutorProfile } from '../../types/firestore.js';

export function TutorProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    TutorService.get(uid).then((data) => {
      if (active) {
        setTutor(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [uid]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!tutor) return <div className="p-6">Tutor not found.</div>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{tutor.displayName}</h1>
      <div className="text-stone-600 mt-1">{tutor.headline}</div>
      <div className="mt-4 text-sm">
        Teaches:{' '}
        {tutor.languagesTaught
          .map((l) => `${l.languageId}${l.dialect ? ` (${l.dialect})` : ''}`)
          .join(', ')}
      </div>
      <div className="mt-2 text-lg font-semibold">
        ${(tutor.hourlyRateCents / 100).toFixed(2)} {tutor.currency} / hour
      </div>
      <p className="mt-4 whitespace-pre-wrap text-stone-700">{tutor.bio}</p>
      <button
        className="mt-6 px-4 py-2 rounded bg-stone-900 text-white disabled:opacity-50"
        disabled
        title="Booking coming in Phase 1"
      >
        Book a lesson (coming soon)
      </button>
    </div>
  );
}

export default TutorProfilePage;
