import React, { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import {
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiMenu,
  FiX,
  FiBarChart2,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { API_BASE } from "../../constants";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { token, logout, user } = useAuth();

  const handleLogout = () => {
    logout(); // context clean
    navigate("/login");
    setIsOpen(false);
  };

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Charts", path: "/charts" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#0b0d12]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:shadow-[0_0_20px_var(--accent-glow)] transition-shadow">
            <FiBarChart2 size={18} />
          </span>
          <span className="font-display font-bold text-xl tracking-tight">
            Excel<span className="text-emerald-400">Analytics</span>
          </span>
        </Link>

        {/* Desktop links */}
        {token && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.06] text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-emerald-400 hover:bg-emerald-500/10"
                  }`
                }
              >
                <FiShield size={14} /> Admin
              </NavLink>
            )}
          </div>
        )}

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-accent">
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 rounded-full border border-white/[0.08] hover:border-emerald-500/30 pl-1 pr-3 py-1 transition-colors"
              >
                {user?.avatar ? (
                  <img
                     src={`${API_BASE}${user.avatar}`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase">
                    {user?.name?.charAt(0) || "?"}
                  </span>
                )}
                <span className="text-sm text-slate-300 max-w-[100px] truncate">
                  {user?.name}
                </span>
              </button>

              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-44 card p-1.5 animate-fade-up">
                    <NavLink
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/[0.04] transition-colors"
                    >
                      <FiUser size={15} /> Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-300 hover:text-white transition"
          aria-label="Toggle menu"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 pb-6 pt-2 flex flex-col gap-2 border-t border-white/[0.06]">
          {token && user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-emerald-400 hover:bg-emerald-500/10"
                }`
              }
            >
              <FiShield size={15} /> Admin Panel
            </NavLink>
          )}
          {!token ? (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="btn-ghost text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="btn-accent text-center"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="btn-ghost mt-2 flex items-center justify-center gap-2"
            >
              <FiLogOut size={18} /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
