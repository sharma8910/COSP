import { useState, useEffect } from 'react';
import { CheckCircle2, Copy, Laptop, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import DashboardShell from '../components/DashboardShell';

const inputClass = 'w-full border border-[#BFD1D8] bg-white px-4 py-3 text-sm text-[#1F2933] outline-none transition focus:border-[#2F6F68] focus:ring-4 focus:ring-[#2F6F68]/15';

export default function ChildDetail() {
  const { childId } = useParams();
  const [devices, setDevices] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newType, setNewType] = useState('blocklist');
  const [newToken, setNewToken] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');

  async function loadData() {
    try {
      const [deviceData, policyData] = await Promise.all([apiFetch(`/api/children/${childId}/devices`), apiFetch(`/api/policies?childId=${childId}`)]);
      setDevices(deviceData.devices);
      setPolicies(policyData.policies);
    } catch (err) { setError(err.message); }
  }
  useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch(`/api/children/${childId}/devices`), apiFetch(`/api/policies?childId=${childId}`)])
      .then(([deviceData, policyData]) => {
        if (cancelled) return;
        setDevices(deviceData.devices);
        setPolicies(policyData.policies);
      })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [childId]);

  async function handleAddPolicy(event) {
    event.preventDefault();
    try { await apiFetch('/api/policies', { method: 'POST', body: JSON.stringify({ childId, type: newType, domain: newDomain }) }); setNewDomain(''); loadData(); }
    catch (err) { setError(err.message); }
  }
  async function handleRegisterDevice(event) {
    event.preventDefault();
    try { const data = await apiFetch(`/api/children/${childId}/devices`, { method: 'POST', body: JSON.stringify({ deviceName: newDeviceName }) }); setNewToken(data.deviceToken); setNewDeviceName(''); loadData(); }
    catch (err) { setError(err.message); }
  }
  async function handleCopyToken() {
    try { await navigator.clipboard.writeText(newToken); }
    catch { setError('Unable to copy the token. Please copy it manually.'); }
  }
  async function handleDeletePolicy(policyId) {
    try { await apiFetch(`/api/policies/${policyId}`, { method: 'DELETE' }); loadData(); }
    catch (err) { setError(err.message); }
  }

  return (
    <DashboardShell title="Child profile" description="Devices and browsing boundaries for this family member." action={<Link to="/" className="text-sm font-semibold text-[#2F6F68] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]">Back to children</Link>}>
      {error && <p role="alert" className="mb-6 border-l-4 border-[#C65D4B] bg-[#F8E7E2] px-4 py-3 text-sm font-semibold text-[#8D3E32]">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-[#BFD1D8] bg-white">
          <div className="flex items-center justify-between border-b border-[#DCE7E5] px-5 py-4"><div><h2 className="font-display text-2xl text-[#17324D]">Devices</h2><p className="mt-1 text-sm text-[#52616B]">{devices.length} registered</p></div><Laptop className="h-6 w-6 text-[#2F6F68]" /></div>
          <ul className="divide-y divide-[#DCE7E5]">
            {devices.map((device) => <li key={device.id} className="flex items-center justify-between gap-3 px-5 py-4"><span className="font-semibold text-[#17324D]">{device.deviceName}</span><span className="inline-flex items-center gap-1.5 text-sm text-[#2F6F68]"><CheckCircle2 className="h-4 w-4" /> {device.status}</span></li>)}
          </ul>
          {devices.length === 0 && <p className="px-5 py-8 text-sm text-[#52616B]">No devices yet. Register the first one below when it’s ready.</p>}
          <form onSubmit={handleRegisterDevice} className="border-t border-[#DCE7E5] bg-[#F8F7F3] p-5">
            <label className="mb-2 block text-sm font-semibold text-[#17324D]" htmlFor="device-name">Register a device</label>
            <div className="flex flex-col gap-3 sm:flex-row"><input id="device-name" value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} placeholder="Child’s laptop" className={inputClass} required /><button type="submit" className="shrink-0 bg-[#17324D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#234764] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17324D]/25">Register device</button></div>
          </form>
          {newToken && <div className="border-t-4 border-[#C18A2A] bg-[#FFF4D6] p-5 text-[#5D4614]"><p className="font-semibold">Handle with care</p><p className="mt-1 text-sm leading-6">Copy this device token now. It will not be shown again.</p><div className="mt-3 flex items-start gap-3 border border-[#D9B75C] bg-[#FFF9E9] p-3"><code className="min-w-0 flex-1 break-all text-xs">{newToken}</code><button type="button" onClick={handleCopyToken} className="inline-flex shrink-0 items-center gap-1 border border-[#9A731C] px-3 py-1.5 text-xs font-semibold hover:bg-[#FBE9AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A731C]"><Copy className="h-3.5 w-3.5" /> Copy</button></div></div>}
        </section>
        <section className="border border-[#BFD1D8] bg-white">
          <div className="flex items-center justify-between border-b border-[#DCE7E5] px-5 py-4"><div><h2 className="font-display text-2xl text-[#17324D]">Browsing rules</h2><p className="mt-1 text-sm text-[#52616B]">{policies.length} active rules</p></div><ShieldCheck className="h-6 w-6 text-[#2F6F68]" /></div>
          <ul className="divide-y divide-[#DCE7E5]">
            {policies.map((policy) => <li key={policy.id} className="flex items-center justify-between gap-3 px-5 py-4"><span className="min-w-0 truncate font-semibold text-[#17324D]">{policy.domain}</span><span className="flex shrink-0 items-center gap-2"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${policy.type === 'blocklist' ? 'text-[#C65D4B]' : 'text-[#2F6F68]'}`}>{policy.type === 'blocklist' ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}{policy.type === 'blocklist' ? 'Blocked' : 'Allowed'}</span><button onClick={() => handleDeletePolicy(policy.id)} className="text-xs font-semibold text-[#8D3E32] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D4B]">Remove</button></span></li>)}
          </ul>
          {policies.length === 0 && <p className="px-5 py-8 text-sm text-[#52616B]">No rules yet. With no blocklist, sites remain allowed by default.</p>}
          <form onSubmit={handleAddPolicy} className="border-t border-[#DCE7E5] bg-[#F8F7F3] p-5"><label className="mb-2 block text-sm font-semibold text-[#17324D]" htmlFor="domain">Add a browsing rule</label><div className="grid gap-3 sm:grid-cols-[130px_1fr]"><select value={newType} onChange={(e) => setNewType(e.target.value)} className={inputClass}><option value="blocklist">Block</option><option value="allowlist">Allow</option></select><input id="domain" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="example.com" className={inputClass} required /></div><button type="submit" className="mt-3 w-full bg-[#2F6F68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245851] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2F6F68]/30">Save rule</button></form>
        </section>
      </div>
    </DashboardShell>
  );
}
