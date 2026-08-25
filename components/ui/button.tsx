import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/20',
  secondary:
    'bg-brand-secondary hover:bg-brand-secondary-hover text-white shadow-md shadow-brand-secondary/20',
  outline:
    'bg-surface-app hover:bg-stroke-default border border-stroke-default text-content-main',
  ghost: 'text-content-muted hover:text-brand-primary bg-transparent',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'py-2 px-4 text-xs',
  md: 'py-2.5 px-4 text-sm',
};

/**
 * Shared button styled entirely from the color tokens in app/globals.css.
 * Changing --color-brand-primary (etc.) updates every button in the app —
 * no component needs to be touched.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition active:scale-[0.98] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
