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
               <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex flex-col justify-center items-center">
                 <img 
                   src="/logo.png" 
                   alt="SodaStream Enso" 
                   className="h-8 md:h-10 w-auto mb-3"
                 />
                 <p className="text-[var(--color-gold)] text-sm md:text-base font-heebo font-light tracking-wide text-center">
                   ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך
                 </p>
               </div>
        
        {/* CTA Button */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4 flex justify-center items-center">
          <PremiumButton
            variant="primary"
            onClick={() => router.push('/create')}
            className="text-base md:text-lg font-heebo font-light tracking-wide group w-full sm:w-auto max-w-[280px]"
            aria-label="עצב את החזון שלך"
          >
            Design Your Vision
          </PremiumButton>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex flex-col mt-[100px]">
        {/* Background Image - starts below navbar */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/hero.webp" type="image/webp" />
            <img
              src="/hero.jpg"
              alt="SodaStream Enso"
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

               {/* Logo - Right Side - Below Header */}
               <div className="relative z-10 flex-1 flex items-start justify-end pt-32 md:pt-40 pr-8 md:pr-16">
                 <div className="text-right px-4">
                   <img 
                     src="/logo.png" 
                     alt="SodaStream Enso" 
                     className="h-16 md:h-24 lg:h-32 w-auto drop-shadow-2xl"
                   />
                 </div>
               </div>

        {/* Quote and Signature - Bottom Right with more spacing */}
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-10 max-w-sm md:max-w-lg px-4 md:px-0">
          {/* Elegant Quote */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6">
            <p className="text-white/80 font-heebo font-light text-xs md:text-sm leading-relaxed mb-6 tracking-wider italic text-right" dir="rtl">
              "מים מבעבעים קיימים על פני האדמה כבר אלפי שנים, ויוצרים חיבור היסטורי עם האנושות. לפני כמעט שלוש מאות שנה הצליחו מדענים להפוך את ייצור המים המוגזים לתעשייתי – פריבילגיה שהייתה שמורה למעטים בלבד. דרך כלי העבודה היצוקים ממתכת מלוטשת – נפרץ מעיין של השראה.<br/><br/>enso<sup className="text-[var(--color-gold)] text-xs">®</sup> חושף ממד עמוק יותר של מורשת, מדע, הנדסה ועיצוב – ומשלב בעדינות את עושרם בחיי היומיום – ליצירת חוויית שתייה מושלמת."
            </p>
            
            {/* Signature */}
            <div className="flex justify-end">
              <img
                src="/imgs/Signature.png"
                alt="חתימה"
                className="h-12 md:h-16 opacity-90 drop-shadow-lg brightness-0 invert"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Welcome to ENSŌ Gallery */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heebo font-light text-[var(--color-text)] mb-8 tracking-wide leading-relaxed" dir="rtl">
            ברוכים הבאים ל־ENSŌ Gallery<br />
            <span className="text-[var(--color-gold)]">המקום שבו עיצוב פוגש חדשנות</span>
          </h2>
          
          <div className="space-y-6 text-[var(--color-text)] font-heebo font-light text-lg md:text-xl leading-relaxed" dir="rtl">
            <p>
              כאן אתם לא רק צופים - אתם יוצרים. בלחיצה אחת המכשיר מתמזג עם רקעים שנולדו בבינה מלאכותית, ואתם מעניקים לו פרשנות אישית משלכם.
            </p>
            
            <p>
              היצירה שלכם תצטרף לגלריה החיה בהמשך העמוד ותהפוך לחלק מהמהלך הכי מדובר בעולמות העיצוב והטכנולוגיה.
            </p>
            
            <p>
              בכל שבוע ייבחר עיצוב זוכה, שיזכה באחד מהפרסים הנחשקים שלנו.<br />
              ובסוף - נבחרת השופטים שלנו תבחר את היצירה הייחודית ביותר, והיוצר שלה יקבל במתנה את מכשיר ה־ENSŌ היוקרתי.
            </p>
            
            <p className="text-[var(--color-gold)] font-medium text-xl md:text-2xl">
              זו ההזדמנות שלכם לקחת חלק במהלך עולמי שמטשטש גבולות בין מוצר, אמנות וחדשנות.<br />
              עכשיו התור שלכם ליצור.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 - Judges Panel */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-[var(--color-bg)]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
              נבחרת השופטים
            </h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Judge 1 - Shai Franco */}
            <div className="text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-2 border-[var(--color-gold)]/50 shadow-lg">
                  <img 
                    src="/imgs/franco.jpeg" 
                    alt="Shai Franco" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h4 className="text-lg md:text-xl font-heebo font-medium text-[var(--color-text)] mb-2">Shai Franco</h4>
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-lg bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent border border-[var(--color-gold)]/20 flex items-center justify-center">
                <span className="text-[var(--color-gold)]/60 font-heebo font-light text-xs">יצירה בקרוב</span>
              </div>
            </div>

            {/* Judge 2 - Shira Barzilay */}
            <div className="text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-2 border-[var(--color-gold)]/50 shadow-lg">
                  <img 
                    src="/imgs/shira.jpeg" 
                    alt="Shira Barzilay" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h4 className="text-lg md:text-xl font-heebo font-medium text-[var(--color-text)] mb-2">Shira Barzilay</h4>
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-lg bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent border border-[var(--color-gold)]/20 flex items-center justify-center">
                <span className="text-[var(--color-gold)]/60 font-heebo font-light text-xs">יצירה בקרוב</span>
              </div>
            </div>

            {/* Judge 3 - Alon Shabo */}
            <div className="text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-2 border-[var(--color-gold)]/50 shadow-lg">
                  <img 
                    src="/imgs/shebo.jpeg" 
                    alt="Alon Shabo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h4 className="text-lg md:text-xl font-heebo font-medium text-[var(--color-text)] mb-2">Alon Shabo</h4>
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-lg bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent border border-[var(--color-gold)]/20 flex items-center justify-center">
                <span className="text-[var(--color-gold)]/60 font-heebo font-light text-xs">יצירה בקרוב</span>
              </div>
            </div>

            {/* Judge 4 - Dede Bandaid */}
            <div className="text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-2 border-[var(--color-gold)]/50 shadow-lg">
                  <img 
                    src="/imgs/dede.jpeg" 
                    alt="Dede Bandaid" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h4 className="text-lg md:text-xl font-heebo font-medium text-[var(--color-text)] mb-2">Dede Bandaid</h4>
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-lg bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent border border-[var(--color-gold)]/20 flex items-center justify-center">
                <span className="text-[var(--color-gold)]/60 font-heebo font-light text-xs">יצירה בקרוב</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Winner Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
              זוכה השבוע
            </h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-8"></div>
            <p className="text-lg text-[var(--color-text)] font-heebo font-light leading-relaxed" dir="rtl">
              היצירה שקיבלה את מירב הלייקים השבוע
            </p>
          </div>
          
          {/* Winner Card Container */}
          <div className="relative max-w-2xl mx-auto">
            {/* Creator of the Week Badge */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[var(--color-bg)] px-6 py-3 rounded-full font-heebo font-semibold text-lg shadow-lg border-2 border-[var(--color-gold-dark)]">
                Creator of the Week
              </div>
            </div>
            
            {/* Winner Card with Gold Frame */}
            <div className="relative">
              {/* Animated Gold Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold-dark)] to-[var(--color-gold)] rounded-lg p-1 animate-pulse">
                <div className="w-full h-full bg-[var(--color-bg)] rounded-lg"></div>
              </div>
              
              {/* Winner Content */}
              <div className="relative bg-[var(--color-bg)] rounded-lg p-1 m-1">
                <div className="aspect-square bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent border border-[var(--color-gold)]/20 rounded-lg flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-gold)]/5 rounded-lg flex items-center justify-center">
                      <span className="text-[var(--color-gold)] font-heebo font-light text-lg">יצירה זוכה בקרוב</span>
                    </div>
                    <h4 className="text-xl font-heebo font-medium text-[var(--color-text)] mb-2">שם היוצר</h4>
                    <p className="text-[var(--color-muted)] font-heebo font-light mb-4">תיאור היצירה</p>
                    <div className="flex items-center justify-center gap-2 text-[var(--color-gold)]">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="font-heebo font-medium">0 לייקים</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Section Title: מקומות 2-8 */}
            <section className="py-8 md:py-12 px-4">
        <div className="max-w-5xl mx-auto text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-heebo font-light text-[var(--color-text)] mb-4 tracking-wide">
            מקומות 2-8 השבוע
          </h3>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
          
          {/* Updated subtitle text */}
          <div className="mt-8 space-y-4 text-[var(--color-text)] font-heebo font-light text-lg leading-relaxed max-w-4xl mx-auto" dir="rtl">
            <p>
              היצירות הכי מוצלחות השבוע לפי כמות הלייקים - מקומות 2 עד 8
            </p>
            <p>
              מצאתם יצירה שאהבתם? תנו לה לייק ❤️ ואולי היא תעלה למקום הראשון!
            </p>
          </div>
        </div>
        
        {/* Dynamic Bento Gallery - Smaller Container */}
        <div className="max-w-4xl mx-auto">
          <BentoGallery />
        </div>
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

      {/* Final Section - Large Device Image & CTA */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Large Device Image with Light Rays */}
          <div className="relative mb-12">
            <div className="relative max-w-2xl mx-auto">
              {/* Light Rays Background */}
              <div className="absolute inset-0 -m-20">
                {/* Top Light Rays */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 opacity-30">
                  <div className="absolute top-0 left-1/2 w-1 h-32 bg-gradient-to-b from-[var(--color-gold)] to-transparent transform -translate-x-1/2 rotate-12 blur-sm"></div>
                  <div className="absolute top-0 left-1/2 w-1 h-40 bg-gradient-to-b from-[var(--color-gold)] to-transparent transform -translate-x-1/2 rotate-6 blur-sm"></div>
                  <div className="absolute top-0 left-1/2 w-1 h-36 bg-gradient-to-b from-[var(--color-gold)] to-transparent transform -translate-x-1/2 blur-sm"></div>
                  <div className="absolute top-0 left-1/2 w-1 h-40 bg-gradient-to-b from-[var(--color-gold)] to-transparent transform -translate-x-1/2 -rotate-6 blur-sm"></div>
                  <div className="absolute top-0 left-1/2 w-1 h-32 bg-gradient-to-b from-[var(--color-gold)] to-transparent transform -translate-x-1/2 -rotate-12 blur-sm"></div>
                </div>
                
                {/* Side Light Rays */}
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-20 blur-sm"></div>
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-32 h-1 bg-gradient-to-l from-transparent via-[var(--color-gold)] to-transparent opacity-20 blur-sm"></div>
                
                {/* Diagonal Light Rays */}
                <div className="absolute top-1/4 left-1/4 w-24 h-1 bg-gradient-to-r from-[var(--color-gold)] to-transparent transform rotate-45 opacity-15 blur-sm"></div>
                <div className="absolute top-1/4 right-1/4 w-24 h-1 bg-gradient-to-l from-[var(--color-gold)] to-transparent transform -rotate-45 opacity-15 blur-sm"></div>
                <div className="absolute bottom-1/4 left-1/4 w-24 h-1 bg-gradient-to-r from-[var(--color-gold)] to-transparent transform -rotate-45 opacity-15 blur-sm"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-1 bg-gradient-to-l from-[var(--color-gold)] to-transparent transform rotate-45 opacity-15 blur-sm"></div>
              </div>
              
              {/* Spotlight Effect */}
              <div className="absolute inset-0 bg-gradient-radial from-[var(--color-gold)]/10 via-transparent to-transparent rounded-lg"></div>
              
              {/* Product Image */}
              <div className="relative z-10">
                <img
                  src="/file.png"
                  alt="מכשיר SodaStream Enso"
                  className="w-full h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Elegant glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-gold)]/5 to-transparent rounded-lg"></div>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <PremiumButton
            variant="secondary"
            onClick={() => window.open('https://sodastream.co.il/products/enso?variant=42858873749582', '_blank')}
            className="text-xl font-heebo font-light tracking-wide group px-12 py-4 w-full sm:w-auto max-w-md relative z-10"
            aria-label="לפרטים נוספים על מכשיר SodaStream Enso"
          >
            לפרטים נוספים לחצו כאן
          </PremiumButton>
        </div>
      </section>

      {/* Bottom CTA - Create Artwork */}
      <section className="py-16 px-4 text-center flex justify-center">
        <PremiumButton
          variant="primary"
          onClick={() => router.push('/create')}
          className="text-xl font-heebo font-light tracking-wide group px-12 py-4 w-full sm:w-auto max-w-md"
          aria-label="עצב את החזון שלך"
        >
          Design Your Vision
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
