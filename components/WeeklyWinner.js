'use client'

import { useState, useEffect } from 'react'
import { getArtworks } from '../lib/supabaseClient'

export default function WeeklyWinner() {
  const [winner, setWinner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWinner()
  }, [])

  const loadWinner = async () => {
    try {
      const artworks = await getArtworks()
      
      if (artworks && artworks.length > 0) {
        // Sort by likes (most liked first), then by creation date
        const sortedByLikes = artworks.sort((a, b) => {
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
        
        // Get the winner (first place)
        setWinner(sortedByLikes[0] || null)
      } else {
        setWinner(null)
      }
    } catch (error) {
      console.error('Error loading winner:', error)
      setWinner(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
              זוכה השבוע
            </h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-8"></div>
            <p className="text-lg text-[var(--color-text)] font-heebo font-light leading-relaxed" dir="rtl">
              היצירה שקיבלה את מירב הלייקים השבוע
            </p>
          </div>
          
          {/* Loading State */}
          <div className="relative max-w-lg mx-auto mt-8">
            <div className="relative p-6 bg-gradient-to-br from-[var(--color-gold)]/30 via-[var(--color-gold-dark)]/30 to-[var(--color-gold)]/30 rounded-sm shadow-2xl animate-pulse">
              <div className="relative p-4 bg-gradient-to-br from-[var(--color-gold-dark)]/30 to-[var(--color-gold)]/30 rounded-sm">
                <div className="relative bg-white/10 p-2 rounded-sm">
                  <div className="aspect-square bg-gradient-to-br from-[var(--color-gold)]/20 to-transparent flex items-center justify-center">
                    <span className="text-[var(--color-gold)] font-heebo font-light text-lg">טוען...</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-br from-[var(--color-gold)]/50 to-[var(--color-gold-dark)]/50 px-6 py-2 rounded shadow-lg">
                  <div className="h-4 bg-[var(--color-gold)]/30 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!winner) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
              זוכה השבוע
            </h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-8"></div>
            <p className="text-lg text-[var(--color-text)] font-heebo font-light leading-relaxed" dir="rtl">
              היצירה שקיבלה את מירב הלייקים השבוע
            </p>
          </div>
          
          {/* No Winner State */}
          <div className="relative max-w-lg mx-auto mt-8">
            <div className="relative p-6 bg-gradient-to-br from-[var(--color-gold)] via-[var(--color-gold-dark)] to-[var(--color-gold)] rounded-sm shadow-2xl">
              <div className="relative p-4 bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] rounded-sm">
                <div className="relative bg-white p-2 rounded-sm shadow-inner">
                  <div className="aspect-square bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-gold)]/5 rounded flex items-center justify-center">
                        <span className="text-[var(--color-gold)] font-heebo font-light text-sm">יצירה זוכה בקרוב</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] px-6 py-2 rounded shadow-lg border border-[var(--color-gold-dark)]">
                  <span className="text-[var(--color-bg)] font-heebo font-semibold text-sm tracking-wide">
                    Creator of the Week
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
            זוכה השבוע
          </h3>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-8"></div>
          <p className="text-lg text-[var(--color-text)] font-heebo font-light leading-relaxed" dir="rtl">
            היצירה שקיבלה את מירב הלייקים השבוע
          </p>
        </div>
        
        {/* Winner Card Container */}
        <div className="relative max-w-lg mx-auto mt-8">
          {/* Museum-Style Gold Frame */}
          <div className="relative p-6 bg-gradient-to-br from-[var(--color-gold)] via-[var(--color-gold-dark)] to-[var(--color-gold)] rounded-sm shadow-2xl">
            {/* Inner Frame */}
            <div className="relative p-4 bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] rounded-sm">
              {/* Frame Border Details */}
              <div className="absolute inset-2 border-2 border-[var(--color-gold)]/60 rounded-sm"></div>
              <div className="absolute inset-1 border border-[var(--color-gold)]/30 rounded-sm"></div>
              
              {/* Image Container */}
              <div className="relative bg-white p-2 rounded-sm shadow-inner">
                <div className="relative overflow-hidden rounded-sm">
                  <img
                    src={winner.image_url}
                    alt={winner.prompt || 'יצירת אמנות זוכה'}
                    className="w-full h-auto aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 200)}`
                    }}
                  />
                  
                  {/* Winner Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <div className="text-center w-full">
                      <h4 className="text-lg md:text-xl font-heebo font-medium text-white mb-1">
                        {winner.user_name || 'אמן אנונימי'}
                      </h4>
                      <p className="text-white/90 font-heebo font-light mb-3 text-xs md:text-sm">
                        {winner.prompt || 'יצירת אמנות מרהיבה'}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-[var(--color-gold)]">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className="font-heebo font-medium text-sm">
                          {winner.likes || 0} לייקים
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Museum Plaque */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] px-6 py-2 rounded shadow-lg border border-[var(--color-gold-dark)]">
                <span className="text-[var(--color-bg)] font-heebo font-semibold text-sm tracking-wide">
                  Creator of the Week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
