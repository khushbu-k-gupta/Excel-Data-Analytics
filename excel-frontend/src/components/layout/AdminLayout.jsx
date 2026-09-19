import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { FiGrid, FiUsers, FiFolder, FiLogOut, FiMenu, FiX, FiBarChart2, FiShield } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/admin', name: 'Overview', icon: FiGrid, end: true },
  { to: '/admin/users', name: 'Users', icon: FiUsers },
  { to: '/admin/files', name: 'All Files', icon: FiFolder },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0b0d12]">

      {/* ===== Mobile top bar ===== */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0b0d12]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <Link to="/admin" className="flex items-center gap-2">
          <FiShield className="text-emerald-400" size={20} />
          <span className="font-display font-bold">Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300">
          {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* ===== Sidebar ===== */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[#0d1017] border-r border-white/[0.06]
          flex flex-col transition-transform duration-300
          lg:translate-x-0 pt-16 lg:pt-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="hidden lg:flex items-center gap-2.5 px-6 py-6 border-b border-white/[0.06]">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FiShield size={17} />
          </span>
          <div>
            <p className="font-display font-bold leading-tight">Admin Panel</p>
            <p className="text-[10px] text-emerald-400">ExcelAnalytics</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, name, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`
              }
            >
              <Icon size={17} /> {name}
            </NavLink>
          ))}

          {/* Back to app */}
          <div className="pt-4 mt-4 border-t border-white/[0.06]">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
            >
              <FiBarChart2 size={17} /> Back to App
            </NavLink>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <FiShield size={10} /> {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 rounded-lg p-2 hover:bg-red-500/10 transition-colors"
              aria-label="Logout"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Content ===== */}
      <main className="lg:ml-64 px-6 py-8 pt-20 lg:pt-8"><Outlet/></main>
    </div>
  );
};

export default AdminLayout;