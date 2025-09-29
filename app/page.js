'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BentoGallery from '../components/BentoGalleryNew'
import MarqueeGallery from '../components/MarqueeGallery'
import { PremiumButton } from '../components/ui/PremiumButton'
import LightRays from '../components/LightRays'
import LightRaysAdvanced from '../components/LightRaysAdvanced'
import WeeklyWinner from '../components/WeeklyWinner'
import PromptForm from '../components/PromptForm'
import UserDetailsModal from '../components/UserDetailsModal'
import { addToQueue, checkQueueStatus, getCompletedArtwork, getArtworks } from '../lib/supabaseClient'

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
        setInspirationArtworks(shuffled.slice(0, 6))
      })
    }
  }, [isProcessing])

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
              // הודעת הצלחה
              alert('🎨 יצירת האמנות שלך מוכנה! תוכל למצוא אותה בגלריה.')
              // רענון הדף כדי להציג את היצירה החדשה
              window.location.reload()
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
    console.log('handlePromptSubmit called with:', promptText)
    setPrompt(promptText)
    setIsModalOpen(true)
  }

  const handleUserDetailsSubmit = async (userData) => {
    console.log('handleUserDetailsSubmit called with:', userData)
    console.log('Current prompt:', prompt)
    setIsLoading(true)
    
    try {
      const queueData = {
        ...userData,
        prompt: prompt,
        status: 'pending'
      }
      
      console.log('Adding to queue:', queueData)
      const result = await addToQueue(queueData)
      console.log('Queue result:', result)
      
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
            console.log(`Triggering worker... (attempt ${i + 1}/${retries})`)
            const workerResponse = await fetch('/api/worker')
            const workerResult = await workerResponse.json()
            console.log('Worker triggered:', workerResult)
            
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

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative" style={{backgroundColor: 'var(--color-bg)'}} lang="he">
      {/* Animated Light Rays Background */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#8e7845"
        raysSpeed={0.8}
        lightSpread={0.6}
        rayLength={1.5}
        followMouse={true}
        mouseInfluence={0.08}
        noiseAmount={0.05}
        distortion={0.02}
        className="background-rays"
      />

      {/* Processing Screen Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[9999] bg-[var(--color-bg)]/95 backdrop-blur-sm flex items-center justify-center">
          <div className="max-w-3xl w-full mx-auto px-4 text-center relative">
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
              className="absolute top-0 right-4 md:right-0 text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors z-10"
              aria-label="סגור"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="bg-[var(--color-bg)] rounded-lg border border-[var(--color-gold)]/20 p-8 md:p-16">
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-light text-[var(--color-text)] mb-2 tracking-wide font-heebo">יוצר את יצירת האמנות שלך</h2>
                <p className="text-[var(--color-muted)] text-sm mb-3">זמן משוער: 1-3 דקות</p>
                <div className="w-12 md:w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
              </div>

              {/* Premium AI animation */}
              <div className="relative w-24 md:w-32 h-24 md:h-32 mx-auto mb-8 md:mb-12">
                <div className="absolute inset-0 border border-[var(--color-gold)]/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-2 border border-[var(--color-gold)]/20 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-4 border border-[var(--color-gold)]/10 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
                <div className="absolute inset-6 md:inset-8 bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-gold)]/30 rounded-full flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-light text-[var(--color-gold)] tracking-wider font-heebo">AI</span>
                </div>
              </div>

              {/* Process stage */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-light text-[var(--color-text)] mb-4 transition-all">
                  {processingStages[processingStage]}
                </h3>
              </div>

              {/* Infinite progress bar */}
              <div className="mb-4 md:mb-6">
                <div className="w-full bg-[var(--color-muted)]/10 rounded-full h-1 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold)]/80 to-[var(--color-gold)] h-1 rounded-full animate-pulse"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="text-[var(--color-muted)]/70 text-xs md:text-sm font-light">
                  יוצר את יצירת האמנות שלך... ({Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')})
                </div>
              </div>

              <div className="text-[var(--color-muted)]/50 text-xs font-light tracking-wide mb-8">
                POWERED BY GOOGLE GEMINI 2.5 FLASH IMAGE
              </div>

              {/* Inspiration Gallery */}
              {inspirationArtworks.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[var(--color-gold)]/20">
                  <h3 className="text-sm md:text-base font-heebo font-light text-[var(--color-gold)] mb-4">
                    בזמן שאנחנו יוצרים, קבל השראה מיצירות אחרות:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {inspirationArtworks.map((artwork, index) => (
                      <div 
                        key={artwork.id || index} 
                        className="relative aspect-square rounded-lg overflow-hidden border border-[var(--color-gold)]/20 hover:border-[var(--color-gold)]/40 transition-all group"
                      >
                        <img
                          src={artwork.image_url}
                          alt={artwork.prompt || 'יצירת אמנות'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/300/300?random=${index}`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-heebo font-light line-clamp-2">
                              {artwork.prompt || 'יצירה מרהיבה'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 1 - Welcome Opening (replaces Hero) */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* ENSŌ Visual Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-radial from-[var(--color-gold)]/20 via-transparent to-transparent"></div>
          {/* Large ENSŌ Product Visual */}
          <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 z-0">
            <img 
              src="/file.png" 
              alt="SodaStream ENSŌ Product" 
              className="w-64 md:w-96 lg:w-[500px] h-auto object-contain opacity-30 transform rotate-12"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Logo and Tagline */}
          <div className="mb-12">
                 <img 
                   src="/logo.png" 
              alt="SodaStream ENSŌ" 
              className="h-16 md:h-20 lg:h-24 w-auto mx-auto mb-6"
                 />
            <p className="text-[var(--color-gold)] text-base md:text-lg font-heebo font-light tracking-wide">
                   ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך
                 </p>
               </div>
        
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heebo font-light text-[var(--color-text)] mb-8 tracking-wide leading-relaxed" dir="rtl">
            ברוכים הבאים ל־ENSŌ Gallery<br />
            <span className="text-[var(--color-gold)]">המקום שבו עיצוב פוגש חדשנות</span>
          </h1>
          
          <div className="space-y-4 text-[var(--color-text)] font-heebo font-light text-lg md:text-xl leading-relaxed mb-12" dir="rtl">
            <p>כאן אתם לא רק צופים - אתם יוצרים.</p>
            <p className="text-[var(--color-gold)] font-medium">זו ההזדמנות שלכם לקחת חלק במהלך עולמי שמטשטש גבולות בין מוצר, אמנות וחדשנות.</p>
               </div>
        </div>
      </section>

      {/* Section 2 - Creation Interface (Optional - if feasible) */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent to-[var(--color-bg)]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
              צור כאן את היצירה שלך
            </h2>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
          </div>
          
          {/* Compact Creation Form */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-lg p-6">
            <PromptForm 
              onSubmit={handlePromptSubmit}
              isLoading={isLoading}
              compact={true}
            />
          </div>
        </div>
      </section>

      {/* Section 3 - Weekly Winner */}
      <WeeklyWinner />

      {/* Section 4 - Selected Artworks (Compact Row) */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
              התמונות שהכי אהבתם
            </h3>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-4"></div>
            <p className="text-[var(--color-muted)] font-heebo font-light text-sm md:text-base max-w-2xl mx-auto" dir="rtl">
              כאן תוכלו לראות את היצירות שקיבלו את מירב הלייקים. מצאתם יצירה שאהבתם? תנו לה לייק ❤️
            </p>
          </div>
          
          {/* Horizontal Row of Artworks */}
          <div className="overflow-x-auto pb-4">
            <BentoGallery compact={true} />
          </div>
        </div>
      </section>

      {/* Section 5 - Marquee Gallery - גלריית יצירות הגולשים */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto text-center mb-8 px-4">
          <h3 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
            גלריית יצירות הגולשים
          </h3>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
        </div>
        
        <MarqueeGallery />
      </section>

      {/* Section 6 - Judges (Compact Banner) */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
              נבחרת השופטים
            </h3>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
          </div>
          
          {/* Compact Judges Banner */}
          <div className="flex justify-center items-center gap-8 md:gap-12">
            {/* Judge 1 - Shai Franco */}
            <div className="text-center">
              <div className="w-16 md:w-20 h-16 md:h-20 mx-auto rounded-full overflow-hidden border border-[var(--color-gold)]/50 mb-2">
                <img 
                  src="/imgs/franco.jpeg" 
                  alt="Shai Franco" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs md:text-sm font-heebo font-light text-[var(--color-text)]">Shai Franco</p>
            </div>

            {/* Judge 2 - Shira Barzilay */}
            <div className="text-center">
              <div className="w-16 md:w-20 h-16 md:h-20 mx-auto rounded-full overflow-hidden border border-[var(--color-gold)]/50 mb-2">
                <img 
                  src="/imgs/shira.jpeg" 
                  alt="Shira Barzilay" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs md:text-sm font-heebo font-light text-[var(--color-text)]">Shira Barzilay</p>
            </div>

            {/* Judge 3 - Alon Shabo */}
            <div className="text-center">
              <div className="w-16 md:w-20 h-16 md:h-20 mx-auto rounded-full overflow-hidden border border-[var(--color-gold)]/50 mb-2">
                <img 
                  src="/imgs/shebo.jpeg" 
                  alt="Alon Shabo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs md:text-sm font-heebo font-light text-[var(--color-text)]">Alon Shabo</p>
            </div>

            {/* Judge 4 - Dede Bandaid */}
            <div className="text-center">
              <div className="w-16 md:w-20 h-16 md:h-20 mx-auto rounded-full overflow-hidden border border-[var(--color-gold)]/50 mb-2">
                <img 
                  src="/imgs/dede.jpeg" 
                  alt="Dede Bandaid" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs md:text-sm font-heebo font-light text-[var(--color-text)]">Dede Bandaid</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 - Hero Section (moved to bottom) */}
      <section id="final-section" className="relative min-h-screen flex flex-col">
        {/* Light Rays Effect */}
        <div className="absolute inset-0 z-1">
          <LightRaysAdvanced
            rayPos={{ x: 0.5, y: 1.0 }}
            rayDir={{ x: 0, y: -1 }}
            raysColor={[1.0, 0.8, 0.4]}
            raysSpeed={0.3}
            lightSpread={0.3}
            rayLength={0.8}
            pulsating={0.0}
            fadeDistance={0.6}
            saturation={1.2}
            mouseInfluence={0.0}
            noiseAmount={0.0}
            distortion={0.0}
            className="w-full h-full"
          />
        </div>

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/hero.webp" type="image/webp" />
            <img
              src="/hero.jpg"
              alt="SodaStream ENSŌ"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </picture>
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Logo and Product - Centered */}
        <div className="relative z-10 flex-1 flex items-center justify-center pt-32 md:pt-40">
          <div className="text-center px-4">
                   <img 
                     src="/logo.png" 
              alt="SodaStream ENSŌ" 
              className="h-16 md:h-24 lg:h-32 w-auto drop-shadow-2xl mx-auto mb-8"
            />
            
            {/* Quote */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 md:p-8 max-w-2xl mx-auto mb-8">
              <p className="text-white/80 font-heebo font-light text-sm md:text-base leading-relaxed tracking-wider italic text-center" dir="rtl">
                "ENSŌ<sup className="text-[var(--color-gold)] text-xs">®</sup> חושף ממד עמוק יותר של מורשת, מדע, הנדסה ועיצוב – ומשלב בעדינות את עושרם בחיי היומיום – ליצירת חוויית שתייה מושלמת."
            </p>
            
            {/* Signature */}
              <div className="flex justify-center mt-6">
              <img
                src="/imgs/Signature.png"
                alt="חתימה"
                  className="h-8 md:h-12 w-auto filter invert"
              />
              </div>
            </div>

            {/* CTA Button */}
            <PremiumButton
              variant="secondary"
              onClick={() => window.open('https://sodastream.co.il/products/enso?variant=42858873749582', '_blank')}
              className="text-xl font-heebo font-light tracking-wide group px-12 py-4"
              aria-label="לפרטים נוספים על מכשיר SodaStream ENSŌ"
            >
              לפרטים נוספים לחצו כאן
            </PremiumButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-bg)] border-t border-[var(--color-gold-border)] py-8 px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mt-6 text-[var(--color-muted)]/60 text-xs font-heebo font-light">
            © 2025 SodaStream ENSŌ Campaign • Powered by AI
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
