import { Link } from 'react-router-dom';

export function BecomeATutor() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold">Teach ancient languages on Paleoglossa</h1>
        <p className="mt-4 text-lg text-stone-700">
          Connect with serious learners of Ancient Greek, Latin, Biblical Hebrew, Syriac, Coptic,
          and more. Set your own rate, build your reputation, and teach in a tool already designed
          for your field.
        </p>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold">Curated supply</h3>
            <p className="text-sm text-stone-600 mt-1">
              Manual verification — your profile sits alongside scholars, not hobbyists.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold">Integrated tools</h3>
            <p className="text-sm text-stone-600 mt-1">
              Co-read a corpus text with your student during the lesson. Built-in.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold">Stripe payouts</h3>
            <p className="text-sm text-stone-600 mt-1">
              Payouts handled by Stripe Connect. KYC + tax forms done for you.
            </p>
          </div>
        </section>

        <div className="mt-8 flex gap-3">
          <Link
            to="/auth/signup?role=tutor"
            className="px-5 py-3 rounded bg-stone-900 text-white"
          >
            Apply to teach
          </Link>
          <Link to="/marketplace" className="px-5 py-3 rounded border border-stone-900">
            Browse tutors
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BecomeATutor;
