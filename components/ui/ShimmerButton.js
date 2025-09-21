'use client'

import { cn } from '../../lib/utils'

export function ShimmerButton({ 
  children, 
  className, 
  shimmerColor = "rgba(142, 120, 69, 0.6)", // זהב של המותג
  shimmerDuration = "2s",
  borderRadius = "6px",
  background = "var(--color-gold)",
  ...props 
}) {
  return (
    <button
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden px-6 py-3 font-medium transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black',
        'before:absolute before:inset-0 before:-z-10 before:translate-x-[-150%] before:translate-y-[-150%] before:scale-[2.5] before:rotate-[35deg] before:bg-gradient-to-r before:from-transparent before:via-[var(--shimmer-color)] before:to-transparent before:opacity-0 before:transition-all before:duration-700 before:content-[""] hover:before:translate-x-[150%] hover:before:translate-y-[150%] hover:before:opacity-100',
        className,
      )}
      style={{
        '--shimmer-color': shimmerColor,
        background: background,
        borderRadius: borderRadius,
        ...props.style,
      }}
      {...props}
    >
      <span className="relative z-10">
        {children}
      </span>
    </button>
  )
}
