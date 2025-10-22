'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BentoGallery from '../components/BentoGalleryNew'
import MarqueeGallery from '../components/MarqueeGallery'
import AllArtworksModal from '../components/AllArtworksModal'
import { PremiumButton } from '../components/ui/PremiumButton'
import WeeklyWinner from '../components/WeeklyWinner'
import PromptForm from '../components/PromptForm'
import UserDetailsModal from '../components/UserDetailsModal'
import { addToQueue, checkQueueStatus, getCompletedArtwork, getArtworks } from '../lib/supabaseClient'
import { trackPageView } from '../lib/utils'
import { shareNative } from '../lib/shareUtils'

export default function HomePage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [queueId, setQueueId] = useState(null)
  const [inspirationArtworks, setInspirationArtworks] = useState([])
  const [completedArtwork, setCompletedArtwork] = useState(null)
  const [processingStage, setProcessingStage] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [marqueeArtworks, setMarqueeArtworks] = useState([])
  const [sharingPlatform, setSharingPlatform] = useState(null) // Track which platform is being shared to
  const [showAllArtworksModal, setShowAllArtworksModal] = useState(false)

  // Track page view on mount
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // יצירת session ID ייחודי
        let sessionId = localStorage.getItem('session_id')
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem('session_id', sessionId)
        }

        await fetch('/api/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pagePath: window.location.pathname,
            referrer: document.referrer,
            sessionId: sessionId
          })
        })
      } catch (error) {
        console.error('Error tracking page view:', error)
      }
    }

    trackPageView()
  }, [])

  const processingStages = [
    'מאמתים את הפרטים שלך...',
    'ממקמים את המכשיר בסצנה...',
    'מלטשים את יצירת האומנות...'
  ]

  // טיימר לשלבי העיבוד
  useEffect(() => {
    let interval
    if (isProcessing) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1
          if (newTime === 5) setProcessingStage(1)
          else if (newTime === 15) setProcessingStage(2)
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isProcessing])

  // טעינת יצירות השראה
  useEffect(() => {
    if (isProcessing) {
      getArtworks().then(artworks => {
        const shuffled = artworks.sort(() => 0.5 - Math.random())
        setInspirationArtworks(shuffled.slice(0, 3))
      })
    }
  }, [isProcessing])

  // טעינת יצירות למארקי
  useEffect(() => {
    getArtworks().then(artworks => {
      setMarqueeArtworks(artworks.slice(0, 20))
    })
  }, [])

  // בדיקת סטטוס כל 3 שניות
  useEffect(() => {
    let interval
    if (queueId && isProcessing) {
      interval = setInterval(async () => {
        try {
          const status = await checkQueueStatus(queueId)
          if (status === 'done') {
            const artwork = await getCompletedArtwork(queueId)
            if (artwork) {
              setCompletedArtwork(artwork)
              setIsProcessing(false)
              setShowSuccessPopup(true)
            }
          }
        } catch (error) {
          console.error('Error checking status:', error)
        }
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [queueId, isProcessing])

  useEffect(() => {
    const handleScroll = () => {
      const finalSection = document.getElementById('final-section')
      const navbar = document.querySelector('nav')
      
      if (finalSection && navbar) {
        const rect = finalSection.getBoundingClientRect()
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0
        
        if (isVisible) {
          navbar.style.opacity = '0'
          navbar.style.pointerEvents = 'none'
        } else {
          navbar.style.opacity = '1'
          navbar.style.pointerEvents = 'auto'
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePromptSubmit = (promptText) => {
    setPrompt(promptText)
    setIsModalOpen(true)
  }

  const handleShare = async (platform) => {
    if (!completedArtwork || sharingPlatform) return
    
    try {
      setSharingPlatform(platform)
      
      const result = await shareNative(completedArtwork, platform)
    } catch (error) {
      console.error('Error sharing:', error)
      alert('שגיאה בשיתוף. אנא נסה שוב.')
    } finally {
      setSharingPlatform(null)
    }
  }

  const handleUserDetailsSubmit = async (userData) => {
    setIsLoading(true)
    
    try {
      const queueData = {
        ...userData,
        prompt: prompt,
        status: 'pending'
      }
      
      const result = await addToQueue(queueData)
      
      setQueueId(result.id)
      setIsModalOpen(false)
      setIsLoading(false)
      
      // התחלת מסך טעינה
      setIsProcessing(true)
      setProcessingStage(0)
      setElapsedTime(0)
      
      // Trigger the worker to start processing - with retry
      const triggerWorkerWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const workerResponse = await fetch('/api/worker')
            const workerResult = await workerResponse.json()
            
            // אם הצליח - עצור
            if (workerResponse.ok) break
            
            // אם לא הצליח - המתן ונסה שוב
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          } catch (workerError) {
            console.error(`Error triggering worker (attempt ${i + 1}):`, workerError)
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          }
        }
      }
      
      triggerWorkerWithRetry()
      
    } catch (error) {
      console.error('Error submitting:', error)
      alert('שגיאה בשליחת הבקשה. אנא נסה שוב.')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    trackPageView()
  }, [])

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative" lang="he">

      {/* Success Popup with Share Options */}
      {showSuccessPopup && completedArtwork && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-gold)]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <div className="sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-gold)]/20 p-4 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-heebo font-light text-[var(--color-gold)]">
                🎨 יצירת האמנות שלך מוכנה!
              </h2>
              <button
                onClick={() => {
                  setShowSuccessPopup(false)
                  window.location.reload()
                }}
                className="text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="p-6">
              <div className="relative rounded-lg overflow-hidden border-2 border-[var(--color-gold)]/30 mb-6 max-w-md mx-auto">
                <img
                  src={completedArtwork.image_url}
                  alt={completedArtwork.prompt}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Prompt */}
              <div className="mb-6 p-4 bg-[var(--color-bg)] border border-[var(--color-gold)]/20 rounded-lg">
                <p className="text-sm text-[var(--color-muted)] font-heebo font-light">
                  {completedArtwork.prompt}
                 </p>
               </div>
        
              {/* Share Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-rubik font-light text-[var(--color-text)] mb-6 text-center">
                  שתף את היצירה שלך:
                </h3>
                
                {/* Share Icons in Circles */}
                <div className="flex justify-center gap-4">
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShare('whatsapp')}
                    disabled={sharingPlatform !== null}
                    className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative"
                    title="שתף בווטסאפ"
                  >
                    {sharingPlatform === 'whatsapp' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    )}
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => handleShare('facebook')}
                    disabled={sharingPlatform !== null}
                    className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative"
                    title="שתף בפייסבוק"
                  >
                    {sharingPlatform === 'facebook' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                  </button>

                  {/* Instagram */}
                  <button
                    onClick={() => handleShare('instagram')}
                    disabled={sharingPlatform !== null}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E1306C] via-[#C13584] to-[#833AB4] flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative"
                    title="שתף באינסטגרם"
                  >
                    {sharingPlatform === 'instagram' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Download Button */}
                <a
                  href={completedArtwork.image_url}
                  download={`®ensō-artwork-${completedArtwork.id}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/20 hover:border-[var(--color-gold)]/50 rounded-lg transition-all duration-300 font-rubik group"
                >
                  <svg className="w-5 h-5 text-[var(--color-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-[var(--color-gold)] font-light">הורד תמונה</span>
                </a>
              </div>

              {/* View Gallery Button */}
              <button
                onClick={() => window.location.reload()}
                className="w-full mt-6 px-6 py-3 bg-[var(--color-bg)] border border-[var(--color-gold)]/30 text-[var(--color-text)] rounded-lg hover:bg-[var(--color-gold)]/10 transition-colors font-heebo"
              >
                סיימנו, חזרה לגלריה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Screen Overlay - Premium Design */}
      {isProcessing && (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg)]/98 to-[var(--color-bg)]/95 backdrop-blur-md flex items-center justify-center">
          <div className="max-w-2xl w-full mx-auto px-4 text-center relative">
            {/* כפתור סגירה */}
            <button
              onClick={() => {
                if (confirm('האם אתה בטוח שברצונך לעצור את תהליך היצירה?')) {
                  setIsProcessing(false)
                  setQueueId(null)
                  setElapsedTime(0)
                  setProcessingStage(0)
                }
              }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 md:top-0 md:left-auto md:right-0 md:translate-x-0 text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors z-10 group"
              aria-label="סגור"
            >
              <div className="w-10 h-10 rounded-full border border-[var(--color-gold)]/20 group-hover:border-[var(--color-gold)]/40 flex items-center justify-center transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>

            {/* Main Card */}
            <div className="bg-[var(--color-bg)]/50 backdrop-blur-sm rounded-2xl border border-[var(--color-gold)]/30 p-8 md:p-10 shadow-2xl">
              
              {/* Premium Circular Timer */}
              <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-8">
                {/* Outer rotating ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="var(--color-gold)"
                    strokeWidth="2"
                    strokeOpacity="0.1"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="var(--color-gold)"
                    strokeWidth="2"
                    strokeDasharray="283"
                    strokeDashoffset="0"
                    className="animate-spin origin-center"
                    style={{ animationDuration: '3s', strokeLinecap: 'round' }}
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="283" dur="3s" repeatCount="indefinite" />
                  </circle>
                </svg>

                {/* Middle pulsing circle */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--color-gold)]/20 via-[var(--color-gold)]/10 to-transparent animate-pulse" style={{ animationDuration: '2s' }}></div>

                {/* Inner content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl md:text-5xl font-poppins font-light text-[var(--color-gold)] mb-1 tabular-nums">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm font-rubik font-light text-[var(--color-muted)]">
                    שניות
                  </div>
                </div>

                {/* Orbiting dots */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-[var(--color-gold)] rounded-full -translate-x-1/2 animate-ping"></div>
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-[var(--color-gold)] rounded-full -translate-x-1/2"></div>
                </div>
              </div>

              {/* Title & Status */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-rubik font-light text-[var(--color-text)] mb-3 tracking-wide">
                  יוצר את יצירת האמנות שלך
                </h2>
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-4"></div>
                
                {/* Process stage with smooth transition */}
                <div className="relative h-8 overflow-hidden">
                  <p className="text-sm md:text-base font-rubik font-light text-[var(--color-gold)] transition-all duration-500 animate-pulse">
                    {processingStages[processingStage]}
                  </p>
                </div>
              </div>

              {/* Animated progress dots */}
              <div className="flex justify-center gap-2 mb-8">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[var(--color-gold)]"
                    style={{
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>

              {/* Inspiration Gallery */}
              {inspirationArtworks.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[var(--color-gold)]/20">
                  <h3 className="text-sm md:text-base font-rubik font-light text-[var(--color-text)]/80 mb-4">
                    בזמן ההמתנה • השראה מיצירות אחרות:
                  </h3>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {inspirationArtworks.slice(0, 3).map((artwork, index) => (
                      <div 
                        key={artwork.id || index} 
                        className="group relative aspect-square rounded-lg overflow-hidden border-2 border-[var(--color-gold)]/20 hover:border-[var(--color-gold)]/40 transition-all duration-300"
                      >
                        <img
                          src={artwork.image_url}
                          alt={artwork.prompt || 'יצירת אמנות'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/200/200?random=${index}`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom hint */}
              <div className="mt-6 text-xs md:text-sm text-[var(--color-muted)]/60 font-rubik font-light">
                זמן יצירה משוער: 1-3 דקות
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 1 - Welcome Opening (replaces Hero) */}
      <section className="relative min-h-[60vh] md:min-h-screen flex items-center justify-center px-4 overflow-hidden py-8 md:py-0">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img
            src="/hero.jpg"
            alt="SodaStream ENSŌ"
              className="w-full h-full object-cover object-center md:object-[center_center]"
              loading="eager"
            />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/60 md:bg-black/40"></div>
        </div>

        <div className="max-w-4xl text-center relative z-10 md:pr-[390px] md:pt-[182px] w-full">
          {/* 1. SodaStream Main Logo */}
          <div className="mb-6">
            <img 
              src="/imgs/SodaLogo.png" 
              alt="SodaStream" 
              className="h-10 w-auto mx-auto"
            />
          </div>

          {/* 2. ההרמוניה - לבן */}
          <p className="text-white text-lg md:text-[26px] font-rubik font-light italic tracking-wide mb-4 md:mb-8">
            ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך
          </p>

          {/* 3. ברוכים הבאים ל- */}
          <h1 className="text-4xl md:text-[68px] font-rubik font-light text-white -mb-2 leading-tight" dir="rtl">
            ברוכים הבאים ל-
          </h1>

          {/* 4. ENSŌ Logo */}
          <div className="-mb-2">
                   <img 
                     src="/logo.png" 
              alt="ensō" 
              className="h-32 md:h-48 w-auto mx-auto"
                   />
                 </div>

          {/* 5. Gallery - זהב */}
          <h2 className="text-5xl md:text-[74px] font-rubik text-[var(--color-gold)] mb-4 md:mb-8 leading-tight uppercase tracking-wider" style={{ fontWeight: 100 }}>
            Gallery
          </h2>
          
        </div>
      </section>

      {/* Marquee Strip - Single Row of Artworks */}
      <section className="py-8 overflow-hidden" style={{ transform: 'rotate(3.78deg)', transformOrigin: 'center' }}>
        <div className="flex gap-2 animate-scroll" style={{ width: 'fit-content' }}>
          {/* First set of artworks */}
          {marqueeArtworks.concat(marqueeArtworks).map((artwork, index) => (
            <div 
              key={`marquee-${index}`}
              className="flex-shrink-0 overflow-hidden bg-[var(--color-bg)]/50 backdrop-blur-sm w-[120px] h-[120px] md:w-[197.82px] md:h-[197.82px]"
              style={{ 
                borderRadius: '20px'
              }}
            >
              <img 
                src={artwork.image_url} 
                alt="Artwork"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Decorative Ellipse - covers sections 2,3,4 */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '75vw',
          height: '75vw',
          top: '100vh',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#12294A',
          filter: 'blur(150px)',
          opacity: 0.6,
          zIndex: -1
        }}
      ></div>

      {/* Section 2 - Creation Interface */}
      <section className="py-6 md:py-8 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Stars Icon */}
          <div className="mb-4 md:mb-8 flex justify-center">
            <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[60px] md:h-[60px]">
              <path d="M30 5L32.5 20L40 15L35 22.5L50 25L35 27.5L40 35L32.5 30L30 45L27.5 30L20 35L25 27.5L10 25L25 22.5L20 15L27.5 20L30 5Z" fill="var(--color-gold)"/>
              <circle cx="15" cy="15" r="2" fill="var(--color-gold)"/>
              <circle cx="45" cy="15" r="2" fill="var(--color-gold)"/>
              <circle cx="45" cy="45" r="2" fill="var(--color-gold)"/>
              <circle cx="15" cy="45" r="2" fill="var(--color-gold)"/>
            </svg>
          </div>

          {/* Main Text */}
          <h2 className="text-3xl md:text-[60px] font-rubik text-white mb-4 md:mb-6 leading-tight" dir="rtl">
            כאן אתם לא רק <span className="font-light">צופים</span> <span className="font-bold">אתם יוצרים</span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-[30px] font-rubik font-light text-white/80 mb-6 md:mb-12 max-w-3xl mx-auto leading-relaxed" dir="rtl">
            כתבו כמה מילים על הסגנון, התחושה שתרצו ליצור סביב ה-®ensō, והבינה המלאכותית תהפוך את הרעיון שלכם ליצירה ויזואלית ייחודית.
          </p>

          {/* Image */}
          <div className="mb-6 md:mb-12">
            <img 
              src="/imgs/Group 27.png" 
              alt="Product showcase" 
              className="w-full max-w-3xl mx-auto"
            />
               </div>

          {/* Additional Text */}
          <div className="max-w-3xl mx-auto mb-6 md:mb-12 space-y-3 md:space-y-6 text-white" dir="rtl">
            <p className="text-lg md:text-xl font-rubik font-light leading-relaxed">
              היצירה שלכם תצטרף לגלריה החיה בהמשך העמוד ותהפוך לחלק מהמהלך הכי מדובר בעולמות העיצוב והטכנולוגיה.
            </p>

            <p className="text-lg md:text-xl font-rubik font-light leading-relaxed">
              בכל שבוע העיצוב עם מספר הלייקים הגבוה ביותר יזכה בסדנת קוקטיילים זוגית והזוכה הגדול בכרטיס טיסה זוגי לאירופה וכניסה למוזיאון נבחר.
            </p>

            <p className="text-lg md:text-xl font-rubik font-bold leading-relaxed">
              זו ההזדמנות שלכם לקחת חלק במהלך ייחודי שמטשטש גבולות בין מוצר, אמנות וחדשנות.
            </p>
          </div>
          
          {/* Divider */}
          <div className="my-8 md:my-16">
            <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30"></div>
          </div>

          {/* Form Header */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-3xl md:text-[60px] font-rubik text-white mb-3 md:mb-4 leading-tight" dir="rtl">
              <span className="font-light">העיצוב שלכם</span> <span className="font-bold">מתחיל כאן</span>
            </h3>
            <p className="text-lg md:text-[30px] font-rubik font-light text-white/80 leading-relaxed mb-3 md:mb-4" dir="rtl">
              תארו את העולם שהייתם רוצים לראות סביב מכשיר ה־®ensō
            </p>
            <p className="text-base md:text-[24px] font-rubik font-medium text-[var(--color-gold)] leading-relaxed" dir="rtl">
              השתתפו וקבלו 10% הנחה לרכישת מכשיר ®ensō לזמן מוגבל!
            </p>
          </div>

          {/* Compact Creation Form */}
          <div className="max-w-2xl mx-auto" style={{ borderRadius: '56px', padding: '10px', background: '#12294A' }}>
            <div style={{ borderRadius: '46px', overflow: 'hidden' }}>
              <PromptForm 
                onSubmit={handlePromptSubmit}
                isLoading={isLoading}
                compact={true}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 md:my-16">
            <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30"></div>
          </div>
        </div>
      </section>

      {/* Section 3 - Weekly Winner */}
      <WeeklyWinner />

      {/* Section 4 - Judges Panel - נבחרת השופטים היוקרתית */}
      <section className="py-6 md:py-8 px-4 relative">
        {/* Decorative Ellipse Background */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '90vw',
            height: '90vw',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#12294A',
            filter: 'blur(150px)',
            opacity: 0.6,
            zIndex: 0
          }}
        ></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-3xl md:text-[45px] font-rubik font-light text-white mb-4 md:mb-6 tracking-wide">
              נבחרת השופטים
          </h3>
            
            <p className="text-lg md:text-[30px] font-rubik font-light text-white max-w-5xl mx-auto leading-relaxed mb-3 md:mb-6" dir="rtl">
              נבחרת של אמנים ומעצבים פורצי דרך, שיצרו את השפה הוויזואלית של עולם העיצוב המקומי.
            </p>
            
            <p className="text-lg md:text-[30px] font-rubik font-light text-white max-w-5xl mx-auto leading-relaxed mb-3 md:mb-6" dir="rtl">
              כל אחד מהם מביא פרשנות אחרת למפגש שבין אמנות, טכנולוגיה וחדשנות.
            </p>
            
            <p className="text-base md:text-[22px] font-rubik font-light text-white/80 max-w-5xl mx-auto leading-relaxed" dir="rtl">
              בסיום הפעילות, נבחרת השופטים תבחר את היצירה הייחודית ביותר - ותזכה בפרס הגדול של התחרות- זוג כרטיסי טיסה לאירופה וכניסה למוזיאון עיצוב נבחר.
            </p>
          </div>
          
          {/* Premium Judges Display */}
          <div className="flex flex-wrap justify-center md:grid md:grid-cols-5 gap-4 md:gap-4">
            {/* Mobile: flex wrap with center alignment, Desktop: grid with 5 columns */}
            {/* Judge 1 - Shai Franco */}
            <div className="text-center group w-[45%] md:w-auto">
              <div className="relative w-full aspect-square mx-auto" style={{ borderTopLeftRadius: '56px', borderTopRightRadius: '56px', borderBottomLeftRadius: '56px', borderBottomRightRadius: '26px', overflow: 'hidden' }}>
                <img 
                  src="/imgs/shai.jpeg" 
                  alt="Shai Franco" 
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-4 text-center"
                  style={{
                    background: 'linear-gradient(to top, #12294A 0%, rgba(18, 41, 74, 0.8) 30%, rgba(18, 41, 74, 0.4) 60%, transparent 100%)',
                    borderBottomRightRadius: '26px'
                  }}
                >
                  <h4 className="text-lg font-rubik font-bold text-white mb-1">Shai Franco</h4>
                  <p className="text-sm font-rubik font-light text-white/80" dir="rtl">צלם ואמן ויזואלי</p>
                </div>
              </div>
        </div>
        
            {/* Judge 2 - Koketit */}
            <div className="text-center group w-[45%] md:w-auto">
              <div className="relative w-full aspect-square mx-auto" style={{ borderTopLeftRadius: '56px', borderTopRightRadius: '56px', borderBottomLeftRadius: '56px', borderBottomRightRadius: '26px', overflow: 'hidden' }}>
                <img 
                  src="/imgs/shira.jpeg" 
                  alt="Koketit" 
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-4 text-center"
                  style={{
                    background: 'linear-gradient(to top, #12294A 0%, rgba(18, 41, 74, 0.8) 30%, rgba(18, 41, 74, 0.4) 60%, transparent 100%)',
                    borderBottomRightRadius: '26px'
                  }}
                >
                  <h4 className="text-lg font-rubik font-bold text-white mb-1">Koketit</h4>
                  <p className="text-sm font-rubik font-light text-white/80" dir="rtl">אמנית ויוצרת</p>
                </div>
              </div>
            </div>

            {/* Judge 3 - Alon Shabo */}
            <div className="text-center group w-[45%] md:w-auto">
              <div className="relative w-full aspect-square mx-auto" style={{ borderTopLeftRadius: '56px', borderTopRightRadius: '56px', borderBottomLeftRadius: '56px', borderBottomRightRadius: '26px', overflow: 'hidden' }}>
                <img 
                  src="/imgs/shebo.jpeg" 
                  alt="Alon Shabo" 
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-4 text-center"
                  style={{
                    background: 'linear-gradient(to top, #12294A 0%, rgba(18, 41, 74, 0.8) 30%, rgba(18, 41, 74, 0.4) 60%, transparent 100%)',
                    borderBottomRightRadius: '26px'
                  }}
                >
                  <h4 className="text-lg font-rubik font-bold text-white mb-1">Alon Shabo</h4>
                  <p className="text-sm font-rubik font-light text-white/80" dir="rtl">אמן מולטי-דיסציפלינרי</p>
                </div>
              </div>
            </div>

            {/* Judge 4 - Dede Bandaid */}
            <div className="text-center group w-[45%] md:w-auto">
              <div className="relative w-full aspect-square mx-auto" style={{ borderTopLeftRadius: '56px', borderTopRightRadius: '56px', borderBottomLeftRadius: '56px', borderBottomRightRadius: '26px', overflow: 'hidden' }}>
                <img 
                  src="/imgs/dede.jpeg" 
                  alt="Dede Bandaid" 
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-4 text-center"
                  style={{
                    background: 'linear-gradient(to top, #12294A 0%, rgba(18, 41, 74, 0.8) 30%, rgba(18, 41, 74, 0.4) 60%, transparent 100%)',
                    borderBottomRightRadius: '26px'
                  }}
                >
                  <h4 className="text-lg font-rubik font-bold text-white mb-1">Dede Bandaid</h4>
                  <p className="text-sm font-rubik font-light text-white/80" dir="rtl">אמן רחוב</p>
                </div>
              </div>
            </div>

            {/* Judge 5 - Amir Bavler */}
            <div className="text-center group w-[45%] md:w-auto">
              <div className="relative w-full aspect-square mx-auto" style={{ borderTopLeftRadius: '56px', borderTopRightRadius: '56px', borderBottomLeftRadius: '56px', borderBottomRightRadius: '26px', overflow: 'hidden' }}>
                <img 
                  src="/imgs/amir.jpeg" 
                  alt="Amir Bavler" 
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-4 text-center"
                  style={{
                    background: 'linear-gradient(to top, #12294A 0%, rgba(18, 41, 74, 0.8) 30%, rgba(18, 41, 74, 0.4) 60%, transparent 100%)',
                    borderBottomRightRadius: '26px'
                  }}
                >
                  <h4 className="text-lg font-rubik font-bold text-white mb-1">Amir Bavler</h4>
                  <p className="text-sm font-rubik font-light text-white/80" dir="rtl">מומחה לחדשנות שיווק וחווית לקוח</p>
                </div>
              </div>
            </div>
          </div>

          {/* מרווח */}
          <div className="mt-8 md:mt-16"></div>

          {/* Divider */}
          <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30"></div>
        </div>
      </section>

      {/* Section 5 - User Created Gallery */}
      <section className="py-6 md:py-12">
        <div className="max-w-7xl mx-auto text-center mb-4 md:mb-8 px-4">
          <h3 className="text-xl md:text-3xl font-poppins font-light text-[var(--color-text)] mb-3 md:mb-4 tracking-wide">
            Created by You
          </h3>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
          
          {/* Like encouragement badge */}
          <div className="mt-6 mb-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-gold)]/10 to-[var(--color-gold)]/5 border border-[var(--color-gold)]/30 rounded-full backdrop-blur-sm">
              <svg className="w-5 h-5 text-[var(--color-gold)] fill-current animate-pulse" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-[var(--color-gold)] font-heebo font-light text-sm md:text-base">
                לחצו ❤️ על היצירה המועדפת עליכם
              </span>
            </div>
          </div>
        </div>
        
        <MarqueeGallery />
        
        {/* View All Artworks Button */}
        <div className="text-center mt-8 mb-4">
          <button
            onClick={() => setShowAllArtworksModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-[var(--color-gold)] text-[var(--color-gold)] font-heebo font-light rounded-full hover:bg-[var(--color-gold)]/10 transition-all duration-300 group"
          >
            <span>צפה בכל היצירות</span>
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </section>

      {/* All Artworks Modal */}
      <AllArtworksModal 
        isOpen={showAllArtworksModal} 
        onClose={() => setShowAllArtworksModal(false)} 
      />

      {/* Section 7 - Hero Section (moved to bottom) */}
      <section id="final-section" className="relative min-h-[60vh] md:min-h-screen flex flex-col py-12 md:py-0">
        {/* Background Image - Responsive */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center md:bg-[center_center] bg-no-repeat"
            style={{
              backgroundImage: 'url(/downsection.webp)',
            }}
          ></div>
          {/* Darker overlay for mobile readability */}
          <div className="absolute inset-0 bg-black/50 md:bg-black/20"></div>
        </div>
        
        {/* Content - Centered on mobile, positioned on desktop */}
        <div className="relative z-10 flex-1 flex items-center md:items-start justify-center px-6 md:px-4 md:pl-16 md:pr-[650px] md:pt-10">
          <div className="text-center max-w-xl w-full">
            {/* Quote Text - no quote mark */}
            <p className="text-white font-rubik font-light text-lg md:text-3xl leading-relaxed mb-6 md:mb-8 px-2 md:px-0" dir="rtl">
              ®ensō חושף ממד עמוק יותר של מורשת, מדע, הנדסה ועיצוב – ומשלב בעדינות את עושרם בחיי היומיום – ליצירת חוויית שתייה מושלמת.
            </p>
            
            {/* Signature */}
            <div className="flex justify-center mb-6 md:mb-12">
              <img
                src="/imgs/Signature.png"
                alt="חתימה"
                className="h-12 md:h-16 w-auto"
                style={{ filter: 'brightness(0) saturate(100%) invert(77%) sepia(52%) saturate(408%) hue-rotate(357deg) brightness(98%) contrast(87%)' }}
              />
            </div>

            {/* CTA Button - Transparent with Gold Border */}
            <button
              onClick={() => window.open('https://sodastream.co.il/products/enso?variant=42858873749582', '_blank')}
              className="border-2 border-[var(--color-gold)] bg-transparent text-white font-rubik font-light text-base md:text-xl px-8 md:px-12 py-3 md:py-4 rounded-full hover:bg-[var(--color-gold)]/10 transition-all duration-300"
              aria-label="לפרטים נוספים על מכשיר SodaStream ®ensō"
            >
              לפרטים נוספים לחצו כאן
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-bg)] border-t border-[var(--color-gold-border)] py-8 px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* SodaStream Logo */}
          <div className="mb-6">
            <img 
              src="/imgs/SodaLogo.png" 
              alt="SodaStream" 
              className="h-6 md:h-8 w-auto mx-auto opacity-70"
            />
          </div>
          
          {/* Disclaimer */}
          <div className="mb-4 text-white text-xs font-rubik font-light leading-relaxed max-w-3xl mx-auto" dir="rtl">
            עמוד זה משתמש ביצירת תמונות באמצעות בינה מלאכותית המופעלת על ידי חברת אל.די.אר.אס גרופ בע"מ, ח.פ. 51559692. 
            התמונה שלך עשויה להיות מוצגת באופן פומבי לצורך הצבעה, והיא נשמרת רק למשך תקופת התחרות.
          </div>

          {/* Links */}
          <div className="mb-4 flex justify-center gap-6 flex-wrap">
            <a 
              href="https://sodastream.co.il/pages/מדיניות-פרטיות-אתר"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-gold)] hover:text-[var(--color-gold)]/70 text-xs font-rubik font-light transition-colors"
            >
              מדיניות פרטיות
            </a>
            <span className="text-[var(--color-muted)]/40">|</span>
            <a 
              href="/terms"
              className="text-[var(--color-gold)] hover:text-[var(--color-gold)]/70 text-xs font-rubik font-light transition-colors"
            >
              תקנון התחרות
            </a>
          </div>
          
          <div className="text-[var(--color-muted)]/60 text-xs font-rubik font-light">
            © 2025 SodaStream ®ensō Campaign • Powered by AI
          </div>
        </div>
      </footer>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUserDetailsSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}

