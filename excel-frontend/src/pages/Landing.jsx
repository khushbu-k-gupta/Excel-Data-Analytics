import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUpload, FiBarChart2, FiPieChart, FiLock, FiDownload, FiZap,
  FiArrowRight, FiTrendingUp, FiFileText,
} from 'react-icons/fi';

const Landing = () => {
  const token = localStorage.getItem('token');

  // Footer se /#features link aaye toh scroll fix
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const bars = [40, 65, 45, 80, 55, 92, 68, 75, 50, 88, 62, 78];

  const features = [
    { icon: FiUpload, title: 'Instant Upload', desc: 'Drag & drop your Excel or CSV files. Parsed and ready in seconds — no setup, no plugins.' },
    { icon: FiBarChart2, title: 'Auto Chart Generation', desc: 'Columns detected automatically. Bar, line, and pie charts created from your data instantly.' },
    { icon: FiPieChart, title: 'Interactive Dashboards', desc: 'Filter, sort, and explore your data with smooth, responsive visualizations.' },
    { icon: FiLock, title: 'Secure by Default', desc: 'JWT authentication keeps your files private. Your data stays yours — always.' },
    { icon: FiDownload, title: 'Export Anywhere', desc: 'Download charts as images or export cleaned data for reports and presentations.' },
    { icon: FiZap, title: 'Blazing Fast', desc: 'Built on React + Vite with optimized rendering — even large datasets feel snappy.' },
  ];

  const steps = [
    { number: '01', title: 'Upload your file', desc: 'Drop any .xlsx or .csv file. We handle the parsing, columns, and types for you.' },
    { number: '02', title: 'We analyze it', desc: 'Our engine scans your data and picks the best chart type for every column.' },
    { number: '03', title: 'Get insights', desc: 'View interactive dashboards, spot trends, and export findings in one click.' },
  ];

  const stats = [
    { value: '3', label: 'Steps to insights' },
    { value: '5+', label: 'Auto chart types' },
    { value: '1', label: 'Click to upload' },
    { value: '0', label: 'Setup required' },
  ];

  return (
    <div className="relative overflow-hidden">

      {/* ============================ HERO ============================ */}
      <section className="grid-pattern relative min-h-screen flex items-center pt-28 pb-20">
        {/* Emerald glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">

            {/* Badge */}
            <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free forever — no credit card required
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mt-6" style={{ animationDelay: '0.1s' }}>
              Turn spreadsheets into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                insights
              </span>{' '}
              in seconds
            </h1>

            <p className="animate-fade-up mt-6 text-slate-400 text-lg leading-relaxed max-w-xl mx-auto" style={{ animationDelay: '0.2s' }}>
              Upload your Excel files and watch them transform into interactive charts
              and dashboards. No formulas, no pivot tables, no headache.
            </p>

            {/* CTAs — token ke hisaab se adapt */}
            <div className="animate-fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.3s' }}>
              {token ? (
                <Link to="/dashboard" className="btn-accent flex items-center gap-2">
                  Go to Dashboard <FiArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-accent flex items-center gap-2">
                    Start Analyzing Free <FiArrowRight size={18} />
                  </Link>
                  <a href="#how-it-works" className="btn-ghost">See how it works</a>
                </>
              )}
            </div>
          </div>

          {/* ------- Dashboard mockup (pure CSS!) ------- */}
          <div className="animate-fade-up mt-16 max-w-4xl mx-auto relative" style={{ animationDelay: '0.45s' }}>
            <div className="card p-6 shadow-2xl shadow-black/50">

              {/* Fake window bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs text-slate-500 font-mono">sales_2024.xlsx</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5">
                {[
                  { label: 'Rows', value: '12,480', icon: FiFileText },
                  { label: 'Columns', value: '8', icon: FiBarChart2 },
                  { label: 'Charts', value: '6', icon: FiPieChart },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Icon size={13} className="text-emerald-400" /> {label}
                    </div>
                    <p className="font-display text-lg md:text-xl font-bold mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium text-slate-400">Monthly Sales — Auto Generated</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live preview
                  </span>
                </div>
                <div className="flex items-end gap-1.5 md:gap-2 h-36 md:h-40">
                  {bars.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center h-full gap-2 group">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-600/50 to-emerald-400/80 group-hover:from-emerald-500/80 group-hover:to-teal-300 transition-all duration-300"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[8px] md:text-[10px] text-slate-500">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge — desktop only */}
            <div className="hidden md:flex absolute -top-6 -right-10 card px-4 py-3 items-center gap-3 border-emerald-500/20 shadow-xl shadow-black/40">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FiTrendingUp size={16} />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Revenue growth</p>
                <p className="text-sm font-semibold text-emerald-400">+24.8% this month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-emerald-400">{value}</p>
              <p className="text-xs md:text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================== FEATURES ========================== */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Features</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Everything you need to <span className="text-emerald-400">understand</span> your data
            </h2>
            <p className="text-slate-400 mt-4">
              Built for people who love data but hate spreadsheet gymnastics.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 group hover:border-emerald-500/30 transition-all duration-300">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:shadow-[0_0_20px_var(--accent-glow)] transition-shadow">
                  <Icon size={20} />
                </span>
                <h3 className="font-display text-lg font-semibold mt-4">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== HOW IT WORKS ======================== */}
      <section id="how-it-works" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">How it works</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-3">
              From file to insights in <span className="text-emerald-400">3 steps</span>
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-5 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-[60px] left-[18%] right-[18%] h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0" />

            {steps.map((step) => (
              <div key={step.number} className="card relative text-center p-8">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 font-display text-lg font-bold text-emerald-400">
                  {step.number}
                </span>
                <h3 className="font-display text-lg font-semibold mt-5">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== FINAL CTA ========================== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card relative overflow-hidden p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.07] to-transparent pointer-events-none" />
            <div className="grid-pattern absolute inset-0 opacity-60 pointer-events-none" />

            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                Ready to see your data <span className="text-emerald-400">differently?</span>
              </h2>
              <p className="text-slate-400 mt-4 max-w-md mx-auto">
                Upload your first spreadsheet and get charts in under a minute.
              </p>
              <div className="mt-8">
                {token ? (
                  <Link to="/dashboard" className="btn-accent inline-flex items-center gap-2">
                    Go to Dashboard <FiArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to="/register" className="btn-accent inline-flex items-center gap-2">
                    Get Started — It's Free <FiArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;