import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';
import { isValidEmail } from '../../utils/validators';

/**
 * Clean & Simple Login Page
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearAuthError());

    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  const handleDemoFill = () => {
    setEmail('bishaldeveloperog@gmail.com');
    setPassword('secret123');
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] dark:bg-[#0B0F17] flex transition-colors duration-200">
      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <span className="font-bold text-sm tracking-tighter text-emerald-400 dark:text-white">A</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight font-mono">
            AURA BANK
          </span>
        </div>

        {/* Form Container */}
        <div className="my-auto py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your email and password to access your accounts.
            </p>
          </div>

          {(formError || error) && (
            <div className="mb-5">
              <Alert variant="danger" message={formError || error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Quick test account?</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs font-semibold text-slate-900 dark:text-emerald-400 hover:underline focus:outline-none"
            >
              Fill Demo Login
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-6 border-t border-slate-200/60 dark:border-slate-800">
          <span>&copy; {new Date().getFullYear()} Aura Bank</span>
          <span>Simple & Secure Banking</span>
        </div>
      </div>

      {/* Brand Showcase Panel (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 flex justify-end">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            ● Modern Banking
          </span>
        </div>

        <div className="relative z-10 max-w-md my-auto">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight text-white mb-4">
            Simple, transparent banking for everyone.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Manage multiple accounts, send money instantly to anyone, and keep track of every rupee with a clean visual ledger.
          </p>

          <div className="space-y-3 font-sans text-xs">
            {[
              'Instant account opening in Indian Rupee (INR)',
              'Zero hidden fees and real-time transaction updates',
              'Virtual debit card with instant copy and security toggle',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          Aura Bank Digital System
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
