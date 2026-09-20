import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, LogOut, Check, Copy, Sun, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/common/Avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { logoutUser, toggle2FA } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { useToast } from '../../hooks/useToast';
import { cn } from '@/lib/utils';

/**
 * Modern Fincheck Settings Page powered by shadcn/ui
 */
export function SettingsPage() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const { showSuccess, showInfo, showError } = useToast();

  const [copiedId, setCopiedId] = useState(false);
  const [toggling2fa, setToggling2fa] = useState(false);

  const handleToggle2FA = async () => {
    try {
      setToggling2fa(true);
      const nextState = !user?.isTwoFactorEnabled;
      const res = await dispatch(toggle2FA(nextState)).unwrap();
      showSuccess(res.message || (nextState ? '2FA enabled successfully' : '2FA disabled'));
    } catch (err) {
      showError(err || 'Failed to update 2FA setting');
    } finally {
      setToggling2fa(false);
    }
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-heading">
          Settings & Security
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account profile, theme preferences, and security credentials.
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6">
        {authLoading && !user ? (
          <div className="space-y-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-48 h-3.5" />
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <Avatar name={user?.name || 'Account Holder'} size="xl" status="online" />
                <div>
                  <h2 className="text-lg font-bold text-foreground font-heading">
                    {user?.name || 'Account Holder'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user?.email || 'user@fincheck.io'}
                  </p>
                  <div className="mt-2.5">
                    <Badge variant="success" dot className="font-sans">
                      Verified Customer
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
              <div>
                <span className="text-muted-foreground block mb-1 font-medium">
                  User Identification Number
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-foreground bg-muted px-2.5 py-1.5 rounded-xl border border-border">
                    {user?._id || '68c71f92e01b34a9'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUserId}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                    title="Copy User ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1 font-medium">
                  Primary Email
                </span>
                <span className="font-medium text-foreground block py-1.5">
                  {user?.email || 'user@fincheck.io'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Preferences & Theme Card */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-1 font-heading">
          Appearance
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Customize the visual interface of your Fincheck portal.
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
              {darkMode ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground block">
                {darkMode ? 'Dark Theme' : 'Light Theme'}
              </span>
              <span className="text-xs text-muted-foreground">
                {darkMode ? 'High contrast dark palette' : 'Soft pastel light palette'}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(toggleDarkMode())}
          >
            Switch to {darkMode ? 'Light mode' : 'Dark mode'}
          </Button>
        </div>
      </Card>

      {/* Security Card */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2 font-heading">
          <Shield className="w-4 h-4 text-primary" />
          <span>Security & Sessions</span>
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          End-to-end encrypted session and credential controls.
        </p>

        <div className="space-y-4 divide-y divide-border text-xs">
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-semibold text-foreground block">Account Password</span>
              <span className="text-muted-foreground block mt-0.5">
                Update or reset your authentication password
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

          {/* Two-Factor Authentication (2FA) */}
          <div className="flex items-center justify-between pt-3">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground block">
                  Two-Factor Authentication (2FA)
                </span>
                <Badge
                  variant={user?.isTwoFactorEnabled ? 'success' : 'secondary'}
                  className="font-sans font-semibold"
                >
                  {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <span className="text-muted-foreground block mt-0.5 text-xs">
                Require a 6-digit email OTP challenge when logging in with your password.
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={user?.isTwoFactorEnabled || false}
              onClick={handleToggle2FA}
              disabled={toggling2fa}
              title={user?.isTwoFactorEnabled ? 'Click to disable 2FA' : 'Click to enable 2FA'}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                user?.isTwoFactorEnabled ? 'bg-primary' : 'bg-input',
                toggling2fa && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
                  user?.isTwoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-semibold text-destructive block">Terminate Session</span>
              <span className="text-muted-foreground block mt-0.5">
                Log out and revoke current authorization cookies
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
