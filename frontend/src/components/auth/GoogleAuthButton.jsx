import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, HelpCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle, clearAuthError } from '../../store/slices/authSlice';

/**
 * Real Google Authentication & Registration Component
 * 
 * Embeds the official Google Identity Services (GIS) button and OAuth2 flow.
 * Directly integrates with Google's authentication servers to sign in or register
 * with a real Google account, verifying the ID token on the Fincheck backend.
 */
export function GoogleAuthButton({
  mode = 'register', // 'register' | 'login'
  onError,
  redirectTo = '/',
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const buttonRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '578160832274-s5ld6f8ah2qah4r5pbrjdji5ml34l6eb.apps.googleusercontent.com';

  // Handle real Google JWT ID token received from Google Identity Services
  const handleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      if (onError) onError('');
      dispatch(clearAuthError());

      if (!response?.credential) {
        throw new Error('No credential token received from Google.');
      }

      const result = await dispatch(loginWithGoogle({ credential: response.credential }));

      if (loginWithGoogle.fulfilled.match(result)) {
        navigate(redirectTo, { replace: true });
      } else {
        const errMsg = result.payload || 'Google registration failed on the server.';
        if (onError) onError(errMsg);
      }
    } catch (err) {
      if (onError) onError(err.message || 'Google authentication encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize and render official Google Identity Services button
  useEffect(() => {
    let checkInterval = null;

    const initGIS = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear previous button child nodes before rendering
        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: mode === 'register' ? 'signup_with' : 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: buttonRef.current.offsetWidth || 320,
          });
        }
        setGisLoaded(true);
      } catch (err) {
        console.warn('Google Identity Services initialization warning:', err);
      }
    };

    if (window.google?.accounts?.id) {
      initGIS();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGIS();
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, mode]);

  // Real OAuth2 Token Client popup flow
  const triggerOAuthPopup = () => {
    if (window.google?.accounts?.oauth2) {
      try {
        setLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setLoading(false);
              if (onError) onError(tokenResponse.error_description || tokenResponse.error);
              return;
            }
            if (tokenResponse?.access_token) {
              const result = await dispatch(
                loginWithGoogle({ accessToken: tokenResponse.access_token })
              );
              setLoading(false);
              if (loginWithGoogle.fulfilled.match(result)) {
                navigate(redirectTo, { replace: true });
              } else {
                if (onError) onError(result.payload || 'Google registration failed on server.');
              }
            }
          },
          error_callback: (err) => {
            setLoading(false);
            console.error('Google OAuth error:', err);
            if (onError) {
              onError('Google OAuth popup blocked or authorization error. See setup guide below.');
            }
            setShowConfigHelp(true);
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setLoading(false);
        if (onError) onError(err.message || 'Failed to open Google OAuth.');
        setShowConfigHelp(true);
      }
    } else if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowConfigHelp(true);
          }
        });
      } catch {
        setShowConfigHelp(true);
      }
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Official Google GIS Button Container */}
      <div className="relative flex justify-center w-full">
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center rounded-full z-20">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Real Google Official Button mounts here */}
        <div
          ref={buttonRef}
          className="w-full flex justify-center min-h-[44px]"
        />
      </div>

      {/* Fallback / Direct Popup trigger button if iframe is loading or custom click desired */}
      {!gisLoaded && (
        <button
          type="button"
          onClick={triggerOAuthPopup}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}</span>
        </button>
      )}

    </div>
  );
}

export default GoogleAuthButton;

