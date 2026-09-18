import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Eye,
  EyeOff,
  Check,
  QrCode,
  ShieldCheck,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { Alert } from '../../components/common/Alert';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { GoogleAccountPickerModal } from '../../components/auth/GoogleAccountPickerModal';
import { registerUser, loginWithGoogle, clearAuthError } from '../../store/slices/authSlice';
import { isValidEmail, validatePassword } from '../../utils/validators';

/**
 * Modern Fincheck Banking Registration View
 * Ultra-clean split-card design matching Figma reference.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearAuthError());

    const fullName = name.trim() || username.trim();
    if (!fullName) {
      setFormError('Please enter your full legal name.');
      return;
    }

    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      setFormError(passValidation.message);
      return;
    }

    const result = await dispatch(registerUser({ name: fullName, email: email.trim(), password }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  const handleSelectGoogleAccount = async ({ email: gEmail, name: gName }) => {
    try {
      setFormError('');
      dispatch(clearAuthError());
      const result = await dispatch(
        loginWithGoogle({
          email: gEmail,
          name: gName,
        })
      );

      if (loginWithGoogle.fulfilled.match(result)) {
        setIsGoogleModalOpen(false);
        navigate('/', { replace: true });
      } else {
        setFormError(result.payload || 'Google registration failed');
      }
    } catch (err) {
      setFormError(err.message || 'Google registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#131417] flex items-center justify-center p-3 sm:p-6 md:p-8 font-sans select-none">
      {/* Outer Split Card Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl p-3 sm:p-4 border border-white/10 overflow-hidden flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[620px]">

        {/* Left Side: Vibrant Blue Gradient Showcase Panel */}
        <div className="w-full lg:w-[48%] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#38bdf8] text-white shadow-inner">
          {/* Subtle Ambient Decorative Glows */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-700/40 blur-3xl pointer-events-none" />

          {/* Top: Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-xs">
              <div className="w-3.5 h-3.5 rounded-sm border-2 border-white rotate-45" />
            </div>
            <span className="text-white font-bold tracking-wide text-sm font-sans">
              fincheck
            </span>
          </div>

          {/* Middle: Clean Tagline & Platform Info Highlights */}
          <div className="relative z-10 my-auto py-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-medium shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Fincheck Digital Banking 2.0</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight mb-2">
                Start your Journey
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 font-normal leading-relaxed max-w-sm">
                Next-generation banking with instant zero-fee UPI, real-time double-entry ledger, and a ₹10,000 opening liquid reserve.
              </p>
            </div>

            {/* Small Info About The Platform */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-left">
                <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-semibold mb-1">
                  <QrCode className="w-3.5 h-3.5 shrink-0" />
                  <span>UPI & QR</span>
                </div>
                <p className="text-[10px] text-blue-100/80 leading-tight">Instant scan & pay with 0% transaction fees</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-left">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Ledger</span>
                </div>
                <p className="text-[10px] text-blue-100/80 leading-tight">Immutable audit trail with live balances</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-left">
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold mb-1">
                  <Wallet className="w-3.5 h-3.5 shrink-0" />
                  <span>₹10,000</span>
                </div>
                <p className="text-[10px] text-blue-100/80 leading-tight">Instant liquid reserve upon registration</p>
              </div>
            </div>
          </div>

          {/* Bottom: 3 Core Step Cards */}
          <div className="relative z-10 grid grid-cols-3 gap-2.5">
            {/* Step 1: Active Solid White Card */}
            <div className="bg-white text-slate-900 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between h-28 transition-transform duration-200">
              <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center">
                1
              </div>
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                Register your account
              </p>
            </div>

            {/* Step 2: Frosted Glass Card */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-white flex flex-col justify-between h-28">
              <div className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-medium flex items-center justify-center">
                2
              </div>
              <p className="text-xs font-medium text-white/90 leading-tight">
                Set up your profile information
              </p>
            </div>

            {/* Step 3: Frosted Glass Card */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-white flex flex-col justify-between h-28">
              <div className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-medium flex items-center justify-center">
                3
              </div>
              <p className="text-xs font-medium text-white/90 leading-tight">
                Verify your identity through passport/ID
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Banking Registration Form */}
        <div className="w-full lg:w-[52%] px-4 sm:px-8 md:px-12 py-6 sm:py-8 flex flex-col justify-center max-w-[420px] mx-auto">
          {/* Header Title: Clean "Join Us" without verbose subtitle */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Join Us
            </h2>
          </div>

          {(formError || error) && (
            <div className="mb-4">
              <Alert variant="danger" message={formError || error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Juliette Karapetyan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-sans"
              />
            </div>

            {/* Two Column: Email & Username */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-sans"
                  />
                  {isValidEmail(email) && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="julietux"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-sans"
                  />
                  {username.length >= 3 && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full pl-4 pr-11 py-2.5 bg-[#f8f9fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                At least 6 characters with letters, numbers, and symbols.
              </p>
            </div>

            {/* Continue Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3.5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#2563eb] hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>

          {/* Or Divider */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-medium">
                Or
              </span>
            </div>
          </div>

          {/* Real Google Register with Official Google Identity Services SDK */}
          <GoogleAuthButton
            mode="register"
            redirectTo="/"
            onError={(msg) => setFormError(msg)}
          />

          {/* Clean Legal Footer */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-5 leading-relaxed">
            By signing up I confirm that I have read and agree to the Fincheck{' '}
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>{' '}
            and{' '}
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Terms of Service</span>.
          </p>
        </div>
      </div>

      {/* Direct Google Account Chooser Modal */}
      <GoogleAccountPickerModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        loading={loading}
        error={formError}
      />
    </div>
  );
}

export default RegisterPage;
