import { useState } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const inputClass = 'w-full border border-[#BFD1D8] bg-white py-3 pl-10 pr-4 text-[#1F2933] outline-none transition focus:border-[#2F6F68] focus:ring-4 focus:ring-[#2F6F68]/15';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      setUser(data.user);
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start building a safer online space for your family." heroTitle="A calmer way to care online." heroDescription="SafeNest gives parents a clear, private place to set boundaries and understand what is happening across family devices." features={['Thoughtful setup in minutes', 'Clear controls for every child', 'No noisy alerts or guesswork']}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold text-[#1F2933]">Your name<span className="relative mt-2 block"><User className="absolute left-3 top-3.5 h-4 w-4 text-[#52616B]" /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} required /></span></label>
        <label className="block text-sm font-semibold text-[#1F2933]">Email address<span className="relative mt-2 block"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#52616B]" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required /></span></label>
        <label className="block text-sm font-semibold text-[#1F2933]">Password<span className="relative mt-2 block"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#52616B]" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={`${inputClass} pr-12`} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-2.5 rounded p-1 text-[#52616B] hover:text-[#17324D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>
        <label className="block text-sm font-semibold text-[#1F2933]">Confirm password<span className="relative mt-2 block"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#52616B]" /><input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" className={`${inputClass} pr-12`} required /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-2.5 rounded p-1 text-[#52616B] hover:text-[#17324D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>
        {error && <p role="alert" className="border-l-4 border-[#C65D4B] bg-[#F8E7E2] px-4 py-3 text-sm font-semibold text-[#8D3E32]">{error}</p>}
        <button type="submit" disabled={isLoading} className="w-full bg-[#2F6F68] px-5 py-3 font-semibold text-white transition hover:bg-[#245851] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2F6F68]/30 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'Creating account…' : 'Create account'}</button>
        <p className="text-center text-sm text-[#52616B]">Already have an account? <Link to="/login" className="font-semibold text-[#2F6F68] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]">Sign in</Link></p>
      </form>
    </AuthLayout>
  );
}
