import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../api';
import DashboardShell from '../components/DashboardShell';

export default function Activity() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/activity')
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell title="Activity" description="A calm record of moments SafeNest helped protect.">
      {loading ? <p className="text-[#52616B]">Loading your family’s activity…</p> : (
        <>
          <section className="mb-8 flex items-end justify-between border-b border-[#BFD1D8] pb-6">
            <div>
              <p className="text-sm font-semibold text-[#52616B]">Blocked attempts</p>
              <p className="font-display text-6xl leading-none text-[#C65D4B]">{events.length}</p>
            </div>
            <p className="max-w-xs text-right text-sm leading-6 text-[#52616B]">Every entry is a boundary held quietly in the background.</p>
          </section>
          {error && <p role="alert" className="mb-5 border-l-4 border-[#C65D4B] bg-[#F8E7E2] px-4 py-3 text-sm font-semibold text-[#8D3E32]">{error}</p>}
          {events.length === 0 ? (
            <div className="border border-[#BFD1D8] bg-white px-6 py-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#2F6F68]" />
              <h2 className="mt-4 font-display text-2xl text-[#17324D]">Nothing needs your attention</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#52616B]">No blocked attempts have been recorded. Your current family rules are holding steady.</p>
            </div>
          ) : (
            <section>
              <h2 className="mb-3 font-display text-2xl text-[#17324D]">Recent blocked attempts</h2>
              <ul className="divide-y divide-[#DCE7E5] border-y border-[#DCE7E5] bg-white">
                {events.map((event) => (
                  <li key={event._id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8E7E2] text-[#C65D4B]"><AlertTriangle className="h-4 w-4" /></span>
                      <div className="min-w-0"><p className="truncate font-semibold text-[#17324D]">{event.domain}</p><p className="mt-1 text-sm text-[#52616B]">{event.reason.replaceAll('_', ' ')}</p></div>
                    </div>
                    <time className="text-sm text-[#52616B]" dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </DashboardShell>
  );
}
