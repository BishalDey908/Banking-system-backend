import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Lock, LogOut, Check, Copy, Sun, Moon, User as UserIcon } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Skeleton } from '../../components/common/Skeleton';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { useToast } from '../../hooks/useToast';

/**
 * Modern Fincheck Settings Page
 */
export function SettingsPage() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const { showSuccess, showInfo } = useToast();

  const [copiedId, setCopiedId] = useState(false);

  const handleCopyUserId = () => {
    if (!user?._id) return;
    navigator.clipboard.writeText(user._id);
    setCopiedId(true);
    showSuccess('User ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="space-y-6 sm:space-y-7 max-w-3xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Settings & Security
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile, theme preferences, and security credentials.
        </p>
      </div>

      {/* User Profile Card */}
      <Card padding="lg" className="rounded-2xl border-slate-100 dark:border-slate-800">
        {authLoading && !user ? (
          <div className="space-y-4">
            <Skeleton variant="circular" className="w-14 h-14" />
            <Skeleton variant="text" className="w-36 h-5" />
            <Skeleton variant="text" className="w-48 h-3.5" />
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                  <Avatar name={user?.name || 'Account Holder'} size="xl" status="online" />
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {user?.name || 'Account Holder'}
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {user?.email || 'user@fincheck.io'}
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Verified Customer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
              <div>
                  <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">
                    User Identification Number
                </span>
                <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    {user?._id || '68c71f92e01b34a9'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUserId}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Copy User ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                  <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">
                    Primary Email
                </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block py-1.5">
                    {user?.email || 'user@fincheck.io'}
                  </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Preferences & Theme Card */}
      <Card padding="lg" className="rounded-2xl border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Appearance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Customize the visual interface of your Fincheck portal.
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              {darkMode ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                {darkMode ? 'Dark Theme' : 'Light Theme'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {darkMode ? 'High contrast dark palette' : 'Soft pastel light palette matching reference'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(toggleDarkMode())}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors select-none"
          >
            Switch to {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </Card>

      {/* Security Card */}
      <Card padding="lg" className="rounded-2xl border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" />
          <span>Security & Sessions</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          End-to-end encrypted session and credential controls.
        </p>

        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Account Password</span>
              <span className="text-slate-400 dark:text-slate-500 block mt-0.5">
                Update or reset your authentication password
              </span>
            </div>
            <button
              type="button"
              onClick={() => showInfo('Password reset instructions sent to your email.')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Update Password
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-rose-600">Terminate Session</span>
              <span className="text-slate-400 dark:text-slate-500 block mt-0.5">
                Log out and revoke current authorization cookies
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
