import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { registerUser, clearAuthError } from '../../store/slices/authSlice';
import { isValidEmail, validatePassword } from '../../utils/validators';

/**
 * Clean & Simple Registration Page
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too Short', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearAuthError());

    if (!name.trim()) {
      setFormError('Please enter your full name.');
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

    const result = await dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
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
              Create an Account
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign up in seconds to start managing your money.
            </p>
          </div>

          {(formError || error) && (
            <div className="mb-5">
              <Alert variant="danger" message={formError || error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Alex Henderson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
                required
              />

              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColors[strength - 1] || 'bg-slate-200'}`}
                      style={{ width: `${(strength / 4) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    <span>Password Strength</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {strengthLabels[strength - 1] || 'Too Short'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-6 border-t border-slate-200/60 dark:border-slate-800">
          <span>&copy; {new Date().getFullYear()} Aura Bank</span>
          <span>Simple & Secure Banking</span>
        </div>
      </div>

      {/* Showcase Panel (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 flex justify-end">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            ● Modern Banking
          </span>
        </div>

        <div className="relative z-10 max-w-md my-auto">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight text-white mb-4">
            Everything you need in a modern bank.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Open multiple accounts, transfer funds instantly, and review clean statements anytime, day or night.
          </p>

          <div className="space-y-2.5 text-xs">
            {[
              'Direct Indian Rupee (INR) settlements',
              'Clean statements and downloadable CSV reports',
              'Virtual debit card with instant copy and card controls',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
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

export default RegisterPage;
