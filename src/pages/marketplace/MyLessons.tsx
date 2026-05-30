import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookingService } from '../../lib/services/bookingService.js';
import type { Booking } from '../../types/firestore.js';

export function MyLessons() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    BookingService.listMine().then((data) => {
      if (active) {
        setBookings(data);
        setNow(Date.now());
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const { upcoming, past } = useMemo(() => {
    const up = bookings.filter(
      (b) =>
        ['pending_payment', 'confirmed'].includes(b.status) &&
        new Date(b.startAt as string).getTime() > now
    );
    return { upcoming: up, past: bookings.filter((b) => !up.includes(b)) };
  }, [bookings, now]);

  if (loading) return <div className="p-6">Loading lessons…</div>;

  if (bookings.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">My lessons</h1>
        <p className="text-stone-600">
          No lessons yet.{' '}
          <Link to="/app/tutors" className="underline">
            Find a tutor
          </Link>
          .
        </p>
      </div>
    );
  }

  const renderItem = (b: Booking) => {
    const startStr = new Date(b.startAt as string).toLocaleString();
    return (
      <Link
        key={b.id}
        to={`/app/lessons/${b.id}`}
        className="block border rounded p-3 hover:bg-stone-50"
      >
        <div className="font-medium">{startStr}</div>
        <div className="text-xs text-stone-500">
          {b.durationMin} min · {b.status} · ${((b.priceCents || 0) / 100).toFixed(2)} {b.currency}
        </div>
      </Link>
    );
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-3">Upcoming</h2>
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <p className="text-stone-500 text-sm">No upcoming lessons.</p>
          ) : (
            upcoming.map(renderItem)
          )}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3">Past</h2>
        <div className="space-y-2">
          {past.length === 0 ? (
            <p className="text-stone-500 text-sm">No past lessons.</p>
          ) : (
            past.map(renderItem)
          )}
        </div>
      </section>
    </div>
  );
}

export default MyLessons;
