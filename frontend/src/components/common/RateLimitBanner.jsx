import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { setRateLimited, clearRateLimit, addToast } from '../../store/slices/uiSlice';
import { clearClientRateLimit } from '../../api/client';

/**
 * RateLimitBanner
 * 
 * Global floating notification & lockout controller.
 * When an HTTP 429 occurs, it:
 * 1. Disables all interactive components across the frontend.
 * 2. Displays a high-visibility countdown timer and progress bar.
 * 3. Automatically unlocks all components when the cooldown timer reaches zero.
 */
export function RateLimitBanner() {
  const dispatch = useDispatch();
  const { isRateLimited, message, resetTime, retryAfterSeconds } = useSelector(
    (state) => state.ui.rateLimit || {}
  );

  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // 1. Listen for custom window event emitted by apiClient interceptor
  useEffect(() => {
    const handleRateLimitTriggered = (event) => {
      const { message: errMessage, retryAfterSeconds: retrySec } = event.detail || {};
      dispatch(
        setRateLimited({
          message: errMessage,
          retryAfterSeconds: retrySec,
        })
      );
    };

    window.addEventListener('app:rate-limit-triggered', handleRateLimitTriggered);
    return () => {
      window.removeEventListener('app:rate-limit-triggered', handleRateLimitTriggered);
    };
  }, [dispatch]);

  // 2. Manage document.body data attribute to disable all buttons, inputs, selects, and links
  useEffect(() => {
    if (isRateLimited) {
      document.body.setAttribute('data-rate-limited', 'true');
    } else {
      document.body.removeAttribute('data-rate-limited');
    }

    return () => {
      document.body.removeAttribute('data-rate-limited');
    };
  }, [isRateLimited]);

  // 3. Live Countdown Timer
  useEffect(() => {
    if (!isRateLimited || !resetTime) {
      setSecondsRemaining(0);
      return;
    }

    const updateCountdown = () => {
      const diffMs = resetTime - Date.now();
      const remaining = Math.max(0, Math.ceil(diffMs / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        // Cooldown completed: re-enable everything
        clearClientRateLimit();
        dispatch(clearRateLimit());
        dispatch(
          addToast({
            message: 'Rate limit lifted. All features are now restored.',
            type: 'success',
            duration: 4000,
          })
        );
      }
    };

    // Run immediately then tick every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, resetTime, dispatch]);

  if (!isRateLimited) {
    return null;
  }

  // Format seconds into MM:SS or SSs
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  // Calculate percentage of cooldown elapsed
  const totalSec = retryAfterSeconds || 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalSec - secondsRemaining) / totalSec) * 100)
  );

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rate-limit-exempt fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-lg shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div className="relative overflow-hidden bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-rose-500/40 rounded-2xl p-4 sm:p-5 text-white shadow-[0_20px_50px_rgba(244,63,94,0.25)]">
        {/* Progress bar along the top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-start gap-3.5">
          {/* Pulsing Alert Icon */}
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0 mt-0.5 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Rate Limit Reached (429)</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                  Locked
                </span>
              </h3>

              {/* Digital Countdown Timer */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 font-mono text-xs sm:text-sm font-bold text-rose-200">
                <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            </div>

            <p className="mt-1 text-xs text-slate-300 leading-relaxed line-clamp-2">
              {message || 'Too many requests. Please wait for the cooldown timer before attempting any further actions.'}
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                All buttons, inputs, and components are disabled
              </span>
              <span className="font-medium text-slate-300">
                Resumes in {secondsRemaining}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RateLimitBanner;

