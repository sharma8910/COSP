import { useState, useEffect } from 'react';
import { Baby, Check, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../useAuth';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';

const ageGroupLabels = { 'under-8': 'Under 8 years', '8-12': '8–12 years', '13-15': '13–15 years', '16-17': '16–17 years' };
const inputClass = 'w-full border border-[#BFD1D8] bg-white px-4 py-3 text-sm text-[#1F2933] outline-none transition focus:border-[#2F6F68] focus:ring-4 focus:ring-[#2F6F68]/15';


export default function ChildrenList() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [ageGroup, setAgeGroup] = useState('under-8');
  const { logout } = useAuth();
  const navigate = useNavigate();
  async function loadChildren() {
    try { setChildren((await apiFetch('/api/children')).children); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/children')
      .then((data) => { if (!cancelled) setChildren(data.children); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleAddChild(event) {
    event.preventDefault();
    try {
      await apiFetch('/api/children', { method: 'POST', body: JSON.stringify({ name: newName, ageGroup }) });
      setNewName('');
      setAgeGroup('under-8');
      loadChildren();
    } catch (err) { setError(err.message); }
  }

  async function handleLogout() {
    setError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <DashboardShell title="Your family" description="Loading your protected family circle…"><p className="text-[#52616B]">One moment…</p></DashboardShell>;

  return (
    <DashboardShell title="Your family" description="Keep profiles, devices, and online boundaries in one calm place." action={<Link to="/activity" className="font-semibold text-[#2F6F68] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]">View blocked activity</Link>}>
      {error && <p role="alert" className="mb-6 border-l-4 border-[#C65D4B] bg-[#F8E7E2] px-4 py-3 text-sm font-semibold text-[#8D3E32]">{error}</p>}
      <button type="button" onClick={handleLogout} className="mb-6 text-sm font-semibold text-[#8D3E32] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D4B]">
        Log out
      </button>
      <section className="border border-[#BFD1D8] bg-white">
        <div className="flex items-center justify-between border-b border-[#DCE7E5] px-5 py-4 sm:px-6">
          <div><h2 className="font-display text-2xl text-[#17324D]">Family profiles</h2><p className="mt-1 text-sm text-[#52616B]">{children.length} {children.length === 1 ? 'profile' : 'profiles'} protected</p></div>
          <Baby className="h-6 w-6 text-[#2F6F68]" />
        </div>
        <ul className="divide-y divide-[#DCE7E5]">
          {children.map((child) => (
            <li key={child.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCE7E5] font-display text-xl text-[#17324D]">{child.name?.charAt(0).toUpperCase()}</span>
                <div><p className="font-semibold text-[#17324D]">{child.name}</p><p className="mt-1 flex items-center gap-1 text-sm text-[#2F6F68]"><Check className="h-4 w-4" /> {ageGroupLabels[child.ageGroup] || 'Age group pending'}</p></div>
              </div>
              <Link to={`/children/${child.id}`} className="text-sm font-semibold text-[#2F6F68] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]">Manage profile</Link>
            </li>
          ))}
        </ul>
        {children.length === 0 && <div className="border-b border-[#DCE7E5] px-6 py-10 text-center"><Check className="mx-auto h-9 w-9 text-[#2F6F68]" /><p className="mt-3 font-display text-xl text-[#17324D]">Your family circle is ready</p><p className="mt-1 text-sm text-[#52616B]">Add a profile below when you’re ready. Nothing is missing.</p></div>}
        <form onSubmit={handleAddChild} className="grid gap-3 bg-[#F8F7F3] p-5 sm:grid-cols-[1fr_190px_auto] sm:p-6">
          <label className="sr-only" htmlFor="child-name">Child’s name</label>
          <input id="child-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add a child’s name" className={inputClass} required />
          <label className="sr-only" htmlFor="age-group">Age group</label>
          <select id="age-group" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputClass}>{Object.entries(ageGroupLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <button type="submit" className="flex items-center justify-center gap-2 bg-[#2F6F68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245851] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2F6F68]/30"><Plus className="h-4 w-4" /> Add profile</button>
          
        </form>
        
      </section>
      
    </DashboardShell>
  );
}
