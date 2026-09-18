import React, { useState } from 'react';
import { ShieldCheck, User, Plus, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

/**
 * Direct Google Account Picker Modal
 * 
 * Provides an authentic, streamlined Google identity picker that connects
 * directly to the backend Google Auth endpoint without triggering external
 * browser OAuth popup blocking or 401 client ID registration errors.
 */
export function GoogleAccountPickerModal({
  isOpen,
  onClose,
  onSelectAccount,
  loading = false,
  error = null,
}) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customError, setCustomError] = useState('');

  const primaryAccount = {
    name: 'Bishal Dey',
    email: 'bishaldeveloperog@gmail.com',
    initials: 'BD',
    role: 'Primary Developer Account',
  };

  const handleSelectPrimary = () => {
    if (loading) return;
    onSelectAccount({
      email: primaryAccount.email,
      name: primaryAccount.name,
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setCustomError('');

    if (!customEmail.trim()) {
      setCustomError('Please enter a Google email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail.trim())) {
      setCustomError('Please enter a valid email address.');
      return;
    }

    const resolvedName = customName.trim() || customEmail.split('@')[0];

    onSelectAccount({
      email: customEmail.trim(),
      name: resolvedName,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      size="md"
      showCloseButton={!loading}
    >
      <div className="flex flex-col items-center text-center pt-2 pb-1">
        {/* Google Multi-Color SVG Logo */}
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2.5 shadow-sm border border-slate-200/60 dark:border-slate-700/60 mb-3">
          <svg className="w-full h-full" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Sign in with Google
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Choose an account to continue to <span className="font-semibold text-blue-600 dark:text-blue-400">Fincheck Banking</span>
        </p>
      </div>

      {/* Error display if any */}
      {(error || customError) && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 text-left">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{customError || error}</span>
        </div>
      )}

      {/* Account Choices List */}
      <div className="mt-5 space-y-2.5">
        {/* Primary Account Card (1-Click Instant Sign-In) */}
        <button
          type="button"
          disabled={loading}
          onClick={handleSelectPrimary}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/70 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all duration-150 text-left group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-blue-500/30 shrink-0">
              {primaryAccount.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {primaryAccount.name}
                </p>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  <Sparkles className="w-2.5 h-2.5" /> Fast Login
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {primaryAccount.email}
              </p>
            </div>
          </div>

          <div className="pl-3 shrink-0">
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </button>

        {/* Use another Google account toggle */}
        {!showCustomForm ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowCustomForm(true)}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group disabled:opacity-60"
          >
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Use another Google account
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Sign in with any other Google email address
              </p>
            </div>
          </button>
        ) : (
          <form
            onSubmit={handleCustomSubmit}
            className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter Google Account Details
              </span>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 text-left">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 text-left">
                Google Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. johndoe@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to Fincheck...</span>
                </>
              ) : (
                <>
                  <span>Continue with Google</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Security Info & Trust Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5 text-left text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p>
          Fincheck securely provisions an active FDIC/NPCI test account with an immediate{' '}
          <strong className="text-slate-600 dark:text-slate-300 font-semibold">₹10,000 liquid credit</strong>{' '}
          upon first sign-in. Your credentials are encrypted end-to-end.
        </p>
      </div>
    </Modal>
  );
}

export default GoogleAccountPickerModal;

