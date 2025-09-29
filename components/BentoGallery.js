'use client'

import { useState, useEffect } from 'react'
import { getArtworks, getImagesFromStorage } from '../lib/supabaseClient'
import MagicBento from './MagicBento'

export default function SymmetricGallery() {
  const [artworks, setArtworks] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    loadArtworks()
    
    // Listen for artwork likes to update in real-time
    const handleArtworkLiked = () => {
      loadArtworks() // Reload to get updated likes and re-sort
    }
    
    window.addEventListener('artworkLiked', handleArtworkLiked)
    
    return () => {
      window.removeEventListener('artworkLiked', handleArtworkLiked)
    }
  }, [])

  const loadArtworks = async () => {
    try {
      // נעדיף תמונות מהטבלה מעל Storage (יש להן מידע מלא יותר)
      const artworksFromDB = await getArtworks()
      
      if (artworksFromDB && artworksFromDB.length > 0) {
        // אם יש תמונות בטבלה, נשתמש רק בהן
        console.log('Using artworks from database:', artworksFromDB.length)
        
        // Sort by likes (most liked first), then by creation date
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
        
        // Take top 7 most liked artworks for Bento Gallery
        setArtworks(sortedByLikes.slice(0, 7))
      } else {
        // רק אם אין תמונות בטבלה, נטען מ-Storage
        console.log('No artworks in database, trying storage...')
        const storageImages = await getImagesFromStorage('artworks')
        
        if (storageImages && storageImages.length > 0) {
          console.log('Using artworks from storage:', storageImages.length)
          const sorted = storageImages.sort((a, b) => {
            if (a.created_at && b.created_at) {
              return new Date(b.created_at) - new Date(a.created_at)
            }
            return (b.id || '').toString().localeCompare((a.id || '').toString())
          })
          setArtworks(sorted.slice(0, 6))
        } else {
          // No artworks found - this should not happen now that we have data in DB
          console.log('No artworks found in database')
          setArtworks([])
        }
      }
    } catch (error) {
      console.error('Error loading artworks:', error)
      // On error, show empty state
      setArtworks([])
    }
  }

  const openPopup = (artwork) => setSelectedImage(artwork)
  const closePopup = () => setSelectedImage(null)
  
  const handleLike = async (artworkId, e) => {
    e.stopPropagation() // Prevent opening popup when clicking like
    
    try {
      const response = await fetch('/api/like-artwork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artworkId }),
      })
      
      if (response.ok) {
        // Reload artworks to get updated likes
        loadArtworks()
        
        // Update selectedImage if it's currently selected
        if (selectedImage && selectedImage.id === artworkId) {
          const updatedArtwork = { ...selectedImage, likes: (selectedImage.likes || 0) + 1 }
          setSelectedImage(updatedArtwork)
        }
      }
    } catch (error) {
      console.error('Error liking artwork:', error)
    }
  }

  return (
    <>
      <section className="px-4 py-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Bento Grid - Symmetric Desktop Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 auto-rows-[150px] md:auto-rows-[200px]">
            {artworks.map((art, index) => {
              // Symmetric layout for desktop with mobile-first approach
              let gridClass = ""
              
              if (index === 0) {
                // Hero image - center-left large square
                gridClass = "col-span-2 row-span-2"
              } else if (index === 1) {
                // Top-right square
                gridClass = "col-span-1 row-span-1"
              } else if (index === 2) {
                // Bottom-right square (completes right column)
                gridClass = "col-span-1 row-span-1"
              } else if (index === 3) {
                // Wide rectangle - spans full width below
                gridClass = "col-span-2 row-span-1"
              } else if (index === 4) {
                // Right side wide rectangle
                gridClass = "col-span-2 row-span-1"
              } else if (index === 5) {
                // Bottom left square
                gridClass = "col-span-1 row-span-1"
              } else if (index === 6) {
                // Bottom right square - completes the symmetry
                gridClass = "col-span-1 row-span-1"
              }
              
              return (
                <figure
                  key={art.id || index}
                  onClick={() => openPopup(art)}
                  className={`relative overflow-hidden cursor-pointer group border border-[var(--color-gold-border)] hover:border-[var(--color-gold)] transition-all duration-300 ${gridClass}`}
                  style={{ minHeight: '100%' }}
                >
                  {/* Gold frame effect for featured artwork */}
                  {index === 0 && (
                    <div className="absolute -inset-1 gold-frame opacity-60"></div>
                  )}
                  
                  {/* Luxury Art Gallery Frame for Main Image */}
                  {index === 0 ? (
                    <div className="relative w-full h-full">
                      {/* Ornate Gold Frame */}
                      <div className="absolute inset-0 p-4 bg-gradient-to-br from-[var(--color-gold)] via-[var(--color-gold)]/90 to-[var(--color-gold)]/80">
                        {/* Frame bevels and details */}
                        <div className="absolute inset-2 border-2 border-[var(--color-gold)]/30 shadow-[inset_0_0_8px_rgba(0,0,0,0.2)]"></div>
                        <div className="absolute inset-1 border border-[var(--color-gold)]/50 shadow-[inset_0_0_4px_rgba(255,255,255,0.3)]"></div>
                        
                        {/* Inner frame recess */}
                        <div className="relative w-full h-full bg-gradient-to-br from-[var(--color-muted)]/20 to-[var(--color-muted)]/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.3)] p-2">
                          <img
                            src={art.image_url}
                            alt={art.prompt || 'יצירת אמנות עם SodaStream ENSŌ'}
                            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 shadow-lg"
                            style={{ 
                              minHeight: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 200)}`
                            }}
                          />
                          {/* Museum glass effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={art.image_url}
                      alt={art.prompt || 'יצירת אמנות עם SodaStream ENSŌ'}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                      style={{ 
                        minHeight: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 200)}`
                      }}
                    />
                  )}
                  
                  {/* Mobile Prompt Overlay - Always Visible */}
                  <div className="absolute bottom-0 left-0 right-0 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 md:p-4">
                    <div className="transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white text-xs md:text-sm font-heebo font-light line-clamp-2 mb-1 md:mb-2 leading-relaxed">
                        {art.prompt}
                      </h3>

                      <div className="flex justify-between items-center">
                        {/* Weekly Winner indicator */}
                        {index === 0 && (
                          <div className="text-[var(--color-gold)] text-xs font-heebo font-medium tracking-wide">
                            ★ הזוכה השבועי
                          </div>
                        )}
                        
                        {/* Show likes count only */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50">
                          <svg 
                            className="w-4 h-4 text-[var(--color-gold)]" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span className="text-white text-xs font-heebo">
                            {art.likes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gallery spotlight effect */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gradient-to-b from-[var(--color-gold-muted)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                </figure>
              )
            })}
          </div>
        </div>
      </section>

            {/* Luxury Gallery Popup Modal */}
            {selectedImage && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={closePopup}
                role="dialog"
                aria-modal="true"
                aria-labelledby="artwork-title"
              >
                <div className="relative max-w-5xl max-h-[95vh] w-full">
                  {/* Close Button - Mobile Friendly Position */}
                  <button
                    onClick={closePopup}
                    className="absolute top-4 right-4 md:-top-12 md:right-0 text-white hover:text-[var(--color-gold)] transition-colors z-20 bg-black/50 md:bg-transparent rounded-full p-2 md:p-0 focus:outline-none focus:text-[var(--color-gold)]"
                    aria-label="סגור תצוגת יצירה"
                  >
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
            
            {/* Museum-style display */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded overflow-hidden shadow-2xl">
              {/* Gallery lighting */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-[var(--color-gold-muted)] to-transparent blur-lg opacity-60"></div>
              
              <div className="relative gold-frame m-4">
                    <img
                      src={selectedImage.image_url}
                      alt={selectedImage.prompt || 'יצירת אמנות עם SodaStream ENSŌ'}
                      className="w-full h-auto max-h-[60vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <div className="p-6 md:p-8 bg-[var(--color-gold-muted)] border-t border-[var(--color-gold-border)]">
                <div className="text-center mb-4">
                  <h2 
                    id="artwork-title"
                    className="text-xl md:text-2xl font-heebo font-light text-[var(--color-text)] mb-2 leading-relaxed"
                  >
                    {selectedImage.prompt}
                  </h2>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
                  <div>
                    <p className="text-[var(--color-muted)] text-sm font-heebo font-light mb-1">יוצר:</p>
                    <p className="text-[var(--color-text)] font-heebo font-medium">
                      {selectedImage.user_name || 'אמן אנונימי'}
                    </p>
                  </div>

                  {selectedImage.created_at && (
                    <div>
                      <p className="text-[var(--color-muted)] text-sm font-heebo font-light mb-1">תאריך:</p>
                      <p className="text-[var(--color-text)] font-heebo font-medium">
                        {new Date(selectedImage.created_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-[var(--color-gold)] text-sm font-heebo font-light">
                      SodaStream ENSŌ Collection
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <svg 
                        className="w-4 h-4 text-[var(--color-gold)]" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="text-[var(--color-gold)] text-sm font-heebo">
                        {selectedImage.likes || 0} לייקים
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
