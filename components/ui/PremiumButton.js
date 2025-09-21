'use client'

import { cn } from '../../lib/utils'

export function PremiumButton({ 
  children, 
  className,
  variant = "primary", // primary, secondary
  ...props 
}) {
  const isPrimary = variant === "primary"
  
  return (
    <button
      className={cn(
        // Base styles
        "relative cursor-pointer rounded-full transition-all duration-300 ease-out overflow-hidden",
        "font-heebo font-medium select-none",
        "px-8 py-4 md:px-8 md:py-4 text-center tracking-wide",
        
        // Focus states
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black",
        
          // Background and borders
          isPrimary ? [
            // Primary button (זהב מלא)
            "bg-[var(--color-gold)] text-black font-medium",
            "shadow-[0_4px_12px_rgba(142,120,69,0.3)]",
            "hover:bg-[var(--color-gold)]/90 hover:shadow-[0_6px_16px_rgba(142,120,69,0.4)]",
            "active:shadow-[0_2px_8px_rgba(142,120,69,0.2)]"
          ] : [
            // Secondary button (מסגרת זהב עם רקע כהה)
            "bg-[var(--color-bg)] border-2 border-[var(--color-gold)]",
            "text-[var(--color-gold)] font-light",
            "shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
            "hover:bg-[var(--color-gold)]/10 hover:border-[var(--color-gold)]",
            "hover:shadow-[0_6px_16px_rgba(142,120,69,0.2)]",
            "active:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          ],
        
        // Hover effects
        "hover:scale-[0.98]",
        "active:scale-[0.96]",
        
        // Shimmer effect - contained within button
        "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r",
        "before:from-transparent before:via-white/20 before:to-transparent",
        "before:translate-x-[-100%] before:skew-x-[-45deg] before:transition-transform before:duration-700",
        "hover:before:translate-x-[200%]",
        "before:pointer-events-none before:z-10",
        
        className
      )}
      {...props}
    >
      <span className="relative z-20 block">
        {children}
      </span>
    </button>
  )
}
