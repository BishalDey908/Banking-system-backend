import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Common Button component wrapping shadcn/ui Button
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const variantMap = {
    primary: 'default',
    default: 'default',
    secondary: 'secondary',
    outline: 'outline',
    ghost: 'ghost',
    danger: 'destructive',
    destructive: 'destructive',
    subtle: 'subtle',
    link: 'link',
  };

  const sizeMap = {
    sm: 'sm',
    md: 'default',
    default: 'default',
    lg: 'lg',
    icon: 'icon',
  };

  const shadcnVariant = variantMap[variant] || 'default';
  const shadcnSize = sizeMap[size] || 'default';

  return (
    <ShadcnButton
      type={type}
      variant={shadcnVariant}
      size={shadcnSize}
      isLoading={isLoading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      disabled={disabled}
      className={cn(fullWidth && 'w-full', className)}
      {...rest}
    >
      {children}
    </ShadcnButton>
  );
}

export default Button;
