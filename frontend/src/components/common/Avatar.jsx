import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Avatar Component
 * 
 * @param {Object} props
 * @param {string} [props.name=''] - Full name used to compute initials
 * @param {string} [props.src] - Image avatar source URL
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Avatar dimension
 * @param {'online' | 'offline'} [props.status] - Status dot
 * @param {string} [props.className='']
 */
export function Avatar({
  name = '',
  src,
  size = 'md',
  status,
  className = '',
}) {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base font-semibold',
  };

  const statusDotSizes = {
    sm: 'w-2 h-2 bottom-0 right-0',
    md: 'w-2.5 h-2.5 bottom-0 right-0',
    lg: 'w-3 h-3 bottom-0.5 right-0.5',
    xl: 'w-3.5 h-3.5 bottom-0.5 right-0.5',
  };

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={name || 'User Avatar'}
          className={cn(
            'rounded-full object-cover border border-slate-200 shadow-sm',
            sizeStyles[size],
            className
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-slate-900 text-white font-mono flex items-center justify-center font-medium border border-slate-800 select-none shadow-sm',
            sizeStyles[size],
            className
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-white ring-1 ring-black/5',
            status === 'online' ? 'bg-emerald-500' : 'bg-slate-400',
            statusDotSizes[size]
          )}
        />
      )}
    </div>
  );
}

export default Avatar;

