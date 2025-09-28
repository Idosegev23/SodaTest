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
        
        // Take artworks 2-8 (skip the winner, show places 2-8)
        setArtworks(sortedByLikes.slice(1, 8))
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
  
  // Check if user already liked this artwork
  const hasUserLiked = (artworkId) => {
    const likedArtworks = JSON.parse(localStorage.getItem('likedArtworks') || '[]')
    return likedArtworks.includes(artworkId)
  }

  // Add artwork to liked list
  const addToLikedList = (artworkId) => {
    const likedArtworks = JSON.parse(localStorage.getItem('likedArtworks') || '[]')
    if (!likedArtworks.includes(artworkId)) {
      likedArtworks.push(artworkId)
      localStorage.setItem('likedArtworks', JSON.stringify(likedArtworks))
    }
  }
  
  const handleLike = async (artworkId, e) => {
    e.stopPropagation() // Prevent opening popup when clicking like
    
    // Check if user already liked this artwork
    if (hasUserLiked(artworkId)) {
      return
    }
    
    try {
      const response = await fetch('/api/like-artwork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artworkId }),
      })
      
      if (response.ok) {
        // Add to liked list in localStorage
        addToLikedList(artworkId)
        
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
      <section className="px-2 py-4">
        <MagicBento 
          artworks={artworks}
          onArtworkClick={openPopup}
          onLike={handleLike}
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={200}
          particleCount={6}
          glowColor="142, 120, 69" // Our gold color
        />
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
                  alt={selectedImage.prompt || 'יצירת אמנות'}
                  className="w-full h-auto max-h-[60vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <div className="p-6 md:p-8 bg-[var(--color-gold-muted)] border-t border-[var(--color-gold-border)]">
                <div className="text-center mb-4">
                  <h2 
                    id="artwork-title"
                    className="text-xl md:text-2xl font-light text-[var(--color-text)] mb-2 leading-relaxed"
                  >
                    {selectedImage.prompt}
                  </h2>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
                  <div>
                    <p className="text-[var(--color-muted)] text-sm font-light mb-1">יוצר:</p>
                    <p className="text-[var(--color-text)] font-medium">
                      {selectedImage.user_name || 'אמן אנונימי'}
                    </p>
                  </div>

                  {selectedImage.created_at && (
                    <div>
                      <p className="text-[var(--color-muted)] text-sm font-light mb-1">תאריך:</p>
                      <p className="text-[var(--color-text)] font-medium">
                        {new Date(selectedImage.created_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-[var(--color-gold)] text-sm font-light mb-3">
                      Digital Art Collection
                    </p>
                    <button
                      onClick={(e) => handleLike(selectedImage.id, e)}
                      className={`flex items-center gap-3 px-6 py-3 border backdrop-blur-sm rounded transition-all duration-300 font-heebo font-light mx-auto ${
                        hasUserLiked(selectedImage.id)
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/20 text-[var(--color-gold)] cursor-default opacity-70'
                          : 'border-[var(--color-gold)]/40 bg-black/20 hover:bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:border-[var(--color-gold)]'
                      }`}
                      aria-label={hasUserLiked(selectedImage.id) ? `כבר נתת לייק ליצירה` : `תן לייק ליצירה`}
                    >
                      <svg className={`w-4 h-4 fill-current ${
                        hasUserLiked(selectedImage.id) ? 'scale-110' : ''
                      }`} viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="tracking-wide text-sm">
                        {hasUserLiked(selectedImage.id) ? 'נתת לייק' : 'תן לייק'} ({selectedImage.likes || 0})
                      </span>
                    </button>
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
