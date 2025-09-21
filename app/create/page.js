'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import PromptForm from '../../components/PromptForm'
import UserDetailsModal from '../../components/UserDetailsModal'
import PremiumButton from '../../components/PremiumButton'
import { addToQueue, checkQueueStatus, getCompletedArtwork } from '../../lib/supabaseClient'

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState('prompt') // 'prompt', 'details', 'processing', 'completed', 'waiting'
  const [prompt, setPrompt] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [queueId, setQueueId] = useState(null)
  const [completedArtwork, setCompletedArtwork] = useState(null)
  const [processingStage, setProcessingStage] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [queueLength, setQueueLength] = useState(0)
  const [validationError, setValidationError] = useState(null)

  const processingStages = [
    'מאמתים את הפרטים שלך...',
    'ממקמים את האובייקט בסצנה...',
    'מלטשים את יצירת האומנות...'
  ]

  // טיימר לשלבי העיבוד
  useEffect(() => {
    let interval
    if (step === 'processing') {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1
          
          // שינוי שלב כל 5-10 שניות
          if (newTime === 5) setProcessingStage(1)
          else if (newTime === 15) setProcessingStage(2)
          else if (newTime >= 30) {
            // אחרי 30 שניות עוברים למצב המתנה
            setStep('waiting')
            return 0
          }
          
          return newTime
        })
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [step])

  // בדיקת סטטוס תור כל 5 שניות
  useEffect(() => {
    let interval
    if (queueId && (step === 'processing' || step === 'waiting')) {
      interval = setInterval(async () => {
        try {
          const status = await checkQueueStatus(queueId)
          if (status === 'done') {
            const artwork = await getCompletedArtwork(queueId)
            if (artwork) {
              setCompletedArtwork(artwork)
              setStep('completed')
            }
          }
        } catch (error) {
          console.error('Error checking status:', error)
        }
      }, 5000)
    }
    
    return () => clearInterval(interval)
  }, [queueId, step])

  const triggerWorker = async () => {
    try {
      console.log('Triggering worker...')
      const response = await fetch('/api/worker')
      const result = await response.json()
      
      // בדיקה אם התוכן נחסם
      if (!response.ok && result.error === 'Content blocked') {
        setValidationError({
          reason: result.reason,
          category: result.category
        })
        setStep('validation_error')
        return
      }
      
      // עדכון אורך התור
      setQueueLength(result.queueLength || 0)
      console.log(`Queue length: ${result.queueLength || 0}`)
    } catch (error) {
      console.error('Error triggering worker:', error)
    }
  }

  const handlePromptSubmit = (promptText) => {
    setPrompt(promptText)
    setIsModalOpen(true)
  }

  const handleUserDetailsSubmit = async (userData) => {
    setIsLoading(true)
    setValidationError(null) // איפוס שגיאות קודמות
    
    try {
      const queueData = {
        ...userData,
        prompt: prompt,
        status: 'pending'
      }
      
      const result = await addToQueue(queueData)
      setQueueId(result.id)
      setIsModalOpen(false)
      setStep('processing')
      setElapsedTime(0)
      setProcessingStage(0)
      
      // הפעלת Worker מיידית
      triggerWorker()
    } catch (error) {
      console.error('Error submitting:', error)
      alert('שגיאה בשליחת הבקשה. אנא נסה שוב.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setStep('prompt')
    setValidationError(null)
    setPrompt('')
  }

  const handleBackToGallery = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-with-image text-white overflow-hidden" lang="he">
      {/* Fixed Navigation Header - Similar to Home Page */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/90 border-b border-[var(--color-gold-border)]"
        role="navigation"
        aria-label="ניווט יצירה"
      >
        {/* Logo Section */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex justify-between items-center">
          {/* Back Button */}
          <button
            onClick={handleBackToGallery}
            className="flex items-center gap-2 text-[var(--color-chrome)] hover:text-[var(--color-gold)] transition-all duration-300 group focus:outline-none focus:text-[var(--color-gold)]"
            aria-label="חזור לגלריה הראשית"
          >
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            <span className="font-heebo font-light tracking-wide text-sm md:text-base">חזור לגלריה</span>
          </button>
          
          {/* Logo */}
          <img 
            src="/logo.png" 
            alt="SodaStream Enso" 
            className="h-8 md:h-10 w-auto"
          />
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded border text-xs font-heebo font-light tracking-wide transition-all ${
              step === 'prompt' ? 'border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 text-[var(--color-gold)]' :
              step === 'processing' ? 'border-[var(--color-gold)]/50 bg-[var(--color-gold)]/20 text-[var(--color-text)] animate-pulse' :
              step === 'waiting' ? 'border-[var(--color-chrome)]/30 bg-[var(--color-chrome)]/10 text-[var(--color-chrome)]' :
              step === 'completed' ? 'border-green-400/30 bg-green-400/10 text-green-200' :
              'border-[var(--color-chrome)]/30 bg-[var(--color-chrome)]/10 text-[var(--color-chrome)]'
            }`}>
              {step === 'prompt' && 'מוכן ליצירה'}
              {step === 'processing' && 'יוצר...'}
              {step === 'waiting' && 'בתור'}
              {step === 'completed' && 'הושלם'}
            </div>
          </div>
        </div>
        
        {/* CTA Buttons - Only show during prompt step */}
        {step === 'prompt' && (
          <div className="max-w-7xl mx-auto px-6 md:px-8 pb-4 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="text-[var(--color-gold)] text-sm font-heebo font-light text-center">
              צור יצירת אמנות עם SodaStream Enso
            </div>
            <PremiumButton
              variant="primary"
              onClick={() => window.open('https://sodastream.co.il/products/enso?variant=42858873749582', '_blank')}
              className="text-lg font-heebo font-medium tracking-wide group w-full sm:w-auto"
              aria-label="רכוש את מכשיר SodaStream Enso"
            >
              רכוש עכשיו
            </PremiumButton>
          </div>
        )}
      </nav>

      <div className="container mx-auto px-4 md:px-8 pt-32 md:pt-40 pb-12 relative z-10">

        <div>
          {step === 'prompt' && (
            <div className="max-w-4xl mx-auto transition-all">
              {/* הוראות SodaStream Enso */}
              <div className="mb-12 md:mb-16 text-center">
                <h2 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-6 tracking-wide">
                  צור יצירת אמנות עם SodaStream Enso
                </h2>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-8"></div>
                
                <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-lg p-6 md:p-8 mb-8">
                  <h3 className="text-lg font-heebo font-medium text-[var(--color-text)] mb-4">
                    הוראות חשובות
                  </h3>
                  <p className="text-[var(--color-text)] font-heebo font-light leading-relaxed mb-4">
                    תאר את היצירה שתרצה ליצור – <strong className="text-[var(--color-gold)]">מכשיר Enso תמיד יופיע ביצירה כפי שהוא, ללא שינוי.</strong>
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="text-[var(--color-gold)] font-heebo font-medium mb-2">מה מותר:</h4>
                      <ul className="text-[var(--color-muted)] font-heebo font-light text-sm space-y-1">
                        <li>• נופים וטבע</li>
                        <li>• חפצים וסצנות</li>
                        <li>• בעלי חיים</li>
                        <li>• צבעים ואווירות</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-red-400 font-heebo font-medium mb-2">מה אסור:</h4>
                      <ul className="text-[var(--color-muted)] font-heebo font-light text-sm space-y-1">
                        <li>• אנשים וכל דמות אנושית</li>
                        <li>• תוכן פוליטי</li>
                        <li>• טקסטים וכתובות</li>
                        <li>• תוכן NSFW או אלים</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* טופס פרומפט מעודכן */}
              <PromptForm 
                onSubmit={handlePromptSubmit}
                isLoading={isLoading}
              />
              
            </div>
          )}

          {step === 'processing' && (
            <div className="max-w-3xl mx-auto text-center transition-all">
              <div className="bg-[var(--color-bg)] rounded-lg border border-[var(--color-gold)]/20 p-8 md:p-16">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-light text-[var(--color-text)] mb-2 tracking-wide font-heebo">CREATING ARTWORK</h2>
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
                  
                  {/* Stage indicators */}
                  <div className="flex justify-center items-center gap-2 md:gap-4 mb-6 overflow-x-auto px-4">
                    {processingStages.map((stage, index) => (
                      <div key={index} className="flex items-center flex-shrink-0">
                        <div className={`w-2 md:w-3 h-2 md:h-3 rounded-full border-2 transition-all ${
                          index < processingStage ? 'bg-[var(--color-gold)] border-[var(--color-gold)]' :
                          index === processingStage ? 'bg-[var(--color-gold)]/80 border-[var(--color-gold)] animate-pulse' :
                          'border-[var(--color-muted)]/30'
                        }`}></div>
                        {index < processingStages.length - 1 && (
                          <div className={`w-6 md:w-8 h-px transition-all ${
                            index < processingStage ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-muted)]/20'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium progress bar */}
                <div className="mb-4 md:mb-6">
                  <div className="w-full bg-[var(--color-muted)]/10 rounded-full h-1 mb-2">
                    <div
                      className="bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${(elapsedTime / 30) * 100}%` }}
                    />
                  </div>
                  <div className="text-[var(--color-muted)]/70 text-xs md:text-sm font-light">
                    Processing: {Math.max(30 - elapsedTime, 0)}s remaining
                  </div>
                </div>

                <div className="text-[var(--color-muted)]/50 text-xs font-light tracking-wide">
                  POWERED BY GOOGLE GEMINI 2.5 FLASH IMAGE
                </div>
              </div>
            </div>
          )}

          {step === 'waiting' && (
            <div className="max-w-3xl mx-auto text-center transition-all">
              <div className="bg-[var(--color-bg)] rounded-lg border border-[var(--color-chrome)]/20 p-8 md:p-16">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-light text-[var(--color-text)] mb-2 tracking-wide font-heebo">COMMISSION QUEUED</h2>
                  <div className="w-12 md:w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-chrome)] to-transparent mx-auto"></div>
                  {queueLength > 1 && (
                    <div className="mt-4 text-[var(--color-chrome)] text-sm font-light">
                      {queueLength - 1} יצירות נוספות בתור לפניך
                    </div>
                  )}
                </div>

                <div className="w-20 md:w-24 h-20 md:h-24 mx-auto mb-8 md:mb-12 bg-gradient-to-br from-[var(--color-chrome)]/20 to-[var(--color-chrome)]/10 rounded-full flex items-center justify-center border border-[var(--color-chrome)]/30">
                  <span className="text-xl md:text-2xl text-[var(--color-chrome)]">⏳</span>
                </div>

                <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                  <p className="text-base md:text-lg font-light text-[var(--color-text)] leading-relaxed">
                    Your artwork commission has been queued
                  </p>
                  <p className="text-[var(--color-muted)]/70 font-light leading-relaxed text-sm md:text-base">
                    יצירת האומנות שלך בתור ותוצג בגלריה הציבורית ברגע שתהיה מוכנה
                  </p>
                  
                  {/* Queue status */}
                  <div className="flex justify-center items-center gap-2 py-4">
                    <div className="w-2 h-2 bg-[var(--color-chrome)] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[var(--color-chrome)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[var(--color-chrome)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>

                <button
                  onClick={handleBackToGallery}
                  className="px-6 md:px-8 py-3 bg-gradient-to-r from-[var(--color-gold)]/80 to-[var(--color-gold)] text-black rounded-full hover:scale-105 transition-all transform font-medium tracking-wide text-sm md:text-base"
                >
                  RETURN TO GALLERY
                </button>
              </div>
            </div>
          )}

          {step === 'completed' && completedArtwork && (
            <div className="max-w-5xl mx-auto text-center transition-all">
              <div className="bg-[var(--color-bg)] rounded-lg border border-green-400/20 p-6 md:p-12">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-2 tracking-wide font-heebo">COMMISSION COMPLETED</h2>
                  <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent mx-auto"></div>
                  <p className="text-green-400/80 text-xs md:text-sm font-light mt-4 tracking-wide">
                    יצירת האומנות שלך מוכנה ומוצגת בגלריה
                  </p>
                </div>

                {/* Premium artwork display */}
                <div className="relative mb-6 md:mb-8">
                  <div className="relative max-w-xl md:max-w-2xl mx-auto">
                    {/* Museum frame */}
                    <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-br from-[var(--color-gold)]/10 via-[var(--color-gold)]/5 to-[var(--color-gold)]/10 rounded-lg"></div>
                    <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-br from-black to-gray-900 rounded border border-[var(--color-chrome)]/30"></div>
                    
                    <img
                      src={completedArtwork.image_url}
                      alt="יצירת האומנות שלך"
                      className="relative w-full rounded shadow-2xl"
                    />
                    
                    {/* Gallery lighting */}
                    <div className="absolute -top-4 md:-top-8 left-1/2 transform -translate-x-1/2 w-32 md:w-48 h-4 md:h-8 bg-gradient-to-b from-[var(--color-gold)]/20 to-transparent blur-lg"></div>
                  </div>
                </div>

                {/* Artwork details */}
                <div className="bg-black/40 rounded border border-[var(--color-chrome)]/20 p-4 md:p-6 mb-6 md:mb-8 max-w-xl md:max-w-2xl mx-auto">
                  <div className="text-[var(--color-chrome)]/80 text-xs font-light tracking-wide mb-2 uppercase">Commission Brief</div>
                  <p className="text-[var(--color-muted)]/80 text-sm font-light leading-relaxed text-right">
                    {completedArtwork.prompt}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--color-muted)]/10 flex flex-col md:flex-row justify-between items-center gap-2 text-xs font-light text-[var(--color-muted)]/50">
                    <span>Digital Artwork • 4K Resolution</span>
                    <span>{new Date(completedArtwork.created_at).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
                  <button
                    onClick={handleBackToGallery}
                    className="px-6 md:px-8 py-3 bg-gradient-to-r from-[var(--color-gold)]/80 to-[var(--color-gold)] text-black rounded-full hover:scale-105 transition-all transform font-medium tracking-wide text-sm md:text-base"
                  >
                    VIEW IN GALLERY
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 md:px-8 py-3 bg-[var(--color-chrome)]/20 border border-[var(--color-chrome)]/40 text-[var(--color-text)] rounded-full hover:bg-[var(--color-chrome)]/30 transition-all font-light tracking-wide text-sm md:text-base"
                  >
                    COMMISSION NEW ARTWORK
                  </button>
                </div>

                <div className="mt-6 md:mt-8 text-[var(--color-muted)]/40 text-xs font-light tracking-wide">
                  ARTWORK AUTOMATICALLY ADDED TO PUBLIC GALLERY
                </div>
              </div>
            </div>
          )}

          {step === 'validation_error' && validationError && (
            <div className="max-w-3xl mx-auto text-center transition-all">
              <div className="bg-[var(--color-bg)] rounded-lg border border-red-400/20 p-8 md:p-16">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-light text-[var(--color-text)] mb-2 tracking-wide font-heebo">CONTENT NOT APPROVED</h2>
                  <div className="w-12 md:w-16 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto"></div>
                </div>

                <div className="w-20 md:w-24 h-20 md:h-24 mx-auto mb-8 md:mb-12 bg-gradient-to-br from-red-400/20 to-red-500/10 rounded-full flex items-center justify-center border border-red-400/30">
                  <span className="text-xl md:text-2xl text-red-400">⚠️</span>
                </div>

                <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                  <p className="text-base md:text-lg font-light text-[var(--color-text)] leading-relaxed">
                    התוכן לא מאושר לפי המדיניות
                  </p>
                  <p className="text-red-400/80 font-light leading-relaxed text-sm md:text-base bg-red-400/10 rounded-lg p-4 border border-red-400/20">
                    {validationError.reason}
                  </p>
                  <p className="text-[var(--color-muted)]/70 font-light leading-relaxed text-xs md:text-sm">
                    אנא נסח מחדש את הבקשה שלך ללא תוכן אסור כגון: אנשים, פוליטיקה, סלבריטאים, טקסט, תוכן מיני או אלימות
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
                  <button
                    onClick={handleTryAgain}
                    className="px-6 md:px-8 py-3 bg-gradient-to-r from-[var(--color-gold)]/80 to-[var(--color-gold)] text-black rounded-full hover:scale-105 transition-all transform font-medium tracking-wide text-sm md:text-base"
                  >
                    נסה שוב
                  </button>
                  
                  <button
                    onClick={handleBackToGallery}
                    className="px-6 md:px-8 py-3 bg-[var(--color-chrome)]/20 border border-[var(--color-chrome)]/40 text-[var(--color-text)] rounded-full hover:bg-[var(--color-chrome)]/30 transition-all font-light tracking-wide text-sm md:text-base"
                  >
                    חזור לגלריה
                  </button>
                </div>

                <div className="mt-6 md:mt-8 text-[var(--color-muted)]/40 text-xs font-light tracking-wide">
                  מערכת וידוא אוטומטית • מדיניות תוכן מחמירה
                </div>
              </div>
            </div>
          )}
        </div>

        {/* מודל פרטי משתמש */}
        <UserDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleUserDetailsSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
