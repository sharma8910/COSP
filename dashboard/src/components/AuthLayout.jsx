import { Shield, Check } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle, heroTitle, heroDescription, features }) {
  return (
    <main className="min-h-screen bg-[#17324D] px-5 py-8 text-[#1F2933] sm:px-8 sm:py-12">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
        <section className="text-white">
          <div className="mb-12 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F6F68]"><Shield className="h-5 w-5" /></span>
            <div>
              <p className="font-display text-xl">SafeNest</p>
              <p className="text-xs text-[#BFD1D8]">Family safety, made calm</p>
            </div>
          </div>
          <p className="mb-4 text-sm font-semibold text-[#A9D8CD]">A steady hand for family life online</p>
          <h1 className="max-w-xl font-display text-5xl leading-[1.05] sm:text-6xl">{heroTitle}</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#DCE7E5]">{heroDescription}</p>
          <ul className="mt-8 space-y-4 border-t border-white/15 pt-7">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-[#DCE7E5]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A9D8CD] text-[#17324D]"><Check className="h-4 w-4" /></span>
                {feature}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-[#F4F1EA] p-6 shadow-[0_18px_50px_rgba(8,27,43,0.28)] sm:p-9">
          <div className="mb-8">
            <h2 className="font-display text-3xl text-[#17324D]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#52616B]">{subtitle}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
