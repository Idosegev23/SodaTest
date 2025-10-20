'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowRightIcon, ShareIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../../lib/supabaseClient'
import { shareNative } from '../../../lib/shareUtils'

export default function ArtworkPage() {
  const router = useRouter()
  const params = useParams()
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sharingPlatform, setSharingPlatform] = useState(null)

  useEffect(() => {
    if (params.id) {
      loadArtwork(params.id)
    }
  }, [params.id])

  const loadArtwork = async (id) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error loading artwork:', error)
        setError('יצירה לא נמצאה')
        return
      }

      setArtwork(data)
    } catch (err) {
      console.error('Error:', err)
      setError('שגיאה בטעינת היצירה')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (platform) => {
    if (!artwork || sharingPlatform) return
    
    try {
      setSharingPlatform(platform)
      console.log(`Sharing to ${platform}...`)
      
      const result = await shareNative(artwork, platform)
      
      console.log('Share result:', result)
      
      if (result.success) {
        // Optional: show success feedback
        console.log(`Successfully shared via ${result.method}`)
      }
    } catch (error) {
      console.error('Error sharing:', error)
      alert('שגיאה בשיתוף. אנא נסה שוב.')
    } finally {
      setSharingPlatform(null)
    }
  }

  const handleBackToGallery = () => {
    router.push('/')
  }

  const handleCreateNew = () => {
    router.push('/create')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center" lang="he">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-muted)] font-heebo font-light">טוען יצירה...</p>
        </div>
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4" lang="he">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--color-gold-muted)] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-heebo font-light text-[var(--color-text)] mb-4">
            יצירה לא נמצאה
          </h1>
          <p className="text-[var(--color-muted)] font-heebo font-light mb-8">
            {error || 'היצירה שחיפשת אינה קיימת או הוסרה'}
          </p>
          <button
            onClick={handleBackToGallery}
            className="px-8 py-3 bg-[var(--color-gold)] text-black font-heebo font-medium rounded hover:bg-[var(--color-gold)]/90 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black"
          >
            חזור לגלריה
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] overflow-hidden" lang="he">
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
          <button
            onClick={handleBackToGallery}
            className="flex items-center gap-2 md:gap-3 text-[var(--color-chrome)] hover:text-[var(--color-gold)] transition-all duration-300 group focus:outline-none focus:text-[var(--color-gold)]"
            aria-label="חזור לגלריה הראשית"
          >
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            <span className="font-heebo font-light tracking-wide text-sm md:text-base">חזור לגלריה</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] tracking-wide">
              SodaStream Enso
            </h1>
            <div className="text-[var(--color-gold)] text-sm font-heebo font-light mt-1">
              יצירת אמנות
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ShareIcon className="w-5 h-5 text-[var(--color-muted)]" />
            <span className="text-[var(--color-muted)] text-sm font-heebo font-light">שתף</span>
          </div>
        </div>

        {/* Artwork Display */}
        <div className="max-w-4xl mx-auto">
          {/* Main Artwork with Gold Frame */}
          <div className="relative mb-8 md:mb-12 gallery-spotlight">
            <div className="gold-frame p-4 md:p-6 bg-[var(--color-bg)] rounded-lg">
              <img
                src={artwork.image_url}
                alt={`יצירת אמנות: ${artwork.prompt}`}
                className="w-full h-auto max-h-[70vh] object-contain mx-auto rounded"
                onError={(e) => {
                  e.target.src = '/file.png' // Fallback to SodaStream Enso image
                }}
              />
            </div>
            
            {/* Gallery Label */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[var(--color-bg)] border border-[var(--color-gold-border)] px-4 py-2 rounded">
              <div className="text-[var(--color-gold)] text-xs font-heebo font-light tracking-wide text-center">
                SodaStream Enso Collection
              </div>
            </div>
          </div>

          {/* Artwork Details */}
          <div className="bg-[var(--color-gold-muted)] border border-[var(--color-gold-border)] rounded-lg p-6 md:p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-heebo font-light text-[var(--color-text)] mb-2">
                פרטי היצירה
              </h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[var(--color-gold)] font-heebo font-medium mb-2">תיאור היצירה:</h3>
                <p className="text-[var(--color-text)] font-heebo font-light leading-relaxed text-lg">
                  {artwork.prompt}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-gold-border)]">
                <div>
                  <h4 className="text-[var(--color-muted)] font-heebo font-medium text-sm mb-1">יוצר:</h4>
                  <p className="text-[var(--color-text)] font-heebo font-light">
                    {artwork.user_name || 'אמן אנונימי'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-[var(--color-muted)] font-heebo font-medium text-sm mb-1">תאריך יצירה:</h4>
                  <p className="text-[var(--color-text)] font-heebo font-light">
                    {new Date(artwork.created_at).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-lg p-6 mb-8">
            <h3 className="text-lg font-heebo font-light text-[var(--color-text)] mb-4 text-center">
              שתף את היצירה
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleShare('instagram')}
                disabled={sharingPlatform !== null}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="שתף באינסטגרם"
              >
                {sharingPlatform === 'instagram' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-heebo font-medium">מכין...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">📷</span>
                    <span className="font-heebo font-medium">אינסטגרם</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                disabled={sharingPlatform !== null}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="שתף בפייסבוק"
              >
                {sharingPlatform === 'facebook' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-heebo font-medium">מכין...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">📘</span>
                    <span className="font-heebo font-medium">פייסבוק</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                disabled={sharingPlatform !== null}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="שתף בווטסאפ"
              >
                {sharingPlatform === 'whatsapp' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-heebo font-medium">מכין...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">💬</span>
                    <span className="font-heebo font-medium">וואטסאפ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCreateNew}
              className="px-8 py-4 bg-[var(--color-gold)] text-black text-lg font-heebo font-medium tracking-wide rounded hover:bg-[var(--color-gold)]/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black"
              aria-label="צור יצירה נוספת"
            >
              צור יצירה נוספת
            </button>
            
            <a
              href="https://sodastream.co.il/products/enso?variant=42858873749582"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-[var(--color-gold)] text-[var(--color-gold)] text-lg font-heebo font-light tracking-wide rounded hover:bg-[var(--color-gold)] hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black text-center"
              aria-label="רכוש את מכשיר SodaStream Enso"
            >
              רכוש SodaStream Enso
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
