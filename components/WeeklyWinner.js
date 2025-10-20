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
      // טוען את הזוכה האחרון שהוכרז (אם יש)
      const { data: lastWinner, error: winnerError } = await supabase
        .from('weekly_winners')
        .select('*')
        .order('selected_at', { ascending: false })
        .limit(1)
        .single()
      
      if (lastWinner && !winnerError) {
        // מצאנו זוכה! טוען את היצירה המלאה
        const { data: winnerArtwork, error: artworkError } = await supabase
          .from('artworks')
          .select('*')
          .eq('id', lastWinner.artwork_id)
          .single()
        
        if (winnerArtwork && !artworkError) {
          setWinner(winnerArtwork)
          setLoading(false)
          return
        }
      }
      
      // אין זוכה עדיין - מציג מטושטש
      setWinner(null)
      setLoading(false)
    } catch (error) {
      console.error('Error loading winner:', error)
      setWinner(null)
    } finally {
      setLoading(false)
    }
  }

  // פונקציה לחישוב תאריכי השבוע (ראשון-שבת)
  const getWeekDateRange = (dateString) => {
    const date = new Date(dateString)
    
    // קביעת התאריך של ראשון של אותו שבוע
    const day = date.getDay()
    const diffToSunday = date.getDate() - day
    const sunday = new Date(date.setDate(diffToSunday))
    
    // חישוב תאריך שבת (6 ימים אחרי ראשון)
    const saturday = new Date(sunday)
    saturday.setDate(saturday.getDate() + 6)
    
    // פורמט תאריך בעברית
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    const sundayStr = sunday.toLocaleDateString('he-IL', options)
    const saturdayStr = saturday.toLocaleDateString('he-IL', options)
    
    return `${sundayStr} - ${saturdayStr}`
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
      <section className="py-8 md:py-16 px-4 relative overflow-hidden">
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
          <div className="relative mb-6 md:mb-12">
            {/* אייקון כתר */}
            <div className="mb-4 md:mb-6 flex justify-center relative z-10">
              <img src="/imgs/crown.png" alt="Crown" className="h-12 md:h-16 w-auto" />
            </div>
            
            <h3 className="text-3xl md:text-5xl font-rubik font-light text-white mb-3 md:mb-4 tracking-wide relative z-10">
              הזוכה השבועי
            </h3>
            
            <p className="text-[var(--color-gold)] font-heebo font-light text-sm md:text-base relative z-10 opacity-90">
              בקרוב ייבחר הזוכה הראשון ⭐
            </p>
          </div>
          
          {/* מסגרת זהב עם תמונה מטושטשת */}
          <div className="relative max-w-lg mx-auto">
            <div className="border-2 border-[var(--color-gold)] shadow-2xl shadow-[var(--color-gold)]/20 relative z-10" style={{ borderRadius: '65px', padding: '5px' }}>
              <div className="relative" style={{ borderRadius: '60px', overflow: 'hidden' }}>
                {/* תמונה מטושטשת */}
                <div 
                  className="w-full aspect-square"
                  style={{ 
                    borderRadius: '60px',
                    background: 'linear-gradient(135deg, #1a2847 0%, #0f1e35 100%)',
                    filter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto mb-4 opacity-30" fill="none" stroke="var(--color-gold)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[var(--color-muted)] font-heebo font-light text-sm opacity-50">
                      בקרוב תמונה
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16">
          <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30"></div>
        </div>

        {/* Call to Action - אותו חלק פרסים גם כשאין זוכה */}
        <div className="mt-8 md:mt-16 text-center max-w-4xl mx-auto relative z-10">
          {/* כותרת */}
          <h3 className="text-xl md:text-[30px] font-rubik font-light text-white mb-6 md:mb-8" dir="rtl">
            הצטרפו לחוויה ותהנו מהטבה ייחודית
          </h3>

          {/* מרווח */}
          <div className="mt-6 md:mt-12"></div>

          {/* כותרת פרסים */}
          <h4 className="text-2xl md:text-[40px] font-rubik font-bold text-white mb-6 md:mb-12" dir="rtl">
            הפרסים שמחכים ליוצרים הזוכים
          </h4>

          {/* תאריך סיום */}
          <p className="text-base md:text-[18px] font-rubik font-light text-[var(--color-gold)] mb-6 md:mb-8" dir="rtl">
            ההשתתפות והזכייה בפעילות עד 10.11.2025
          </p>

          {/* כרטיסיות פרסים */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* כרטיסייה 1 - עיצוב זוכה */}
            <div 
              className="p-8 flex flex-col items-center text-center border-2 border-[var(--color-gold)] md:order-2 order-1 md:mt-0"
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

            {/* כרטיסייה 2 - זוכה שבועי */}
            <div 
              className="p-8 flex flex-col items-center text-center md:order-1 order-2 md:mt-16"
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

            {/* כרטיסייה 3 - הנחה קבועה */}
            <div 
              className="p-8 flex flex-col items-center text-center md:order-3 order-3 md:mt-16"
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
                כל משתתף בגלריה יקבל הטבה של 10% לרכישת מכשיר ®ensō. לזמן מוגבל.
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
      </section>
    )
  }

  return (
    <section className="py-8 md:py-16 px-4 relative overflow-hidden">
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
        <div className="relative mb-6 md:mb-12">
          {/* אייקון כתר */}
          <div className="mb-4 md:mb-6 flex justify-center relative z-10">
            <img src="/imgs/crown.png" alt="Crown" className="h-12 md:h-16 w-auto" />
          </div>
          
          <h3 className="text-3xl md:text-5xl font-rubik font-light text-white mb-3 md:mb-4 tracking-wide relative z-10">
            הזוכה השבועי
          </h3>
          
          <p className="text-[var(--color-gold)] font-heebo font-light text-sm md:text-base relative z-10 opacity-90">
            היצירה עם הכי הרבה לייקים השבוע ⭐
          </p>
          
          {winner && winner.created_at && (
            <p className="text-[var(--color-muted)] font-heebo font-light text-xs md:text-sm relative z-10 mt-2">
              שבוע: {getWeekDateRange(winner.created_at)}
            </p>
          )}
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
        <div className="mt-8 md:mt-16 text-center">
          {/* כותרת */}
          <h3 className="text-xl md:text-[30px] font-rubik font-light text-white mb-6 md:mb-8" dir="rtl">
            הצטרפו לחוויה ותהנו מהטבה ייחודית
          </h3>

          {/* מרווח */}
          <div className="mt-6 md:mt-12"></div>

          {/* כותרת פרסים */}
          <h4 className="text-2xl md:text-[40px] font-rubik font-bold text-white mb-6 md:mb-12" dir="rtl">
            הפרסים שמחכים ליוצרים הזוכים
          </h4>

          {/* תאריך סיום */}
          <p className="text-base md:text-[18px] font-rubik font-light text-[var(--color-gold)] mb-6 md:mb-8" dir="rtl">
            ההשתתפות והזכייה בפעילות עד 10.11.2025
          </p>

          {/* כרטיסיות פרסים */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* כרטיסייה 1 - עיצוב זוכה (Desktop: מרכז גבוה - פודיום, Mobile: ראשון) */}
            <div 
              className="p-8 flex flex-col items-center text-center border-2 border-[var(--color-gold)] md:order-2 order-1 md:mt-0"
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

            {/* כרטיסייה 2 - זוכה שבועי (Desktop: שמאל נמוך, Mobile: שני) */}
            <div 
              className="p-8 flex flex-col items-center text-center md:order-1 order-2 md:mt-16"
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

            {/* כרטיסייה 3 - הנחה קבועה (Desktop: ימין נמוך, Mobile: שלישי) */}
            <div 
              className="p-8 flex flex-col items-center text-center md:order-3 order-3 md:mt-16"
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
                כל משתתף בגלריה יקבל הטבה של 10% לרכישת מכשיר ®ensō. לזמן מוגבל.
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