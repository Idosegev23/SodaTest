'use client'

import { cn } from '../lib/utils'

export default function PremiumButton({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses = `
    relative inline-flex items-center justify-center
    px-4 py-3 md:px-6 md:py-3 text-sm md:text-base font-heebo font-medium
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden rounded-full
    backdrop-blur-sm
    min-h-[44px] touch-manipulation
  `

  const variantClasses = {
    primary: `
      bg-[var(--color-gold)] text-black
      hover:bg-[var(--color-gold)]/90
      focus:ring-[var(--color-gold)]/50
      border-2 border-[var(--color-gold)]
      hover:shadow-[0_0_30px_rgba(142,120,69,0.4)]
      hover:scale-[1.02] active:scale-[0.98]
      transform shadow-lg
    `,
    secondary: `
      bg-[var(--color-bg)] text-[var(--color-gold)]
      border-2 border-[var(--color-gold)]
      hover:bg-[var(--color-gold)] hover:text-black hover:border-[var(--color-gold)]
      focus:ring-[var(--color-gold)]/50
      hover:shadow-[0_0_30px_rgba(142,120,69,0.3)]
      hover:scale-[1.02] active:scale-[0.98]
      transform shadow-md
    `
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
