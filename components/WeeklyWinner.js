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
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-8 tracking-wide">
            הזוכה השבועי
          </h3>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-12"></div>
          
          <div className="flex justify-center">
            <span className="text-[var(--color-gold)] font-heebo font-light text-lg">טוען...</span>
          </div>
        </div>
      </section>
    )
  }

  if (!winner) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-8 tracking-wide">
            הזוכה השבועי
          </h3>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-12"></div>
          
          <div className="flex justify-center">
            <span className="text-[var(--color-muted)] font-heebo font-light text-lg">בקרוב ייבחר הזוכה השבועי</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* כותרת הזוכה השבועי */}
        <h3 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-8 tracking-wide">
          הזוכה השבועי
        </h3>
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-12"></div>
        
        {/* מסגרת עם תמונה */}
        <div className="relative max-w-lg mx-auto">
          {/* תמונת המסגרת כרקע */}
          <img 
            src="/imgs/frame.png" 
            alt="מסגרת זהב" 
            className="w-full h-auto"
          />
          
          {/* התמונה של הזוכה בתוך המסגרת */}
          <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12">
            <img
              src={winner.image_url}
              alt={winner.prompt || 'יצירת אמנות זוכה'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 200)}`
              }}
            />
          </div>
        </div>

        {/* פרטי הזוכה */}
        <div className="mt-8">
          <h4 className="text-xl md:text-2xl font-heebo font-medium text-[var(--color-text)] mb-2">
            {winner.user_name || 'אמן אנונימי'}
          </h4>
          <p className="text-[var(--color-muted)] font-heebo font-light mb-4 max-w-2xl mx-auto" dir="rtl">
            {winner.prompt || 'יצירת אמנות מרהיבה'}
          </p>
          <div className="flex items-center justify-center gap-2 text-[var(--color-gold)]">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="font-heebo font-medium text-lg">
              {winner.likes || 0} לייקים
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}