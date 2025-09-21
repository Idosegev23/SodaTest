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
    px-8 py-3 text-base font-heebo font-medium
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden
  `

  const variantClasses = {
    primary: `
      bg-[var(--color-gold)] text-black
      hover:bg-[var(--color-gold)]/90
      focus:ring-[var(--color-gold)] focus:ring-offset-black
      border-2 border-[var(--color-gold)]
      hover:shadow-lg hover:scale-[1.02]
      transform
    `,
    secondary: `
      bg-transparent text-[var(--color-gold)]
      border-2 border-[var(--color-gold)]
      hover:bg-[var(--color-gold)] hover:text-black
      focus:ring-[var(--color-gold)] focus:ring-offset-black
      hover:shadow-lg hover:scale-[1.02]
      transform
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
