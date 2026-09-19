import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return setError('Please fill in all fields.');
    }

    try {
      setLoading(true);
      await login(form);
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue analyzing your data."
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="input-dark pl-11"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="input-dark pl-11 pr-11"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Log in <FiArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-sm text-slate-400 mt-6 text-center lg:text-left">
        New here?{' '}
        <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;