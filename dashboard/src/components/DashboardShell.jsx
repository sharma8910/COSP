import { Shield, Activity as ActivityIcon, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function DashboardShell({ children, title, description, action }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1F2933]">
      <header className="border-b border-[#DCE7E5] bg-[#17324D] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9D8CD]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2F6F68]">
              <Shield className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg leading-none">SafeNest</span>
              <span className="mt-1 block text-xs text-[#BFD1D8]">Family safety, made calm</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm" aria-label="Main navigation">
            <Link to="/" className={`rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9D8CD] ${location.pathname === '/' ? 'bg-white/12 text-white' : 'text-[#BFD1D8] hover:bg-white/10 hover:text-white'}`}>
              <Users className="mr-2 inline h-4 w-4" /> Children
            </Link>
            <Link to="/activity" className={`rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9D8CD] ${location.pathname === '/activity' ? 'bg-white/12 text-white' : 'text-[#BFD1D8] hover:bg-white/10 hover:text-white'}`}>
              <ActivityIcon className="mr-2 inline h-4 w-4" /> Activity
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-display text-4xl leading-tight text-[#17324D] sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#52616B]">{description}</p>
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
