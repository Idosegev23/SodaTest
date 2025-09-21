'use client'

import { useRouter } from 'next/navigation'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function PrivacyPage() {
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
          <h1 className="text-3xl md:text-4xl font-playfair font-light text-[var(--color-text)] mb-4">
            מדיניות פרטיות
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-4"></div>
          <p className="text-[var(--color-muted)] font-heebo font-light">
            קמפיין SodaStream Enso
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-[var(--color-gold-muted)] border border-[var(--color-gold-border)] rounded-lg p-6 md:p-8 space-y-6 font-heebo">
            
            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">1. איסוף מידע</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                אנו אוספים מידע אישי שאתם מספקים בעת השימוש בשירות יצירת האמנות של SodaStream Enso, 
                כולל שם, כתובת דוא"ל ומספר טלפון. מידע זה נאסף רק לאחר קבלת הסכמתכם המפורשת.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">2. שימוש במידע</h2>
              <p className="text-[var(--color-muted)] leading-relaxed mb-3">
                המידע שאנו אוספים משמש למטרות הבאות:
              </p>
              <ul className="text-[var(--color-muted)] list-disc list-inside space-y-2">
                <li>יצירת יצירות אמנות מותאמות אישית</li>
                <li>שליחת יצירות האמנות שנוצרו אליכם</li>
                <li>שליחת עדכונים שיווקיים מ-SodaStream (בכפוף להסכמתכם)</li>
                <li>שיפור השירות והחוויה</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">3. שיתוף מידע</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                אנו לא מוכרים, משכירים או מעבירים את המידע האישי שלכם לצדדים שלישיים ללא הסכמתכם, 
                למעט במקרים הנדרשים על פי חוק או לצורך מתן השירות (כגון ספקי שירות טכניים).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">4. אבטחת מידע</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע האישי שלכם, כולל הצפנה, 
                גישה מוגבלת ומערכות אבטחה מתקדמות. המידע מאוחסן בשרתים מאובטחים.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">5. זכויותיכם</h2>
              <p className="text-[var(--color-muted)] leading-relaxed mb-3">
                בהתאם לחוקי הגנת הפרטיות, יש לכם זכות:
              </p>
              <ul className="text-[var(--color-muted)] list-disc list-inside space-y-2">
                <li>לעיין במידע שאנו מחזיקים עליכם</li>
                <li>לבקש תיקון מידע שגוי</li>
                <li>לבקש מחיקת המידע שלכם</li>
                <li>לבטל הסכמתכם לקבלת חומר שיווקי</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">6. עוגיות (Cookies)</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                אתר זה משתמש בעוגיות טכניות הכרחיות לתפקוד האתר בלבד. 
                אנו לא משתמשים בעוגיות מעקב או שיווק ללא הסכמתכם המפורשת.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">7. יצירת קשר</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                לשאלות או בקשות בנוגע למדיניות הפרטיות, ניתן לפנות אלינו באמצעות פרטי הקשר באתר SodaStream הראשי.
              </p>
            </section>

            <section className="border-t border-[var(--color-gold-border)] pt-6">
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">עדכון אחרון</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                מדיניות פרטיות זו עודכנה לאחרונה ב-{new Date().toLocaleDateString('he-IL')}. 
                אנו שומרים לעצמנו את הזכות לעדכן מדיניות זו מעת לעת.
              </p>
            </section>
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
