'use client'

import { useState, useEffect } from 'react'
import { getArtworks } from '../lib/supabaseClient'

export default function MarqueeGallery() {
  const [artworks, setArtworks] = useState([])
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    loadArtworks()
  }, [])

  const loadArtworks = async () => {
    try {
      const artworksFromDB = await getArtworks()
      
      if (artworksFromDB && artworksFromDB.length > 0) {
        // Sort by creation date and take the most recent ones
        const sorted = artworksFromDB.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at)
          }
          return (b.id || '').toString().localeCompare((a.id || '').toString())
        })
        
        // Ensure we have enough items for seamless loop (minimum 6 per row)
        let baseArtworks = sorted.slice(0, Math.max(12, sorted.length))
        
        // If we have fewer than 6 items, duplicate them to ensure smooth scrolling
        while (baseArtworks.length < 18) {
          baseArtworks = [...baseArtworks, ...baseArtworks]
        }
        
        // Create multiple copies for seamless infinite scrolling
        const duplicatedArtworks = [...baseArtworks, ...baseArtworks, ...baseArtworks]
        setArtworks(duplicatedArtworks)
      } else {
        // Fallback images if no artworks exist - ensure enough for smooth loop
        const fallbackImages = Array.from({ length: 18 }, (_, i) => ({
          id: `fallback-${i}`,
          image_url: `https://picsum.photos/300/300?random=${i + 100}`,
          user_name: 'אמן דיגיטלי',
          prompt: `יצירה דיגיטלית ${(i % 6) + 1}`,
          created_at: new Date().toISOString()
        }))
        // Triple duplication for seamless loop
        setArtworks([...fallbackImages, ...fallbackImages, ...fallbackImages])
      }
    } catch (error) {
      console.error('Error loading artworks for marquee:', error)
      // Error fallback with enough items for smooth scrolling
      const errorImages = Array.from({ length: 18 }, (_, i) => ({
        id: `error-${i}`,
        image_url: `https://picsum.photos/300/300?random=${i + 200}`,
        user_name: 'Fallback Artist',
        prompt: `Fallback Art ${(i % 6) + 1}`,
        created_at: new Date().toISOString()
      }))
      setArtworks([...errorImages, ...errorImages, ...errorImages])
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Split artworks into 3 rows
  const row1 = artworks.filter((_, index) => index % 3 === 0)
  const row2 = artworks.filter((_, index) => index % 3 === 1)
  const row3 = artworks.filter((_, index) => index % 3 === 2)

  const MarqueeRow = ({ artworks, direction = 'left', speed = '80s' }) => {
    // Ensure we have enough items for smooth infinite scroll
    const displayArtworks = artworks.length < 6 
      ? [...artworks, ...artworks, ...artworks].slice(0, 12)
      : artworks.slice(0, 12)
    
    return (
      <div className="overflow-hidden py-2 relative">
        <div 
          className={`flex gap-4 ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'}`}
          style={{ 
            animationDuration: speed,
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'calc(200% + 1rem)' // Extra width for seamless loop
          }}
        >
          {/* First set */}
          {displayArtworks.map((artwork, index) => (
            <div 
              key={`first-${artwork.id}-${index}`}
              className="flex-shrink-0 w-48 md:w-56 lg:w-64 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg bg-[var(--color-bg)] border border-[var(--color-gold-border)] hover:border-[var(--color-gold)] transition-all duration-300">
                <img
                  src={artwork.image_url}
                  alt={artwork.prompt || 'יצירת אמנות'}
                  className="w-full h-48 md:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}`
                  }}
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h4 className="text-white text-sm font-heebo font-light line-clamp-2 mb-1">
                    {artwork.prompt}
                  </h4>
                  <p className="text-[var(--color-gold)] text-xs font-heebo">
                    {artwork.user_name}
                  </p>
                  {artwork.created_at && (
                    <p className="text-[var(--color-muted)]/60 text-xs font-heebo mt-1">
                      {new Date(artwork.created_at).toLocaleDateString('he-IL')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {displayArtworks.map((artwork, index) => (
            <div 
              key={`second-${artwork.id}-${index}`}
              className="flex-shrink-0 w-48 md:w-56 lg:w-64 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg bg-[var(--color-bg)] border border-[var(--color-gold-border)] hover:border-[var(--color-gold)] transition-all duration-300">
                <img
                  src={artwork.image_url}
                  alt={artwork.prompt || 'יצירת אמנות'}
                  className="w-full h-48 md:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}`
                  }}
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h4 className="text-white text-sm font-heebo font-light line-clamp-2 mb-1">
                    {artwork.prompt}
                  </h4>
                  <p className="text-[var(--color-gold)] text-xs font-heebo">
                    {artwork.user_name}
                  </p>
                  {artwork.created_at && (
                    <p className="text-[var(--color-muted)]/60 text-xs font-heebo mt-1">
                      {new Date(artwork.created_at).toLocaleDateString('he-IL')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden bg-[var(--color-bg)] relative">
      {/* Pause/Play Control for Accessibility */}
      <div className="flex justify-center mb-6">
        <button
          onClick={togglePause}
          className="px-4 py-2 text-sm font-heebo font-light text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors focus:outline-none focus:text-[var(--color-gold)]"
          aria-label={isPaused ? 'המשך גלילה אוטומטית' : 'עצור גלילה אוטומטית'}
        >
          {isPaused ? '▶️ המשך' : '⏸️ עצור'}
        </button>
      </div>

      {/* Three Marquee Rows */}
      <div className="space-y-4">
        {/* Row 1 - Left to Right */}
        <MarqueeRow artworks={row1} direction="left" speed="80s" />
        
        {/* Row 2 - Right to Left */}
        <MarqueeRow artworks={row2} direction="right" speed="70s" />
        
        {/* Row 3 - Left to Right */}
        <MarqueeRow artworks={row3} direction="left" speed="90s" />
      </div>

      {/* Gradient Overlays for Smooth Edges */}
      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-[var(--color-bg)] to-transparent pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none z-10"></div>
    </div>
  )
}