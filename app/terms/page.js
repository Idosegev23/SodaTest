'use client'

import { useRouter } from 'next/navigation'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function TermsPage() {
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
            תנאי שימוש
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
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">1. כללי</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                ברוכים הבאים לשירות יצירת האמנות של קמפיין SodaStream Enso. 
                השימוש בשירות זה כפוף לתנאי השימוש המפורטים להלן. 
                השימוש באתר מהווה הסכמה מלאה לתנאים אלה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">2. השירות</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                השירות מאפשר ליצור יצירות אמנות דיגיטליות באמצעות בינה מלאכותית, 
                כאשר מכשיר SodaStream Enso מוטמע בכל יצירה. 
                השירות מיועד לשימוש אישי ולא מסחרי.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">3. כללי השימוש</h2>
              <p className="text-[var(--color-muted)] leading-relaxed mb-3">
                בעת השימוש בשירות, אתם מתחייבים:
              </p>
              <ul className="text-[var(--color-muted)] list-disc list-inside space-y-2">
                <li>לא לבקש יצירת תוכן הכולל אנשים או דמויות אנושיות</li>
                <li>לא לבקש תוכן פוליטי, שנוי במחלוקת או פוגעני</li>
                <li>לא לכלול טקסטים או כתובות ביצירות</li>
                <li>לא לבקש תוכן NSFW, אלים או לא הולם</li>
                <li>לספק פרטים אמיתיים ומדויקים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">4. זכויות יוצרים ובעלות</h2>
              <p className="text-[var(--color-muted)] leading-relaxed mb-3">
                יצירות האמנות שנוצרות באתר:
              </p>
              <ul className="text-[var(--color-muted)] list-disc list-inside space-y-2">
                <li>נוצרות בעזרת בינה מלאכותית על בסיס הפרומפט שלכם</li>
                <li>יכולות להיות מוצגות בגלריה הציבורית באתר</li>
                <li>SodaStream שומרת לעצמה זכות שימוש ביצירות לצרכי שיווק</li>
                <li>אתם מקבלים רישיון לשימוש אישי ביצירות שיצרתם</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">5. אחריות והגבלות</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                השירות מסופק "כמו שהוא" ללא אחריות מכל סוג. 
                SodaStream לא תהיה אחראית לנזקים הנובעים משימוש בשירות, 
                כולל איכות היצירות או זמינות השירות.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">6. פרטיות ומידע אישי</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                השימוש בשירות כפוף למדיניות הפרטיות שלנו. 
                המידע שתספקו ישמש ליצירת היצירות ולשליחת עדכונים שיווקיים 
                (בכפוף להסכמתכם).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">7. הפרת תנאים</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                במקרה של הפרת תנאי השימוש, אנו שומרים לעצמנו את הזכות 
                לחסום את הגישה לשירות, למחוק תוכן לא מתאים ולנקוט בפעולות משפטיות במידת הצורך.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">8. שינויים בתנאים</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                אנו שומרים לעצמנו את הזכות לעדכן את תנאי השימוש מעת לעת. 
                שינויים יכנסו לתוקף מיד עם פרסומם באתר.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">9. דין חל ושיפוט</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                תנאי שימוש אלה כפופים לדיני מדינת ישראל. 
                כל מחלוקת תהיה נתונה לשיפוטם הבלעדי של בתי המשפט המוסמכים בישראל.
              </p>
            </section>

            <section className="border-t border-[var(--color-gold-border)] pt-6">
              <h2 className="text-xl font-playfair font-medium text-[var(--color-text)] mb-4">עדכון אחרון</h2>
              <p className="text-[var(--color-muted)] leading-relaxed">
                תנאי שימוש אלה עודכנו לאחרונה ב-{new Date().toLocaleDateString('he-IL')}.
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
