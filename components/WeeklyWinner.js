'use client'

import { useState, useEffect } from 'react'
import { getArtworks, supabase } from '../lib/supabaseClient'

export default function WeeklyWinner() {
  const [winner, setWinner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWinner()
  }, [])

  const loadWinner = async () => {
    try {
      const artworks = await getArtworks()
      
      // רשימת מיילים של שופטים שלא יכולים לזכות
      const judgesEmails = [
        'dede.confidential@gmail.com',
        'shai.franco@gmail.com',
        'shabo.alon@gmail.com',
        'koketit.us@gmail.com'
      ]
      
      if (artworks && artworks.length > 0) {
        // Sort by likes (most liked first), then by creation date
        const sortedByLikes = artworks.sort((a, b) => {
          const likesA = a.likes || 0
          const likesB = b.likes || 0
          
          if (likesB !== likesA) {
            return likesB - likesA // Most likes first
          }
          
          // If likes are equal, sort by creation date (newest first)
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at)
          }
          return (b.id || '').toString().localeCompare((a.id || '').toString())
        })
        
        // בדיקה מי זכה בעבר (קריאה ל-Supabase)
        const { data: previousWinners } = await supabase
          .from('weekly_winners')
          .select('user_email')
        
        const previousWinnersEmails = previousWinners ? previousWinners.map(w => w.user_email.toLowerCase()) : []
        
        // סינון: מחפשים את הזוכה הראשון שלא זכה בעבר ולא שופט
        const eligibleWinner = sortedByLikes.find(artwork => {
          const email = (artwork.user_email || '').toLowerCase()
          return !judgesEmails.includes(email) && !previousWinnersEmails.includes(email)
        })
        
        setWinner(eligibleWinner || null)
      } else {
        setWinner(null)
      }
    } catch (error) {
      console.error('Error loading winner:', error)
      setWinner(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative mb-12">
            {/* WEEKLY WINNER רקע ענק */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none whitespace-nowrap"
              style={{ 
                fontSize: '400px',
                color: 'var(--color-gold)',
                opacity: 0.05,
                fontWeight: 100,
                letterSpacing: '0.1em',
                zIndex: 0,
                fontFamily: 'Rubik, sans-serif'
              }}
            >
              WEEKLY WINNER
            </div>
            
            {/* אייקון כתר */}
            <div className="mb-6 flex justify-center relative z-10">
              <img src="/imgs/crown.png" alt="Crown" className="h-16 w-auto" />
            </div>
            
            <h3 className="text-4xl md:text-5xl font-rubik font-light text-white mb-6 tracking-wide relative z-10">
              הזוכה השבועי
            </h3>
          </div>
          
          <div className="flex justify-center">
            <span className="text-[var(--color-gold)] font-heebo font-light text-lg">טוען...</span>
          </div>
        </div>
      </section>
    )
  }

  if (!winner) {
    return (
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative mb-12">
            {/* WEEKLY WINNER רקע ענק */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none whitespace-nowrap"
              style={{ 
                fontSize: '400px',
                color: 'var(--color-gold)',
                opacity: 0.05,
                fontWeight: 100,
                letterSpacing: '0.1em',
                zIndex: 0,
                fontFamily: 'Rubik, sans-serif'
              }}
            >
              WEEKLY WINNER
            </div>
            
            {/* אייקון כתר */}
            <div className="mb-6 flex justify-center relative z-10">
              <img src="/imgs/crown.png" alt="Crown" className="h-16 w-auto" />
            </div>
            
            <h3 className="text-4xl md:text-5xl font-rubik font-light text-white mb-6 tracking-wide relative z-10">
              הזוכה השבועי
            </h3>
          </div>
          
          <div className="flex justify-center">
            <span className="text-[var(--color-muted)] font-heebo font-light text-lg">בקרוב ייבחר הזוכה השבועי</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Decorative Ellipse Background */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '75vw',
          height: '75vw',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#12294A',
          filter: 'blur(150px)',
          opacity: 0.6,
          zIndex: 0
        }}
      ></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* כותרת הזוכה השבועי */}
        <div className="relative mb-12">
          {/* אייקון כתר */}
          <div className="mb-6 flex justify-center relative z-10">
            <img src="/imgs/crown.png" alt="Crown" className="h-16 w-auto" />
          </div>
          
          <h3 className="text-4xl md:text-5xl font-rubik font-light text-white mb-6 tracking-wide relative z-10">
            הזוכה השבועי
          </h3>
        </div>
        
        {/* מסגרת זהב פשוטה */}
        <div className="relative max-w-lg mx-auto">
          {/* WEEKLY WINNER רקע ענק */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none whitespace-nowrap"
            style={{ 
              fontSize: '400px',
              color: 'var(--color-gold)',
              opacity: 0.15,
              fontWeight: 200,
              letterSpacing: '0.1em',
              zIndex: 0,
              fontFamily: 'Rubik, sans-serif'
            }}
          >
            WEEKLY WINNER
          </div>
          
          {/* מסגרת חיצונית - 65px radius */}
          <div className="border-2 border-[var(--color-gold)] shadow-2xl shadow-[var(--color-gold)]/20 relative z-10" style={{ borderRadius: '65px', padding: '5px' }}>
            {/* קונטיינר עם overflow hidden */}
            <div className="relative" style={{ borderRadius: '60px', overflow: 'hidden' }}>
              {/* תמונה פנימית - 61px radius */}
              <img
                src={winner.image_url}
                alt={winner.prompt || 'יצירת אמנות זוכה'}
                className="w-full aspect-square object-cover"
                style={{ borderRadius: '60px' }}
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 200)}`
                }}
              />
              
              {/* Overlay תכלת בתחתית */}
              <div 
                className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 py-4"
                style={{
                  background: 'linear-gradient(to top, #12294A 0%, rgba(18, 41, 74, 0.8) 20%, rgba(18, 41, 74, 0.4) 50%, transparent 100%)',
                  paddingTop: '80px'
                }}
              >
                {/* שם היוצר והפרומפט - ימין */}
                <div className="flex-1" dir="rtl">
                  <div className="text-white font-rubik font-bold text-lg mb-1">
                    {winner.user_name || 'אמן אנונימי'}
                  </div>
                  <div className="text-white/80 font-rubik font-light text-sm line-clamp-2">
                    {winner.prompt || 'יצירת אמנות מרהיבה'}
                  </div>
                </div>
                
                {/* לייקים - שמאל */}
                <div className="flex items-center gap-2 text-[var(--color-gold)] ml-4">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="font-rubik font-bold text-lg">
                    {winner.likes || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16">
          <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30"></div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          {/* כותרת */}
          <h3 className="text-[30px] font-rubik font-light text-white mb-8" dir="rtl">
            הצטרפו לחוויה ותהנו מהטבה ייחודית
          </h3>

          {/* קו זהב קצר */}
          <div className="w-32 h-px bg-[var(--color-gold)] mx-auto mb-8 opacity-50"></div>

          {/* טקסט עם לוגו */}
          <div className="font-rubik text-white flex items-baseline justify-center gap-2 flex-wrap" style={{ fontSize: '60px' }} dir="rtl">
            <span className="font-light">קבלו</span>
            <span className="font-bold text-[var(--color-white)]">10% הנחה</span>
            <span className="font-light">על רכישת</span>
            <img src="/logo.png" alt="ensō" className="h-16 w-auto" style={{ transform: 'translateY(15px)' }} />
          </div>

          {/* טקסט משני */}
          <p className="text-[30px] font-rubik font-light text-white/80 mt-6" dir="rtl">
            הטבה בלעדית למשתתפים, לזמן מוגבל.
          </p>

          {/* טקסט תוקף */}
          <p className="text-[22px] font-rubik font-light text-white/60 mt-3" dir="rtl">
            ההצעה בתוקף עד סוף התחרות
          </p>

          {/* מרווח כפול */}
          <div className="mt-16"></div>

          {/* כותרת פרסים */}
          <h4 className="text-[40px] font-rubik font-bold text-white mb-12" dir="rtl">
            הפרסים שמחכים ליוצרים של ה-®ensō
          </h4>

          {/* כרטיסיות פרסים */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* כרטיסייה 1 - עיצוב זוכה (Desktop: מרכז, Mobile: ראשון) */}
            <div 
              className="p-8 flex flex-col items-center text-center border-2 border-[var(--color-gold)] md:order-2 order-1"
              style={{
                background: '#12294A',
                borderRadius: '56px',
                minHeight: '400px'
              }}
            >
              <div className="relative mb-6">
                <img src="/imgs/Group.png" alt="Prize" className="w-48 h-48" />
                <img 
                  src="/imgs/flight.png" 
                  alt="Flight" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                  style={{ width: '300px', height: '300px', maxWidth: 'none' }}
                />
              </div>
              
              <h5 className="text-2xl font-rubik font-bold text-white mb-4" dir="rtl">
                העיצוב הזוכה
              </h5>
              
              <p className="text-base font-rubik font-light text-white/80 leading-relaxed" dir="rtl">
                נבחרת השופטים תבחר את היצירה הבולטת והחדשנית ביותר. היוצר שיבחר - יקבל במתנה זוג כרטיסי טיסה לאירופה + כניסה למוזיאון עיצוב נבחר.
              </p>
            </div>

            {/* כרטיסייה 2 - זוכה שבועי (Desktop: שמאל, Mobile: שני) */}
            <div 
              className="p-8 flex flex-col items-center text-center md:order-1 order-2"
              style={{
                background: '#12294A',
                borderRadius: '56px',
                minHeight: '400px'
              }}
            >
              <div className="relative mb-6">
                <img src="/imgs/Group.png" alt="Prize" className="w-48 h-48" />
                <img 
                  src="/imgs/crown.png" 
                  alt="Crown" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                  style={{ width: '160px', height: '160px', maxWidth: 'none' }}
                />
              </div>
              
              <h5 className="text-2xl font-rubik font-bold text-white mb-4" dir="rtl">
                זוכים שבועיים
              </h5>
              
              <p className="text-base font-rubik font-light text-white/80 leading-relaxed" dir="rtl">
                בכל שבוע תיבחר יצירה - זו שזכתה למספר הלייקים הגבוה ביותר בגלריה. היוצרים הזוכים ייחשפו בעמוד הגלריה ויקבלו סדנת קוקטיילים זוגית.
              </p>
            </div>

            {/* כרטיסייה 3 - הנחה קבועה (Desktop: ימין, Mobile: שלישי) */}
            <div 
              className="p-8 flex flex-col items-center text-center md:order-3 order-3"
              style={{
                background: '#12294A',
                borderRadius: '56px',
                minHeight: '400px'
              }}
            >
              <div className="relative mb-6">
                <img src="/imgs/Group.png" alt="Prize" className="w-48 h-48" />
                <img 
                  src="/file.png" 
                  alt="Discount" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                  style={{ width: '260px', height: '260px', transform: 'translate(-50%, -50%) translateX(-15px)' }}
                />
              </div>
              
              <h5 className="text-2xl font-rubik font-bold text-white mb-4" dir="rtl">
                הנחה לכל המשתתפים
              </h5>
              
              <p className="text-base font-rubik font-light text-white/80 leading-relaxed" dir="rtl">
                כל משתתף בגלריה יקבל הטבה של 10% לרכישת מכשיר ®ensō.
              </p>
            </div>
          </div>

          {/* כפתור */}
          <div className="mt-12 flex justify-center">
            <button 
              className="px-12 py-4 text-xl font-rubik font-medium transition-transform hover:scale-105"
              style={{
                background: 'white',
                color: '#020818',
                borderRadius: '56px'
              }}
              onClick={() => {
                // מחפש את הטקסט "העיצוב שלכם מתחיל כאן"
                const headings = Array.from(document.querySelectorAll('h3'));
                const targetHeading = headings.find(h => h.textContent.includes('העיצוב שלכם') && h.textContent.includes('מתחיל כאן'));
                if (targetHeading) {
                  targetHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              צרו עכשיו
            </button>
          </div>

          {/* מרווח */}
          <div className="mt-16"></div>

          {/* Divider */}
          <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30"></div>
        </div>
      </div>
    </section>
  )
}