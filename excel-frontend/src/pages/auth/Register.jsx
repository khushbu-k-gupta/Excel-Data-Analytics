import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register, token } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (token) return <Navigate to="/dashboard" replace />;

  const passwordStrength = (pwd) => {
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    return score; 
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever. Start visualizing your data in minutes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="relative">
          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            className="input-dark pl-11"
            autoComplete="name"
          />
        </div>

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

        {/* Password + strength meter */}
        <div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input-dark pl-11 pr-11"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          {/* Strength bar */}
          {form.password && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength ? strengthColors[strength] : 'bg-slate-700/60'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 w-12 text-right">
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="input-dark pl-11"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account <FiArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-sm text-slate-400 mt-6 text-center lg:text-left">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;