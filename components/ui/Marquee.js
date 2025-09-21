'use client'

import { cn } from '../../lib/utils'

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true, // Default to true for better UX
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex shrink-0 [gap:var(--gap)] animate-marquee-seamless flex-row",
          reverse && "animate-marquee-seamless-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{
          width: 'max-content'
        }}
      >
        {/* First set */}
        <div className="flex shrink-0 [gap:var(--gap)] gap-4">
          {children}
        </div>
        {/* Second set - starts immediately after first */}
        <div className="flex shrink-0 [gap:var(--gap)] gap-4">
          {children}
        </div>
        {/* Third set - for extra smoothness */}
        <div className="flex shrink-0 [gap:var(--gap)] gap-4">
          {children}
        </div>
      </div>
    </div>
  )
}
