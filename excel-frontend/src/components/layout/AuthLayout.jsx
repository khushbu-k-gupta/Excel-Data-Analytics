import React from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiArrowLeft, FiCheck } from 'react-icons/fi';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ============ LEFT: Branding (desktop only) ============ */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[#0d1017] border-r border-white/[0.06] p-12">
        {/* Decorations */}
        <div className="grid-pattern absolute inset-0 opacity-70" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 group w-fit">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 transition-shadow group-hover:shadow-[0_0_20px_var(--accent-glow)]">
            <FiBarChart2 size={18} />
          </span>
          <span className="font-display font-bold text-xl tracking-tight">
            Excel<span className="text-emerald-400">Analytics</span>
          </span>
        </Link>

        {/* Marketing copy */}
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Your data, finally{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              speaking clearly.
            </span>
          </h2>

          <ul className="mt-8 space-y-4">
            {[
              'Upload Excel & CSV files instantly',
              'Auto-generated interactive charts',
              'Secure JWT authentication',
              'Export insights in one click',
            ].map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <FiCheck size={11} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} ExcelAnalytics
        </p>
      </div>

      {/* ============ RIGHT: Form ============ */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">

        {/* Mobile logo + back link */}
        <div className="flex items-center justify-between mb-10 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FiBarChart2 size={18} />
            </span>
            <span className="font-display font-bold text-lg">
              Excel<span className="text-emerald-400">Analytics</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition">
            <FiArrowLeft size={14} /> Home
          </Link>
        </div>

        {/* Desktop back link */}
        <Link to="/" className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition mb-8 w-fit">
          <FiArrowLeft size={14} /> Back to home
        </Link>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-slate-400 mt-2">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;