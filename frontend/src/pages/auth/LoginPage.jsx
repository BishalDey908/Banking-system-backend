import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { GoogleAccountPickerModal } from '../../components/auth/GoogleAccountPickerModal';
import { authApi } from '../../api/authApi';
import {
  loginUser,
  loginWithOtp,
  verify2FA,
  loginWithGoogle,
  clearAuthError,
  clearTwoFactorPending,
} from '../../store/slices/authSlice';
import { isValidEmail } from '../../utils/validators';
import { cn } from '@/lib/utils';

/**
 * Modern Fincheck Banking Login View powered by shadcn/ui
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading: reduxLoading, error, twoFactorPending } = useSelector((state) => state.auth);

  // Tabs: 'password' | 'otp'
  const [loginMode, setLoginMode] = useState('password');

  // Password Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP Login State
  const [otpSent, setOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // 2FA Challenge State
  const [twoFactorOtp, setTwoFactorOtp] = useState('');

  // UI State
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Demo auto-fill
  const handleDemoFill = () => {
    setEmail('demo@bank.com');
    setPassword('demo1234');
    setFormError('');
  };

  // Cooldown timer effect
  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 1. Password Login Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setFormError('Password is required.');
      return;
    }

    const result = await dispatch(
      loginUser({ email: email.trim(), password })
    );

    if (loginUser.fulfilled.match(result)) {
      if (result.payload?.twoFactorRequired) {
        setFormSuccess('2FA code sent to your registered email.');
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  // 2. Send OTP for Passwordless Login
  const handleSendLoginOtp = async (e) => {
    e?.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address to receive OTP.');
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.sendLoginOtp(email.trim());
      setOtpSent(true);
      setResendCooldown(60);
      setFormSuccess(`One-time login passcode sent to ${email.trim()}`);
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to send login code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Verify OTP for Passwordless Login
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!loginOtp || loginOtp.trim().length !== 6) {
      setFormError('Please enter the 6-digit login code.');
      return;
    }

    const result = await dispatch(
      loginWithOtp({ email: email.trim(), otp: loginOtp.trim() })
    );

    if (loginWithOtp.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  // 4. Verify 2FA Challenge Submit
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!twoFactorOtp || twoFactorOtp.trim().length !== 6) {
      setFormError('Please enter the 6-digit 2FA code.');
      return;
    }

    const result = await dispatch(
      verify2FA({
        tempToken: twoFactorPending?.tempToken,
        otp: twoFactorOtp.trim(),
      })
    );

    if (verify2FA.fulfilled.match(result)) {
      navigate(from, { replace: true });
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
        navigate(from, { replace: true });
      } else {
        setFormError(result.payload || 'Google authentication failed');
      }
    } catch (err) {
      setFormError(err.message || 'Google authentication failed');
    }
  };

  const loading = reduxLoading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-background antialiased font-sans">
      <div className="w-full max-w-[1100px] min-h-[640px] bg-card rounded-3xl shadow-xl border border-border overflow-hidden flex flex-col lg:flex-row animate-scale-up">
        {/* Left Side: Modern Brand Visual Panel */}
        <div className="hidden lg:flex lg:w-[48%] relative bg-gradient-to-br from-[var(--gradient-brand-from)] via-[var(--gradient-brand-via)] to-[var(--gradient-brand-to)] p-8 sm:p-10 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-white/10 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-60 h-60 rounded-full bg-white/10 blur-xl pointer-events-none" />

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
            <div className="bg-white text-slate-900 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between h-28 transition-transform duration-200">
              <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center">
                1
              </div>
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                Register your account
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-white flex flex-col justify-between h-28">
              <div className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-medium flex items-center justify-center">
                2
              </div>
              <p className="text-xs font-medium text-white/90 leading-tight">
                Set up your profile information
              </p>
            </div>

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

        {/* Right Side: Clean Authentication Form */}
        <div className="w-full lg:w-[52%] px-4 sm:px-8 md:px-12 py-6 sm:py-8 flex flex-col justify-center max-w-[420px] mx-auto">
          <div className="text-center mb-5">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-heading">
              Sign In
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Access your secure Fincheck dashboard
            </p>
          </div>

          {/* Mode Switcher using shadcn Tabs */}
          <Tabs
            value={loginMode}
            onValueChange={(val) => {
              setLoginMode(val);
              setFormError('');
              setFormSuccess('');
            }}
            className="w-full mb-5"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="otp">Email OTP</TabsTrigger>
            </TabsList>
          </Tabs>

          {(formError || error) && (
            <div className="mb-4">
              <Alert variant="destructive">
                <div>{formError || error}</div>
              </Alert>
            </div>
          )}

          {formSuccess && (
            <div className="mb-4">
              <Alert variant="success">
                <div>{formSuccess}</div>
              </Alert>
            </div>
          )}

          {loginMode === 'password' ? (
            /* PASSWORD LOGIN FORM */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="block mb-1.5">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  {isValidEmail(email) && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password">
                    Password
                  </Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDemoFill}
                      className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                    >
                      Auto-Fill
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full h-11 text-sm font-medium"
              >
                Continue
              </Button>
            </form>
          ) : (
            /* EMAIL OTP LOGIN FORM */
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendLoginOtp} className="space-y-4">
                  <div>
                    <Label htmlFor="otp-email" className="block mb-1.5">
                      Enter Registered Email
                    </Label>
                    <Input
                      id="otp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full h-11 text-sm font-medium"
                  >
                    Send Login Passcode
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      Enter the 6-digit code sent to <strong className="text-foreground">{email}</strong>
                    </p>
                    <Input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="123456"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                      className="text-center tracking-[10px] font-mono text-xl h-11"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setLoginOtp('');
                        setFormError('');
                        setFormSuccess('');
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      ← Use another email
                    </button>

                    <button
                      type="button"
                      onClick={handleSendLoginOtp}
                      disabled={resendCooldown > 0 || isSubmitting}
                      className="text-primary font-semibold hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loginOtp.length !== 6}
                    className="w-full h-11 text-sm font-medium mt-2"
                  >
                    Sign In with Code
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Sign Up Link */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>

          {/* Or Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                Or
              </span>
            </div>
          </div>

          {/* Real Google Sign-In */}
          <GoogleAuthButton
            mode="login"
            redirectTo={from}
            onError={(msg) => setFormError(msg)}
          />

          {/* Legal Footer */}
          <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
            By signing in you confirm that you have read and agree to the Fincheck{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>{' '}
            and{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>.
          </p>
        </div>
      </div>

      {/* 2FA Verification Modal */}
      {twoFactorPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-border text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-foreground font-heading">
              Two-Factor Authentication
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              For your security, enter the 6-digit verification code sent to <strong className="text-foreground">{twoFactorPending.email}</strong>
            </p>

            {formError && (
              <div className="mt-4">
                <Alert variant="destructive">
                  <div>{formError}</div>
                </Alert>
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="mt-5 space-y-4">
              <Input
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                value={twoFactorOtp}
                onChange={(e) => setTwoFactorOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
                className="text-center tracking-[12px] font-mono text-2xl h-12"
              />

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    dispatch(clearTwoFactorPending());
                    setTwoFactorOtp('');
                    setFormError('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={twoFactorOtp.length !== 6}
                  className="flex-1"
                >
                  Verify & Continue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default LoginPage;
