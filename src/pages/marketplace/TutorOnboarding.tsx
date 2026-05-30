import { useEffect, useState } from 'react';
import { ConnectService, type ConnectStatusResponse } from '../../lib/services/connectService.js';
import { TutorService, type TutorProfileInput } from '../../lib/services/tutorService.js';
import type { TutorProfile } from '../../types/firestore.js';

const EMPTY_PROFILE: TutorProfileInput = {
  displayName: '',
  headline: '',
  bio: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  country: 'US',
  currency: 'USD',
  hourlyRateCents: 3000,
  languagesTaught: [{ languageId: 'grc', level: 'fluent', canTeach: true }],
  spokenLanguages: ['en'],
  credentials: [],
  tags: [],
};

export function TutorOnboarding() {
  const [connect, setConnect] = useState<ConnectStatusResponse | null>(null);
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [form, setForm] = useState<TutorProfileInput>(EMPTY_PROFILE);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([ConnectService.getStatus(), TutorService.getMyProfile()]).then(([c, p]) => {
      if (!active) return;
      setConnect(c);
      setProfile(p);
      if (p) {
        setForm({
          displayName: p.displayName,
          headline: p.headline,
          bio: p.bio,
          avatarUrl: p.avatarUrl,
          videoIntroUrl: p.videoIntroUrl,
          timezone: p.timezone,
          country: p.country,
          currency: p.currency,
          hourlyRateCents: p.hourlyRateCents,
          languagesTaught: p.languagesTaught,
          spokenLanguages: p.spokenLanguages,
          credentials: p.credentials,
          tags: p.tags,
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const onStripeOnboard = async () => {
    const { url } = await ConnectService.startOnboarding({});
    if (url) window.location.href = url;
    else setMessage('Stripe Connect is not configured in this environment.');
  };

  const onSave = async () => {
    setSaving(true);
    const updated = await TutorService.upsertMyProfile(form);
    setSaving(false);
    if (updated) {
      setProfile(updated);
      setMessage('Profile saved.');
    } else {
      setMessage('Could not save profile — check that all required fields are filled.');
    }
  };

  const onPublish = async () => {
    const ok = await TutorService.publish();
    setMessage(
      ok
        ? 'Profile published.'
        : 'Cannot publish yet — needs Stripe Connect verified and admin approval.'
    );
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Become a tutor</h1>
      <p className="text-stone-600 mt-1">
        Teach ancient languages on Paleoglossa. Closed beta — manual verification required.
      </p>

      <section className="mt-6 rounded-lg border border-stone-200 p-4">
        <h2 className="font-semibold">1. Stripe payouts</h2>
        <div className="text-sm text-stone-600 mt-1">
          Status: <strong>{connect?.status ?? '…'}</strong>
        </div>
        <button
          onClick={onStripeOnboard}
          className="mt-3 px-4 py-2 rounded bg-stone-900 text-white"
        >
          {connect?.accountId ? 'Continue onboarding' : 'Connect with Stripe'}
        </button>
      </section>

      <section className="mt-4 rounded-lg border border-stone-200 p-4 space-y-3">
        <h2 className="font-semibold">2. Your profile</h2>
        <label className="block text-sm">
          Display name
          <input
            className="mt-1 w-full border rounded px-2 py-1"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Headline
          <input
            className="mt-1 w-full border rounded px-2 py-1"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Bio
          <textarea
            className="mt-1 w-full border rounded px-2 py-1"
            rows={5}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Hourly rate (USD cents)
          <input
            type="number"
            className="mt-1 w-full border rounded px-2 py-1"
            value={form.hourlyRateCents}
            onChange={(e) =>
              setForm({ ...form, hourlyRateCents: Number(e.target.value) || 0 })
            }
          />
        </label>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded bg-stone-900 text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </section>

      <section className="mt-4 rounded-lg border border-stone-200 p-4">
        <h2 className="font-semibold">3. Publish</h2>
        <div className="text-sm text-stone-600 mt-1">
          Verification: <strong>{profile?.verificationStatus ?? 'not started'}</strong> · Published:{' '}
          <strong>{profile?.published ? 'yes' : 'no'}</strong>
        </div>
        <button
          onClick={onPublish}
          className="mt-3 px-4 py-2 rounded border border-stone-900"
        >
          Publish profile
        </button>
      </section>

      {message && (
        <div className="mt-4 text-sm text-stone-700" role="status">
          {message}
        </div>
      )}
    </div>
  );
}

export default TutorOnboarding;
