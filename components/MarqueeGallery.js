'use client'

import { useState, useEffect } from 'react'
import { getArtworks } from '../lib/supabaseClient'
import { Marquee } from './ui/Marquee'
import { cn } from '../lib/utils'

export default function MarqueeGallery() {
  const [artworks, setArtworks] = useState([])
  const [allArtworks, setAllArtworks] = useState([]) // All artworks for navigation

  useEffect(() => {
    loadArtworks()
    
    // Listen for new artworks being created to update in real-time
    const handleNewArtwork = () => {
      loadArtworks() // Reload to get new artworks
    }
    
    // Listen for artwork likes to update the display
    const handleArtworkLiked = () => {
      loadArtworks() // Reload to get updated likes and re-sort
    }
    
    window.addEventListener('newArtworkCreated', handleNewArtwork)
    window.addEventListener('artworkLiked', handleArtworkLiked)
    
    return () => {
      window.removeEventListener('newArtworkCreated', handleNewArtwork)
      window.removeEventListener('artworkLiked', handleArtworkLiked)
    }
  }, [])

  // Preload images for smooth marquee animation with loading state
  const [imagesLoaded, setImagesLoaded] = useState(false)
  
  useEffect(() => {
    if (allArtworks.length > 0) {
      let loadedCount = 0
      const totalImages = allArtworks.length
      
      allArtworks.forEach(artwork => {
        const img = new Image()
        img.onload = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            setImagesLoaded(true)
          }
        }
        img.onerror = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            setImagesLoaded(true)
          }
        }
        img.src = artwork.image_url
      })
      
      // Fallback timeout for mobile
      setTimeout(() => {
        setImagesLoaded(true)
      }, 3000)
    }
  }, [allArtworks])

  const loadArtworks = async () => {
    try {
      const artworksFromDB = await getArtworks()
      
      if (artworksFromDB && artworksFromDB.length > 0) {
        // Sort all artworks by likes for consistency
        const sortedByLikes = artworksFromDB.sort((a, b) => {
          const likesA = a.likes || 0
          const likesB = b.likes || 0
          
          if (likesB !== likesA) {
            return likesB - likesA // Most likes first
          }
          
          // If likes are equal, sort by creation date (newest first)
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at)
          }
          return (b.id || '').toString().localeCompare((a.id || '').toString())
        })
        
        // Store ALL artworks for navigation
        setAllArtworks(sortedByLikes)
        
        // Show all artworks except the top 7 (which are in BentoGallery) for display
        // But if we have less than 7 total, show all
        const marqueeArtworks = sortedByLikes.length > 7 ? sortedByLikes.slice(7) : sortedByLikes
        setArtworks(marqueeArtworks)
      } else {
        console.log('No artworks found in database')
        setArtworks([])
        setAllArtworks([])
      }
    } catch (error) {
      console.error('Error loading artworks for marquee:', error)
      setArtworks([])
      setAllArtworks([])
    }
  }

  // Split artworks into 3 rows - ensure each row has enough items by duplicating if needed
  const minItemsPerRow = 8 // Minimum items per row for full display
  
  // Create rows and fill them with duplicates if needed
  const createFullRow = (items) => {
    if (items.length === 0) return []
    const fullRow = [...items]
    while (fullRow.length < minItemsPerRow) {
      fullRow.push(...items) // Duplicate the items
    }
    return fullRow
  }
  
  const row1 = createFullRow(artworks.filter((_, index) => index % 3 === 0))
  const row2 = createFullRow(artworks.filter((_, index) => index % 3 === 1))
  const row3 = createFullRow(artworks.filter((_, index) => index % 3 === 2))

  const handleLike = async (artworkId, e) => {
    e.stopPropagation()
    
    try {
      const response = await fetch('/api/like-artwork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artworkId }),
      })
      
      if (response.ok) {
        // Reload artworks to update the display
        loadArtworks()
        
        // Update selectedArtwork if it's currently selected
        if (selectedArtwork && selectedArtwork.id === artworkId) {
          const updatedArtwork = { ...selectedArtwork, likes: (selectedArtwork.likes || 0) + 1 }
          setSelectedArtwork(updatedArtwork)
        }
        
        // Trigger a global update for BentoGallery by dispatching a custom event
        window.dispatchEvent(new CustomEvent('artworkLiked', { 
          detail: { artworkId, newLikes: (selectedArtwork?.likes || 0) + 1 }
        }))
      }
    } catch (error) {
      console.error('Error liking artwork:', error)
    }
  }

  const handleCardClick = (artwork) => {
    // Open artwork in popup/modal for mobile viewing
    setSelectedArtwork(artwork)
  }

  const [selectedArtwork, setSelectedArtwork] = useState(null)

  const navigateArtwork = (direction) => {
    console.log('Navigate called:', direction, 'allArtworks length:', allArtworks.length, 'selectedArtwork:', selectedArtwork?.id)
    
    if (!selectedArtwork || !allArtworks.length) {
      console.log('Navigation blocked - missing data')
      return
    }
    
    // Use ALL artworks for navigation (not just marquee artworks)
    const currentIndex = allArtworks.findIndex(art => art.id === selectedArtwork.id)
    console.log('Current index:', currentIndex)
    
    let newIndex = currentIndex + direction
    
    // Loop around
    if (newIndex < 0) newIndex = allArtworks.length - 1
    if (newIndex >= allArtworks.length) newIndex = 0
    
    console.log('New index:', newIndex, 'New artwork:', allArtworks[newIndex]?.id)
    setSelectedArtwork(allArtworks[newIndex])
  }

  const handleLike = async (artworkId, event) => {
    event?.preventDefault()
    event?.stopPropagation()
    
    try {
      const response = await fetch('/api/like-artwork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artworkId }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Like successful:', data)
        // Update local state with new like count
        setAllArtworks(prev => prev.map(art => 
          art.id === artworkId 
            ? { ...art, likes: (art.likes || 0) + 1 }
            : art
        ))
        setArtworks(prev => prev.map(art => 
          art.id === artworkId 
            ? { ...art, likes: (art.likes || 0) + 1 }
            : art
        ))
        // Update selected artwork if it's the one being liked
        if (selectedArtwork && selectedArtwork.id === artworkId) {
          setSelectedArtwork(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }))
        }
      } else {
        console.error('Like failed:', response.statusText)
      }
    } catch (error) {
      console.error('Error liking artwork:', error)
    }
  }

  const ArtworkCard = ({ artwork }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    return (
      <figure
        className={cn(
          "relative h-full w-48 md:w-56 lg:w-64 cursor-pointer overflow-hidden rounded-lg border group",
          "border-[var(--color-gold-border)] bg-[var(--color-bg)] hover:border-[var(--color-gold)]",
          "transition-all duration-300 shadow-lg hover:shadow-xl"
        )}
        onClick={() => handleCardClick(artwork)}
      >
        {/* Loading placeholder */}
        {!isLoaded && !hasError && (
          <div className="w-full h-48 md:h-56 lg:h-64 bg-[var(--color-muted)]/20 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={artwork.image_url}
          alt={artwork.prompt || 'יצירת אמנות'}
          className={cn(
            "w-full h-48 md:h-56 lg:h-64 object-cover transition-all duration-700 group-hover:scale-105",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            setHasError(true)
            setIsLoaded(true)
            e.target.src = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}`
          }}
        />
        
        {/* Click indicator for mobile - always visible */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>

        {/* Like button - always visible on mobile, hover on desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleLike(artwork.id, e)
          }}
          className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full p-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-[var(--color-gold)] hover:text-black group/like"
          aria-label={`הוסף לייק ליצירה`}
        >
          <svg className="w-4 h-4 text-[var(--color-gold)] group-hover/like:text-current transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/60 px-2 py-1 rounded opacity-0 group-hover/like:opacity-100 transition-opacity whitespace-nowrap">
            {artwork.likes || 0}
          </span>
        </button>

        {/* Mobile info overlay - always visible with reduced opacity */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <h4 className="text-white text-xs md:text-sm font-heebo font-light line-clamp-1 md:line-clamp-2 mb-1">
            {artwork.prompt}
          </h4>
          <p className="text-[var(--color-gold)] text-xs font-heebo">
            {artwork.user_name}
          </p>
        </div>

        {/* Tap indicator for mobile */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:hidden">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-active:opacity-100 transition-opacity duration-150">
            <span className="text-white text-xs font-medium">הקש לצפייה</span>
          </div>
        </div>
      </figure>
    )
  }

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden min-h-[400px]">
      {/* Show loading indicator until fully loaded */}
      {!imagesLoaded && (
        <div className="absolute inset-0 bg-[var(--color-bg)] flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-[var(--color-muted)] text-sm font-heebo">טוען גלריה...</p>
          </div>
        </div>
      )}
      
      {/* Marquee Gallery - Only show when fully loaded */}
      {imagesLoaded && (
        <>
          {/* Row 1 - Left to Right - Slow for better mobile experience */}
          <Marquee pauseOnHover className="[--duration:30s] py-2">
            {row1.map((artwork, index) => (
              <ArtworkCard key={`row1-${artwork.id}-${index}`} artwork={artwork} />
            ))}
          </Marquee>
          
          {/* Row 2 - Right to Left - Medium slow */}
          <Marquee reverse pauseOnHover className="[--duration:35s] py-2">
            {row2.map((artwork, index) => (
              <ArtworkCard key={`row2-${artwork.id}-${index}`} artwork={artwork} />
            ))}
          </Marquee>
          
          {/* Row 3 - Left to Right - Slowest for easy viewing */}
          <Marquee pauseOnHover className="[--duration:40s] py-2">
            {row3.map((artwork, index) => (
              <ArtworkCard key={`row3-${artwork.id}-${index}`} artwork={artwork} />
            ))}
          </Marquee>
        </>
      )}

      
            {/* Mobile Artwork Viewer Modal */}
            {selectedArtwork && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="relative max-w-4xl max-h-[95vh] w-full">
                  {/* Close Button - Mobile Friendly Position */}
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="absolute top-4 right-4 md:-top-12 md:right-0 text-white hover:text-[var(--color-gold)] transition-colors z-20 bg-black/50 md:bg-transparent rounded-full p-2 md:p-0"
                    aria-label="סגור תצוגת יצירה"
                  >
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

            {/* Navigation Buttons - More Visible */}
            <button
              onClick={() => navigateArtwork(-1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-black p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl z-20 border-2 border-white/20"
              aria-label="יצירה קודמת"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => navigateArtwork(1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-black p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl z-20 border-2 border-white/20"
              aria-label="יצירה הבאה"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Artwork Display */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded overflow-hidden shadow-2xl">
              <div className="relative">
                <img
                  src={selectedArtwork.image_url}
                  alt={selectedArtwork.prompt || 'יצירת אמנות'}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>

              <div className="p-6 bg-[var(--color-gold-muted)] border-t border-[var(--color-gold-border)]">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-heebo font-light text-[var(--color-text)] mb-2 leading-relaxed">
                    {selectedArtwork.prompt}
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-[var(--color-muted)] text-sm font-heebo font-light mb-1">יוצר:</p>
                    <p className="text-[var(--color-text)] font-heebo font-medium">
                      {selectedArtwork.user_name || 'אמן אנונימי'}
                    </p>
      </div>

                  {/* Like Button - Minimalist */}
                  <button
                    onClick={(e) => handleLike(selectedArtwork.id, e)}
                    className="flex items-center gap-3 px-6 py-3 border-2 border-[var(--color-gold)] bg-transparent hover:bg-[var(--color-gold)] text-[var(--color-gold)] hover:text-black transition-all duration-300 font-heebo font-medium"
                    aria-label={`הוסף לייק ליצירה`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>
                      הוסף לייק ({selectedArtwork.likes || 0})
                    </span>
                  </button>

                  {selectedArtwork.created_at && (
                    <div>
                      <p className="text-[var(--color-muted)] text-sm font-heebo font-light mb-1">תאריך:</p>
                      <p className="text-[var(--color-text)] font-heebo font-medium">
                        {new Date(selectedArtwork.created_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
  )
}