import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TutorService } from '../../lib/services/tutorService.js';
import type { TutorProfile } from '../../types/firestore.js';

export function TutorDirectory() {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    TutorService.list().then((data) => {
      if (active) {
        setTutors(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading tutors…</div>;

  if (tutors.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Find a tutor</h1>
        <p className="text-stone-600">
          No verified tutors yet. The marketplace is in closed beta — check back soon, or{' '}
          <Link to="/app/teach" className="underline">
            become a tutor
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Find a tutor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tutors.map((t) => (
          <Link
            key={t.uid}
            to={`/app/tutors/${t.uid}`}
            className="block rounded-lg border border-stone-200 p-4 hover:shadow-md transition"
          >
            <div className="font-semibold">{t.displayName}</div>
            <div className="text-sm text-stone-500 mt-1">{t.headline}</div>
            <div className="text-xs text-stone-400 mt-2">
              {t.languagesTaught.map((l) => l.languageId).join(', ')}
            </div>
            <div className="mt-3 text-sm font-medium">
              ${(t.hourlyRateCents / 100).toFixed(0)} {t.currency} / hour
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TutorDirectory;
