'use client'

import { useRouter } from 'next/navigation'
import BentoGallery from '../components/BentoGallery'
import MarqueeGallery from '../components/MarqueeGallery'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] overflow-hidden flex flex-col" lang="he">
      {/* Premium Navigation - SodaStream Enso */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/90 border-b border-[var(--color-gold-border)]"
        role="navigation"
        aria-label="ניווט ראשי"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex justify-center items-center">
          <h1 className="text-[var(--color-text)] font-playfair text-2xl md:text-3xl font-light tracking-wider">
            SodaStream Enso
          </h1>
        </div>
        
        {/* CTA Buttons */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 pb-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/create')}
            className="px-8 py-3 border-2 border-[var(--color-gold)] text-[var(--color-gold)] text-lg font-heebo font-light tracking-wide rounded-none hover:bg-[var(--color-gold)] hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black"
            aria-label="צור יצירת אמנות חדשה"
          >
            צור יצירת אמנות
          </button>
          <a
            href="https://sodastream.co.il/products/enso?variant=42858873749582"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-[var(--color-gold)] text-black text-lg font-heebo font-medium tracking-wide rounded-none hover:bg-[var(--color-gold)]/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black text-center"
            aria-label="רכוש את מכשיר SodaStream Enso"
          >
            רכוש עכשיו
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-4 relative flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-6xl lg:text-8xl font-playfair font-light text-[var(--color-text)] mb-6 leading-tight tracking-wide">
          SodaStream Enso
        </h2>

        <p className="text-lg md:text-xl text-[var(--color-muted)] font-heebo font-light mb-16 max-w-2xl mx-auto leading-relaxed">
          מכשיר Enso תמיד יופיע ביצירה כפי שהוא, ללא שינוי.
          <br />
          צור יצירות אמנות ייחודיות עם הבינה המלאכותית המתקדמת ביותר.
        </p>

        {/* SodaStream Enso Display with Gold Frame */}
        <div className="relative mb-16 gallery-spotlight">
          <div className="gold-frame p-4 bg-[var(--color-bg)] rounded-lg">
            <img
              src="/file.png"
              alt="מכשיר SodaStream Enso - יופיע בכל יצירה"
              className="w-32 md:w-48 lg:w-64 mx-auto"
              style={{
                filter: 'drop-shadow(0 25px 50px rgba(205, 164, 52, 0.4))',
              }}
            />
          </div>
          <div className="mt-4 text-[var(--color-gold)] font-heebo text-sm tracking-wide">
            מכשיר SodaStream Enso
          </div>
        </div>
      </section>

      {/* Section Title: יצירות נבחרות */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-playfair font-light text-[var(--color-text)] mb-4 tracking-wide">
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
          <h3 className="text-3xl md:text-4xl font-playfair font-light text-[var(--color-text)] mb-4 tracking-wide">
            גלריית יצירות הגולשים
          </h3>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
        </div>
        
        <MarqueeGallery />
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 text-center">
        <button
          onClick={() => router.push('/create')}
          className="px-12 py-4 border-2 border-[var(--color-gold)] text-[var(--color-gold)] text-xl font-heebo font-light tracking-wide rounded-none hover:bg-[var(--color-gold)] hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black"
          aria-label="צור את היצירה שלך עכשיו"
        >
          צור את היצירה שלך עכשיו
        </button>
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
