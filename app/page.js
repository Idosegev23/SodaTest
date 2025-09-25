'use client'

import { useRouter } from 'next/navigation'
import BentoGallery from '../components/BentoGalleryNew'
import MarqueeGallery from '../components/MarqueeGallery'
import { PremiumButton } from '../components/ui/PremiumButton'
import LightRays from '../components/LightRays'

export default function HomePage() {
  const router = useRouter()

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
      {/* Premium Navigation - SodaStream Enso */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/90 border-b border-[var(--color-gold-border)]"
        role="navigation"
        aria-label="ניווט ראשי"
      >
               <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex justify-center items-center">
                 <img 
                   src="/logo.png" 
                   alt="SodaStream Enso" 
                   className="h-8 md:h-10 w-auto"
                 />
               </div>
        
        {/* CTA Buttons */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4 flex flex-row gap-3 md:gap-6 justify-center items-center">
          <PremiumButton
            variant="secondary"
            onClick={() => router.push('/create')}
            className="text-base md:text-lg font-heebo font-light tracking-wide group flex-1 md:flex-none md:w-auto max-w-[200px] md:max-w-none"
            aria-label="צור יצירת אמנות חדשה"
          >
            <span className="hidden sm:inline">צור יצירת אמנות</span>
            <span className="sm:hidden">צור יצירה</span>
          </PremiumButton>
          <PremiumButton
            variant="primary"
            onClick={() => window.open('https://sodastream.co.il/products/enso?variant=42858873749582', '_blank')}
            className="text-base md:text-lg font-heebo font-medium tracking-wide group flex-[1.3] md:flex-none md:w-auto max-w-[240px] md:max-w-none"
            aria-label="רכוש את מכשיר SodaStream Enso"
          >
            <span className="hidden sm:inline">רכוש עכשיו</span>
            <span className="sm:hidden">רכוש</span>
          </PremiumButton>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/imgs/File00005.png"
            alt="SodaStream Enso"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

               {/* Logo - Upper Part - Below Header */}
               <div className="relative z-10 flex-1 flex items-start justify-center pt-72 md:pt-80">
                 <div className="text-center px-4">
                   <img 
                     src="/logo.png" 
                     alt="SodaStream Enso" 
                     className="h-20 md:h-32 lg:h-40 w-auto drop-shadow-2xl"
                   />
                 </div>
               </div>

        {/* Quote and Signature - Left Side */}
        <div className="absolute bottom-4 right-4 md:right-8 z-10 max-w-md px-4 md:px-0">
          {/* Elegant Quote */}
          <p className="text-white/70 font-heebo font-light text-xs md:text-sm leading-loose mb-6 tracking-wider italic text-right px-2" dir="rtl">
            "תמונה פוטו-ריאליסטית בסגנון יפני מינימליסטי בהשראת נאוטו פוקאסאווה: אובייקט יחיד מוצג במרחב שקט ונקי, עם אור טבעי רך, טקסטורות עדינות, פרופורציות מאוזנות ומרחב שלילי נדיב. האווירה רגועה, אלגנטית ועל-זמנית, כמו יצירת אמנות בגלריה."
          </p>
          
          {/* Signature */}
          <img
            src="/imgs/Signature.png"
            alt="חתימה"
            className="h-16 md:h-20 opacity-90 drop-shadow-lg brightness-0 invert"
          />
        </div>
      </section>

            {/* Section Title: יצירות נבחרות */}
            <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
            יצירות נבחרות
          </h3>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
        </div>
        
        {/* Dynamic Bento Gallery */}
        <BentoGallery />
      </section>

      {/* Marquee Gallery - גלריית יצירות הגולשים */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto text-center mb-12 px-4">
          <h3 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
            גלריית יצירות הגולשים
          </h3>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
        </div>
        
        <MarqueeGallery />
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 text-center flex justify-center">
        <PremiumButton
          variant="secondary"
          onClick={() => router.push('/create')}
          className="text-xl font-heebo font-light tracking-wide group px-12 py-4 w-full sm:w-auto max-w-md"
          aria-label="צור את היצירה שלך עכשיו"
        >
          צור את היצירה שלך עכשיו
        </PremiumButton>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 text-center border-t border-[var(--color-gold-border)] mt-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 text-[var(--color-muted)] text-sm font-heebo font-light">
            <a 
              href="/privacy" 
              className="hover:text-[var(--color-gold)] transition-colors focus:outline-none focus:text-[var(--color-gold)]"
              aria-label="מדיניות פרטיות"
            >
              מדיניות פרטיות
            </a>
            <a 
              href="/terms" 
              className="hover:text-[var(--color-gold)] transition-colors focus:outline-none focus:text-[var(--color-gold)]"
              aria-label="תנאי שימוש"
            >
              תנאי שימוש
            </a>
            <a 
              href="/contact" 
              className="hover:text-[var(--color-gold)] transition-colors focus:outline-none focus:text-[var(--color-gold)]"
              aria-label="יצירת קשר"
            >
              יצירת קשר
            </a>
          </div>
          <div className="mt-6 text-[var(--color-muted)]/60 text-xs font-heebo font-light">
            © 2025 SodaStream Enso Campaign • Powered by AI
          </div>
        </div>
      </footer>
    </div>
  )
}
