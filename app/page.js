'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ThankYouPage() {
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (password === '123456') {
      // Redirect to gallery page
      router.push('/gallery')
    } else {
      setError('סיסמה שגויה. נסה שוב.')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative bg-[var(--color-bg)]" lang="he">
      {/* Background decorative element */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '80vw',
          height: '80vw',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#12294A',
          filter: 'blur(150px)',
          opacity: 0.4,
          zIndex: 0
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full mx-auto text-center">
          {/* Logo */}
          <div className="mb-12">
            <img 
              src="/imgs/SodaLogo.png" 
              alt="SodaStream" 
              className="h-12 md:h-16 w-auto mx-auto mb-6"
            />
            <img 
              src="/logo.png" 
              alt="ensō" 
              className="h-24 md:h-32 w-auto mx-auto"
            />
          </div>

          {/* Stars Icon */}
          <div className="mb-8 flex justify-center">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[80px] md:h-[80px]">
              <path d="M30 5L32.5 20L40 15L35 22.5L50 25L35 27.5L40 35L32.5 30L30 45L27.5 30L20 35L25 27.5L10 25L25 22.5L20 15L27.5 20L30 5Z" fill="var(--color-gold)"/>
              <circle cx="15" cy="15" r="2" fill="var(--color-gold)"/>
              <circle cx="45" cy="15" r="2" fill="var(--color-gold)"/>
              <circle cx="45" cy="45" r="2" fill="var(--color-gold)"/>
              <circle cx="15" cy="45" r="2" fill="var(--color-gold)"/>
            </svg>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-rubik font-light text-white mb-6 leading-tight" dir="rtl">
            תודה רבה 
            <br />
            <span className="text-[var(--color-gold)] font-bold">לכל המשתתפים!</span>
          </h1>

          {/* Divider */}
          <div className="my-8">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
          </div>

          {/* Message */}
          <div className="max-w-3xl mx-auto space-y-6 mb-12" dir="rtl">
            <p className="text-xl md:text-3xl font-rubik font-light text-white leading-relaxed">
              הפעילות הסתיימה והיצירתיות שלכם הייתה מדהימה!
            </p>
            
            <p className="text-lg md:text-2xl font-rubik font-light text-[var(--color-text)] leading-relaxed">
              מאות יצירות אמנות ייחודיות נוצרו, כל אחת מהן משקפת חזון שונה ומרגש של המפגש בין עיצוב, טכנולוגיה ואמנות.
            </p>

            <div className="bg-[var(--color-gold)]/10 border-2 border-[var(--color-gold)]/30 rounded-2xl p-6 md:p-8 my-8">
              <p className="text-2xl md:text-4xl font-rubik font-bold text-[var(--color-gold)] leading-relaxed mb-4">
                🏆 בקרוב יוכרז הזוכה הגדול! 🏆
              </p>
              <p className="text-base md:text-xl font-rubik font-light text-white leading-relaxed">
                נבחרת השופטים היוקרתית שלנו בוחנת כעת את כל היצירות
                <br />
                והזוכה ייחשף בהמשך
              </p>
            </div>

            <p className="text-base md:text-lg font-rubik font-light text-[var(--color-muted)] leading-relaxed">
              זו הייתה חוויה מיוחדת שבה הטשטשנו גבולות בין מוצר לאמנות,
              <br />
              בין טכנולוגיה ליצירתיות, בין חזון למציאות.
            </p>

            <p className="text-xl md:text-2xl font-rubik font-medium text-white leading-relaxed mt-8">
              תודה שהייתם חלק ממסע יצירתי זה! 🎨
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-2xl mx-auto mb-12">
            {/* Product Link Button */}
            <a
              href="https://sodastream.co.il/products/enso?variant=42858873749582&utm_source=ensogallery.co.il&utm_medium=organic&utm_campaign=THANKYOU"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-white font-rubik font-medium text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-[var(--color-gold)]/50 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>לרכישת מכשיר ®ensō</span>
            </a>

            {/* Gallery Access Button */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 font-rubik font-medium text-lg rounded-full transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>כניסה לגלריה</span>
            </button>
          </div>

          {/* Signature */}
          <div className="flex justify-center mt-12">
            <img
              src="/imgs/Signature.png"
              alt="חתימה"
              className="h-12 md:h-16 w-auto opacity-60"
              style={{ filter: 'brightness(0) saturate(100%) invert(77%) sepia(52%) saturate(408%) hue-rotate(357deg) brightness(98%) contrast(87%)' }}
            />
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] rounded-xl border-2 border-[var(--color-gold)]/30 max-w-md w-full p-8">
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-rubik font-light text-[var(--color-gold)]">
                כניסה לגלריה
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPassword('')
                  setError('')
                }}
                className="text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-rubik font-light text-[var(--color-text)] mb-2" dir="rtl">
                  הזן סיסמה:
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border-2 border-[var(--color-gold)]/30 focus:border-[var(--color-gold)] rounded-lg text-white font-rubik outline-none transition-colors"
                  placeholder="••••••"
                  autoFocus
                  dir="ltr"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-rubik font-light" dir="rtl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-white font-rubik font-medium rounded-lg transition-all duration-300"
              >
                כניסה
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[var(--color-bg)] border-t border-[var(--color-gold)]/20 py-6 px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[var(--color-muted)]/60 text-xs font-rubik font-light">
            © 2025 SodaStream ®ensō Campaign • Powered by AI
          </div>
        </div>
      </footer>
    </div>
  )
}
