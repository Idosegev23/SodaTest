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
import { addToQueue } from '../lib/supabaseClient'

export default function HomePage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  const handleUserDetailsSubmit = async (userData) => {
    setIsLoading(true)
    
    try {
      const queueData = {
        ...userData,
        prompt: prompt,
        status: 'pending'
      }
      
      await addToQueue(queueData)
      setIsModalOpen(false)
      router.push('/create')
    } catch (error) {
      console.error('Error submitting:', error)
      alert('שגיאה בשליחת הבקשה. אנא נסה שוב.')
    } finally {
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

      {/* Premium Navigation - SodaStream ENSŌ */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/90 border-b border-[var(--color-gold-border)] transition-opacity duration-500"
        role="navigation"
        aria-label="ניווט ראשי"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex justify-between items-center">
          {/* Logo - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <img 
                   src="/logo.png" 
                   alt="SodaStream ENSŌ" 
                   className="h-8 md:h-10 w-auto mb-3"
              />
              <p className="text-[var(--color-gold)] text-xs md:text-sm font-heebo font-light tracking-wide">
                ההרמוניה שבין עיצוב לטכנולוgiה פורצת דרך
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Section 1 - Welcome Opening (replaces Hero) */}
      <section className="relative min-h-screen flex items-center justify-center mt-[100px] px-4">
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heebo font-light text-[var(--color-text)] mb-8 tracking-wide leading-relaxed" dir="rtl">
            ברוכים הבאים ל־ENSŌ Gallery<br />
            <span className="text-[var(--color-gold)]">המקום שבו עיצוב פוגש חדשנות</span>
          </h1>
          
          <div className="space-y-4 text-[var(--color-text)] font-heebo font-light text-lg md:text-xl leading-relaxed mb-12" dir="rtl">
            <p>כאן אתם לא רק צופים - אתם יוצרים.</p>
            <p className="text-[var(--color-gold)] font-medium">זו ההזדמנות שלכם לקחת חלק במהלך עולמי שמטשטש גבולות בין מוצר, אמנות וחדשנות.</p>
          </div>

          {/* Call to Action Button */}
          <PremiumButton
            variant="primary"
            onClick={() => router.push('/create')}
            className="text-xl font-heebo font-light tracking-wide group px-12 py-4"
            aria-label="עבור ליצירת יצירת אמנות"
          >
            Design Your Vision
          </PremiumButton>
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

      {/* Section 3 - Weekly Winner (Compact) */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
              יוצר השבוע
            </h3>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
          </div>
          
          <WeeklyWinner />
        </div>
      </section>

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

      {/* Section 5 - Judges (Compact Banner) */}
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

      {/* Section 6 - Hero Section (moved to bottom) */}
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
