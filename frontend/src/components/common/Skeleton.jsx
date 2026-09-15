import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Skeleton Placeholder
 * 
 * @param {Object} props
 * @param {'text' | 'circular' | 'rectangular'} [props.variant='rectangular']
 * @param {string|number} [props.width]
 * @param {string|number} [props.height]
 * @param {string} [props.className='']
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
}) {
  const variantStyles = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      style={{ width, height }}
      className={cn(
        'animate-pulse bg-slate-200/70',
        variantStyles[variant],
        className
      )}
    />
  );
}

export default Skeleton;

