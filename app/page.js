'use client'

import { useRouter } from 'next/navigation'
import BentoGallery from '../components/BentoGallery'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] overflow-hidden flex flex-col">
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/80 border-b border-[var(--color-chrome)]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
          <div className="text-[var(--color-text)] font-light tracking-wider text-lg">
            ARTISAN AI
          </div>
          <div className="text-[var(--color-muted)] text-xs font-light opacity-70">
            ©2025 Digital Intelligence
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-extralight text-[var(--color-text)] mb-6 leading-tight tracking-wide font-playfair">
          Commission <br />
          <span className="text-[var(--color-gold)] italic">Original</span> <br />
          Artwork
        </h1>

        <p className="text-base md:text-lg text-[var(--color-muted)] font-light mb-12 max-w-md mx-auto leading-relaxed">
          שלב את האובייקט שלך בתוך יצירת אמנות ייחודית.
          <br />
          בינה מלאכותית פוגשת חזון אמנותי.
        </p>

        {/* Object Display */}
        <div className="relative mb-12">
          <img
            src="/file.png"
            alt="Your Object"
            className="w-28 md:w-44 lg:w-56 mx-auto drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(184, 134, 11, 0.3))',
            }}
          />
        </div>

        {/* Main CTA */}
        <button
          onClick={() => router.push('/create')}
          className="px-10 py-4 w-full max-w-xs border border-[var(--color-gold)] text-[var(--color-gold)] text-base md:text-lg font-light tracking-wide rounded-full hover:bg-[var(--color-gold)]/10 transition-all duration-500 hover:border-[var(--color-gold)] hover:shadow-lg hover:shadow-[var(--color-gold)]/20"
        >
          Begin Commission
        </button>
      </section>

      {/* Dynamic Bento Gallery */}
      <BentoGallery />

      {/* Minimal Footer */}
      <footer className="py-10 px-4 text-center border-t border-[var(--color-chrome)]/10 mt-auto">
        <div className="text-[var(--color-muted)]/50 text-xs font-light">
          Powered by Artificial Intelligence • Made with Precision
        </div>
      </footer>
    </div>
  )
}
