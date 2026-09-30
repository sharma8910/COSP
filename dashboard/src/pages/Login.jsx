import { useState } from 'react';
import { useAuth } from '../useAuth';
import { apiFetch } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const inputClass = 'w-full border border-[#BFD1D8] bg-white py-3 pl-10 pr-4 text-[#1F2933] outline-none transition focus:border-[#2F6F68] focus:ring-4 focus:ring-[#2F6F68]/15';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();


  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to keep your family’s online world in view." heroTitle="Protection that feels reassuring." heroDescription="Set thoughtful boundaries, understand what needs attention, and give your family more room to explore safely." features={['Simple family profiles', 'Clear blocked-attempt history', 'Private by design']}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-semibold text-[#1F2933]">Email address
          <span className="relative mt-2 block"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#52616B]" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required /></span>
        </label>
        <label className="block text-sm font-semibold text-[#1F2933]">Password
          <span className="relative mt-2 block"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#52616B]" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className={`${inputClass} pr-12`} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-2.5 rounded p-1 text-[#52616B] hover:text-[#17324D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </span>
        </label>
        {error && <p role="alert" className="border-l-4 border-[#C65D4B] bg-[#F8E7E2] px-4 py-3 text-sm font-semibold text-[#8D3E32]">{error}</p>}
        <button type="submit" disabled={isLoading} className="w-full bg-[#2F6F68] px-5 py-3 font-semibold text-white transition hover:bg-[#245851] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2F6F68]/30 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-center text-sm text-[#52616B]">New to SafeNest? <Link to="/signup" className="font-semibold text-[#2F6F68] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]">Create an account</Link></p>
      </form>
    </AuthLayout>
  );
}
