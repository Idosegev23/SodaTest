'use client'

import { useRouter } from 'next/navigation'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function ContactPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]" lang="he">
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--color-chrome)] hover:text-[var(--color-gold)] transition-all duration-300 group focus:outline-none focus:text-[var(--color-gold)]"
            aria-label="חזור לעמוד הקודם"
          >
            <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            <span className="font-heebo font-light">חזור</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4">
            יצירת קשר
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-4"></div>
          <p className="text-[var(--color-muted)] font-heebo font-light">
            קמפיין SodaStream Enso
          </p>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--color-gold-muted)] border border-[var(--color-gold-border)] rounded-lg p-6 md:p-8 text-center">
            
            <div className="mb-8">
              <h2 className="text-2xl font-heebo font-light text-[var(--color-text)] mb-4">
                צריכים עזרה?
              </h2>
              <p className="text-[var(--color-muted)] font-heebo font-light leading-relaxed">
                לשאלות, בעיות טכניות או בקשות בנוגע לקמפיין SodaStream Enso, 
                אנו כאן לעזור לכם.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-lg p-6">
                <h3 className="text-lg font-heebo font-medium text-[var(--color-gold)] mb-3">
                  שירות לקוחות SodaStream
                </h3>
                <p className="text-[var(--color-muted)] font-heebo font-light mb-4">
                  לשאלות כלליות על המוצר ושירות לקוחות
                </p>
                <a
                  href="https://sodastream.co.il/pages/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-[var(--color-gold)] text-black font-heebo font-medium rounded hover:bg-[var(--color-gold)]/90 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black"
                >
                  פנו לשירות לקוחות
                </a>
              </div>

              <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-lg p-6">
                <h3 className="text-lg font-heebo font-medium text-[var(--color-gold)] mb-3">
                  בעיות טכניות באתר
                </h3>
                <p className="text-[var(--color-muted)] font-heebo font-light mb-4">
                  אם נתקלתם בבעיה ביצירת האמנות או בשימוש באתר
                </p>
                <div className="text-[var(--color-muted)] font-heebo font-light text-sm">
                  אנא נסו לרענן את העמוד או לנסות שוב מאוחר יותר.<br />
                  אם הבעיה נמשכת, פנו לשירות הלקוחות של SodaStream.
                </div>
              </div>

              <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-lg p-6">
                <h3 className="text-lg font-heebo font-medium text-[var(--color-gold)] mb-3">
                  רכישת מכשיר Enso
                </h3>
                <p className="text-[var(--color-muted)] font-heebo font-light mb-4">
                  מעוניינים לרכוש את מכשיר SodaStream Enso?
                </p>
                <a
                  href="https://sodastream.co.il/products/enso?variant=42858873749582"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 border-2 border-[var(--color-gold)] text-[var(--color-gold)] font-heebo font-medium rounded hover:bg-[var(--color-gold)] hover:text-black transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black"
                >
                  רכוש עכשיו
                </a>
              </div>
            </div>

            <div className="border-t border-[var(--color-gold-border)] pt-6">
              <p className="text-[var(--color-muted)] font-heebo font-light text-sm">
                זהו קמפיין שיווקי של SodaStream לקידום מכשיר Enso<br />
                כל הזכויות שמורות לחברת SodaStream
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-[var(--color-gold)] text-black font-heebo font-medium rounded hover:bg-[var(--color-gold)]/90 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black"
          >
            חזור לעמוד הבית
          </button>
        </div>
      </div>
    </div>
  )
}
