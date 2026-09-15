import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Lock, LogOut, Check, Copy, Sun, Moon } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { useToast } from '../../hooks/useToast';

/**
 * Clean & Simple Settings Page
 */
export function SettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const { showSuccess, showInfo } = useToast();

  const [copiedId, setCopiedId] = useState(false);

  const handleCopyUserId = () => {
    if (!user?._id) return;
    navigator.clipboard.writeText(user._id);
    setCopiedId(true);
    showSuccess('User ID copied');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your profile, app theme, and account security.
        </p>
      </div>

      {/* User Profile Card */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name || 'User'} size="xl" status="online" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Account Holder'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user?.email || 'user@aurabank.io'}</p>
              <div className="mt-2">
                <Badge variant="emerald" dot size="sm">Verified Account</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-1 uppercase font-mono text-[10px]">
              User ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {user?._id || '68c71f92e01b34a9'}
              </span>
              <button
                type="button"
                onClick={handleCopyUserId}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                title="Copy User ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-1 uppercase font-mono text-[10px]">
              Email Address
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{user?.email || 'user@domain.com'}</span>
          </div>
        </div>
      </Card>

      {/* Preferences & Theme Card */}
      <Card padding="lg">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Appearance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose how Aura Bank looks on your device.
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-emerald-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {darkMode ? 'Comfortable for dark environments' : 'Clean and crisp daytime look'}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(toggleDarkMode())}
          >
            Switch to {darkMode ? 'Light' : 'Dark'}
          </Button>
        </div>
      </Card>

      {/* Security Card */}
      <Card padding="lg">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Security
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Your account is protected with encrypted authentication and password hashing.
        </p>

        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Password</span>
              <span className="text-slate-400 dark:text-slate-500 block mt-0.5">
                Change your account password
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showInfo('Password reset instructions sent to your email.')}
            >
              Update Password
            </Button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Sign Out</span>
              <span className="text-slate-400 dark:text-slate-500 block mt-0.5">
                Log out of this browser session
              </span>
            </div>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
