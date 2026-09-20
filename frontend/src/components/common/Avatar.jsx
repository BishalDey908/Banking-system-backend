import React from 'react';
import {
  Avatar as ShadcnAvatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * Common Avatar Component powered by shadcn/ui Avatar
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
      <ShadcnAvatar className={cn(sizeStyles[size], className)}>
        {src && <AvatarImage src={src} alt={name || 'User Avatar'} />}
        <AvatarFallback className="bg-primary/10 text-primary font-mono font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </ShadcnAvatar>

      {status && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-background ring-1 ring-border',
            status === 'online' ? 'bg-emerald-500' : 'bg-muted-foreground',
            statusDotSizes[size]
          )}
        />
      )}
    </div>
  );
}

export default Avatar;
