'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AllArtworksModal({ isOpen, onClose }) {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArtwork, setSelectedArtwork] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadAllArtworks()
    }
  }, [isOpen])

  const loadAllArtworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // הגבלה של 100 יצירות אחרונות

      if (error) throw error
      setArtworks(data || [])
    } catch (error) {
      console.error('Error loading all artworks:', error)
    } finally {
      setLoading(false)
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
            {artworks.length} יצירות אחרונות
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
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-20"
            onClick={() => setSelectedArtwork(null)}
          >
            <div 
              className="relative max-w-2xl w-full bg-[#0a1628] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <img
                src={selectedArtwork.image_url}
                alt={selectedArtwork.prompt}
                className="w-full aspect-square object-cover"
              />
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-white font-heebo font-light text-lg mb-2" dir="rtl">
                    {selectedArtwork.prompt}
                  </h3>
                  <p className="text-[var(--color-muted)] font-heebo font-light text-sm">
                    נוצר על ידי: {selectedArtwork.user_name}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-[var(--color-gold)]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="font-heebo">{selectedArtwork.likes || 0} לייקים</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

