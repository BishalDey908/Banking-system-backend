import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '../../api/authApi';
import { isValidEmail, validatePassword } from '../../utils/validators';

/**
 * Modern Fincheck Banking Forgot & Reset Password View powered by shadcn/ui
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Request Reset Code
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email.trim());
      setStep(2);
      setResendCooldown(60);
      setFormSuccess(res.message || 'Password reset code sent to your email.');
    } catch (err) {
      setFormError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!otp || otp.trim().length !== 6) {
      setFormError('Please enter the 6-digit reset code.');
      return;
    }

    const passValidation = validatePassword(newPassword);
    if (!passValidation.isValid) {
      setFormError(passValidation.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep(3);
    } catch (err) {
      setFormError(err.message || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Reset Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setFormError('');
    setFormSuccess('');

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email.trim());
      setResendCooldown(60);
      setFormSuccess(res.message || 'A new reset code has been sent.');
    } catch (err) {
      setFormError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-6 md:p-8 font-sans select-none">
      <div className="w-full max-w-5xl bg-card rounded-[32px] sm:rounded-[36px] shadow-2xl p-3 sm:p-4 border border-border overflow-hidden flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[620px]">
        {/* Left Side: Vibrant Gradient Showcase Panel */}
        <div className="w-full lg:w-[48%] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden bg-brand-gradient text-white shadow-inner">
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
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Account Recovery</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight mb-2 font-heading">
                Reset Password
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 font-normal leading-relaxed max-w-sm">
                Safely recover access to your Fincheck financial account using verified multi-factor email confirmation.
              </p>
            </div>
          </div>

          {/* Bottom: Security Notice Card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>End-to-End Cryptographic Security</span>
            </div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              All password reset tokens are hashed with bcrypt and expire in 10 minutes to protect your assets.
            </p>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="w-full lg:w-[52%] px-4 sm:px-8 md:px-12 py-6 sm:py-8 flex flex-col justify-center max-w-[420px] mx-auto">
          {/* Header Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-heading">
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Enter Reset Code'}
              {step === 3 && 'Password Reset!'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {step === 1 && 'Enter your email to receive a password reset code.'}
              {step === 2 && `We sent a 6-digit code to ${email}`}
              {step === 3 && 'Your credentials have been securely updated.'}
            </p>
          </div>

          {formError && (
            <div className="mb-4">
              <Alert variant="destructive">
                <div>{formError}</div>
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

          {step === 1 && (
            /* STEP 1: Enter Email */
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email" className="block mb-1.5">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="forgot-email"
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

              <Button
                type="submit"
                isLoading={loading}
                className="w-full h-11 text-sm font-medium"
              >
                Send Reset Code
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            /* STEP 2: Enter OTP & New Password */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-otp" className="block mb-1.5 text-center">
                  6-Digit Reset Code
                </Label>
                <Input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                  className="text-center tracking-[12px] font-mono text-2xl h-12"
                />
              </div>

              <div>
                <Label htmlFor="new-pass" className="block mb-1.5">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-pass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
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

              <div>
                <Label htmlFor="confirm-pass" className="block mb-1.5">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-pass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormError('');
                    setFormSuccess('');
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  ← Edit email
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  className="text-primary font-semibold hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                disabled={otp.length !== 6 || !newPassword}
                className="w-full h-11 text-sm font-medium mt-2"
              >
                Reset & Save Password
              </Button>
            </form>
          )}

          {step === 3 && (
            /* STEP 3: Success Confirmation */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground font-heading">
                  Password Updated Successfully
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
                  Your new credentials are now active. You can now log in to your account.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full h-11 text-sm font-medium"
              >
                Proceed to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
