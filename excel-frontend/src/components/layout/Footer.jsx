import React from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  const year = new Date().getFullYear();

  const productLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Features', path: '/#features' },
  ];

  const accountLinks = [
    { name: 'Login', path: '/login' },
    { name: 'Get Started', path: '/register' },
  ];

  const socials = [
    { icon: FiGithub, href: 'https://github.com/yourusername', label: 'GitHub' },
    { icon: FiLinkedin, href: 'https://linkedin.com/in/yourusername', label: 'LinkedIn' },
    { icon: FiTwitter, href: 'https://x.com/yourusername', label: 'Twitter' },
    { icon: FiMail, href: 'mailto:hello@yourapp.com', label: 'Email' },
  ];

  return (
    <footer className="relative bg-[#0b0d12] border-t border-white/[0.06]">
      {/* Emerald glow line — premium touch ✨ */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 transition-shadow group-hover:shadow-[0_0_20px_var(--accent-glow)]">
                <FiBarChart2 size={18} />
              </span>
              <span className="font-display font-bold text-xl tracking-tight">
                Excel<span className="text-emerald-400">Analytics</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Upload, visualize, and understand your data — 
              no spreadsheets expertise required.
            </p>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.08] text-slate-400
                             hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]
                             transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Product</h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Account</h3>
            <ul className="mt-4 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack — recruiters ke liye 👀 */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Built With</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>React + Vite</li>
              <li>Tailwind CSS</li>
              <li>Node.js + Express</li>
              <li>Chart.js / Recharts</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {year} ExcelAnalytics. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Made with <span className="text-emerald-400">♥</span> by Your Name
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;