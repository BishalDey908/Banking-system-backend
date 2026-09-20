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
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { GoogleAccountPickerModal } from '../../components/auth/GoogleAccountPickerModal';
import { authApi } from '../../api/authApi';
import { loginWithGoogle, clearAuthError } from '../../store/slices/authSlice';
import { isValidEmail, validatePassword } from '../../utils/validators';

/**
 * Modern Fincheck Banking Registration View powered by shadcn/ui
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading: reduxLoading, error } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Info Form, 2: OTP Verification
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const loading = reduxLoading || isSubmitting;

  // Resend countdown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to email
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
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

    try {
      setIsSubmitting(true);
      const res = await authApi.sendRegisterOtp({
        name: fullName,
        email: email.trim(),
        password,
      });
      setStep(2);
      setResendCooldown(60);
      setFormSuccess(res.message || 'Verification code sent to your email.');
    } catch (err) {
      setFormError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!otp || otp.trim().length !== 6) {
      setFormError('Please enter the 6-digit verification code.');
      return;
    }

    const fullName = name.trim() || username.trim();

    try {
      setIsSubmitting(true);
      const res = await authApi.verifyRegisterOtp({
        name: fullName,
        email: email.trim(),
        password,
        otp: otp.trim(),
      });

      if (res.token) {
        localStorage.setItem('aura_bank_token', res.token);
      }
      if (res.user) {
        localStorage.setItem('aura_bank_user', JSON.stringify(res.user));
      }

      setFormSuccess('Registration successful! Redirecting to your dashboard...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setFormError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setFormError('');
    setFormSuccess('');

    const fullName = name.trim() || username.trim();

    try {
      setIsSubmitting(true);
      const res = await authApi.sendRegisterOtp({
        name: fullName,
        email: email.trim(),
        password,
      });
      setResendCooldown(60);
      setFormSuccess(res.message || 'New verification code sent to your email.');
    } catch (err) {
      setFormError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight mb-2 font-heading">
                Start your Journey
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 font-normal leading-relaxed max-w-sm">
                Next-generation banking with instant zero-fee UPI, real-time double-entry ledger, and a ₹10,000 opening liquid reserve.
              </p>
            </div>

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
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
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

        {/* Right Side: Clean Banking Registration Form */}
        <div className="w-full lg:w-[52%] px-4 sm:px-8 md:px-12 py-6 sm:py-8 flex flex-col justify-center max-w-[420px] mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-heading">
              {step === 1 ? 'Join Us' : 'Verify Email'}
            </h2>
            {step === 2 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                We sent a 6-digit verification code to <span className="font-semibold text-foreground">{email}</span>
              </p>
            )}
          </div>

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

          {step === 1 ? (
            /* STEP 1: Registration Details Form */
            <form onSubmit={handleInitiateRegister} className="space-y-3.5">
              <div>
                <Label htmlFor="reg-name" className="block mb-1">
                  Full Name
                </Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Juliette Karapetyan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label htmlFor="reg-email" className="block mb-1">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                    {isValidEmail(email) && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-username" className="block mb-1">
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-username"
                      type="text"
                      placeholder="julietux"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                    {username.length >= 3 && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="reg-password" className="block mb-1">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                  At least 6 characters with letters, numbers, and symbols.
                </p>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full h-11 text-sm font-medium mt-2"
              >
                Send Verification Code
              </Button>
            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="reg-otp" className="block mb-2 text-center">
                  Enter 6-Digit Code
                </Label>
                <Input
                  id="reg-otp"
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
                  ← Edit details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isSubmitting}
                  className="text-primary font-semibold hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                disabled={otp.length !== 6}
                className="w-full h-11 text-sm font-medium mt-3"
              >
                Verify & Create Account
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground mt-3.5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>

          {step === 1 && (
            <>
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground font-medium">
                    Or
                  </span>
                </div>
              </div>

              <GoogleAuthButton
                mode="register"
                redirectTo="/"
                onError={(msg) => setFormError(msg)}
              />
            </>
          )}

          <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
            By signing up I confirm that I have read and agree to the Fincheck{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>{' '}
            and{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>.
          </p>
        </div>
      </div>

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
