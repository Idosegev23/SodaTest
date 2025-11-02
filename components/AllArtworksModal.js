'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AllArtworksModal({ isOpen, onClose }) {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  const [likedArtworks, setLikedArtworks] = useState([])

  useEffect(() => {
    if (isOpen) {
      loadAllArtworks()
      loadLikedArtworks()
    }
  }, [isOpen])

  const loadAllArtworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false })
        // טוען את כל היצירות ללא הגבלה

      if (error) throw error
      setArtworks(data || [])
    } catch (error) {
      console.error('Error loading all artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLikedArtworks = () => {
    const liked = JSON.parse(localStorage.getItem('likedArtworks') || '[]')
    setLikedArtworks(liked)
  }

  const hasUserLiked = (artworkId) => {
    return likedArtworks.includes(artworkId)
  }

  const handleLike = async (artworkId, e) => {
    e.stopPropagation()
    
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
      
      const result = await response.json()
      
      if (response.ok) {
        // Add to liked list
        const newLiked = [...likedArtworks, artworkId]
        setLikedArtworks(newLiked)
        localStorage.setItem('likedArtworks', JSON.stringify(newLiked))
        
        // Reload artworks to get updated like count
        await loadAllArtworks()
        
        // Update selected artwork if it's the one we liked
        if (selectedArtwork && selectedArtwork.id === artworkId) {
          setSelectedArtwork({
            ...selectedArtwork,
            likes: (selectedArtwork.likes || 0) + 1
          })
        }
      } else if (result.alreadyLiked) {
        const newLiked = [...likedArtworks, artworkId]
        setLikedArtworks(newLiked)
        localStorage.setItem('likedArtworks', JSON.stringify(newLiked))
      }
    } catch (error) {
      console.error('Error liking artwork:', error)
    }
  }

  // Check if user is a judge
  const isJudge = (artwork) => {
    const judgesEmails = [
      'dede.confidential@gmail.com',
      'shai.franco@gmail.com',
      'shabo.alon@gmail.com',
      'koketit.us@gmail.com',
      'amir.bavler@gmail.com'
    ]
    return judgesEmails.includes(artwork.user_email?.toLowerCase())
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a1628] rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a1628]/95 backdrop-blur-sm border-b border-[var(--color-gold)]/20 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-rubik font-light text-white">
              כל היצירות
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="סגור"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[var(--color-muted)] font-heebo font-light mt-2">
            {artworks.length} יצירות
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-gold)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="group relative aspect-square cursor-pointer"
                  onClick={() => setSelectedArtwork(artwork)}
                >
                  <img
                    src={artwork.image_url}
                    alt={artwork.prompt || 'יצירת אמנות'}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center p-4">
                    <p className="text-white text-sm font-heebo text-center line-clamp-2 mb-2">
                      {artwork.prompt}
                    </p>
                    <div className="flex items-center gap-2 text-[var(--color-gold)]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="font-heebo text-sm">{artwork.likes || 0}</span>
                    </div>
                  </div>

                  {/* Judge badge */}
                  {isJudge(artwork) && (
                    <div className="absolute top-2 right-2 bg-[var(--color-gold)] px-2 py-1 rounded-full">
                      <span className="text-black text-xs font-heebo font-bold">שופט</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Artwork Detail Modal */}
        {selectedArtwork && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setSelectedArtwork(null)}
          >
            <div 
              className="relative w-full h-full md:h-auto md:max-h-[95vh] md:max-w-4xl bg-[#0a1628] md:rounded-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Fixed position, always visible */}
              <button
                onClick={() => setSelectedArtwork(null)}
                className="fixed top-3 right-3 md:absolute z-50 p-2.5 bg-black/90 hover:bg-black rounded-full transition-colors shadow-2xl border border-white/30"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Navigation Arrows - Fixed on image area */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const currentIndex = artworks.findIndex(a => a.id === selectedArtwork.id)
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : artworks.length - 1
                  setSelectedArtwork(artworks[prevIndex])
                }}
                className="fixed left-2 top-[25%] md:absolute md:left-4 md:top-1/2 -translate-y-1/2 z-40 p-2.5 md:p-3 bg-black/80 hover:bg-black/95 rounded-full transition-colors shadow-xl border border-white/20 pointer-events-auto"
                aria-label="תמונה קודמת"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const currentIndex = artworks.findIndex(a => a.id === selectedArtwork.id)
                  const nextIndex = currentIndex < artworks.length - 1 ? currentIndex + 1 : 0
                  setSelectedArtwork(artworks[nextIndex])
                }}
                className="fixed right-2 top-[25%] md:absolute md:right-4 md:top-1/2 -translate-y-1/2 z-40 p-2.5 md:p-3 bg-black/80 hover:bg-black/95 rounded-full transition-colors shadow-xl border border-white/20 pointer-events-auto"
                aria-label="תמונה הבאה"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Image Section - Fixed at top */}
              <div className="relative bg-black flex-shrink-0">
                <img
                  src={selectedArtwork.image_url}
                  alt={selectedArtwork.prompt}
                  className="w-full h-auto max-h-[35vh] md:max-h-[50vh] object-contain mx-auto"
                />
                
                {/* Judge badge on image */}
                {isJudge(selectedArtwork) && (
                  <div className="absolute top-4 left-4 bg-[var(--color-gold)] px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-black text-xs md:text-sm font-heebo font-bold">שופט</span>
                  </div>
                )}
              </div>
              
              {/* Details Section - Fixed, no scroll */}
              <div className="flex-shrink-0 p-4 md:p-6 space-y-3 md:space-y-4">
                {/* Prompt - Limited to 3 lines */}
                <div>
                  <h3 className="text-white font-heebo font-light text-sm md:text-lg leading-relaxed line-clamp-3" dir="rtl">
                    {selectedArtwork.prompt}
                  </h3>
                </div>
                
                {/* Meta Info */}
                <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-4 text-[var(--color-muted)] font-heebo text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{selectedArtwork.user_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs md:text-sm">{new Date(selectedArtwork.created_at).toLocaleDateString('he-IL', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
                
                {/* Actions - Like Button - Always visible */}
                <div className="flex items-center gap-4 pt-4 pb-4">
                  {isJudge(selectedArtwork) ? (
                    <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 bg-[var(--color-gold)]/20 border border-[var(--color-gold)] rounded-full">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-gold)]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                      <span className="text-[var(--color-gold)] font-heebo font-bold text-sm md:text-base">
                        שופט ({selectedArtwork.likes || 0})
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleLike(selectedArtwork.id, e)}
                      disabled={hasUserLiked(selectedArtwork.id)}
                      className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 border rounded-full transition-all duration-300 font-heebo text-sm md:text-base min-w-[140px] justify-center ${
                        hasUserLiked(selectedArtwork.id)
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/20 text-[var(--color-gold)] cursor-not-allowed opacity-70'
                          : 'border-[var(--color-muted)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 text-white active:scale-95'
                      }`}
                    >
                      <svg className={`w-4 h-4 md:w-5 md:h-5 transition-all flex-shrink-0 ${
                        hasUserLiked(selectedArtwork.id) 
                          ? 'fill-[var(--color-gold)] scale-110' 
                          : 'fill-none stroke-current'
                      }`} viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth={hasUserLiked(selectedArtwork.id) ? 0 : 2}/>
                      </svg>
                      <span className="font-light">
                        {hasUserLiked(selectedArtwork.id) ? `נתת לייק (${selectedArtwork.likes || 0})` : `לייק (${selectedArtwork.likes || 0})`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

