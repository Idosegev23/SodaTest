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
          <h1 className="text-3xl md:text-4xl font-heebo font-light text-[var(--color-text)] mb-4">
            מדיניות פרטיות
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto mb-4"></div>
          <p className="text-[var(--color-muted)] font-heebo font-light">
            קמפיין SodaStream Enso – השקת מכשיר enso® בישראל
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-[var(--color-gold-muted)] border border-[var(--color-gold-border)] rounded-lg p-6 md:p-8 space-y-6 font-rubik text-sm leading-relaxed">
            
            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">כללי</h2>
              <p className="text-[var(--color-muted)]">
                סודהסטרים מתייחסת בכבוד לפרטיות המשתמשים בתחרות וביצירת יצירות אמנות. המידע שנאסף עליך מאפשר לסודהסטרים ישראל בע"מ (ח.פ 510999410) ("החברה") ללפעול את התחרות בצורה תקינה, להקניא קשר איתך ולשתף דברי שיווק.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">1. איסוף מידע</h2>
              <p className="text-[var(--color-muted)] mb-3">
                <span className="font-medium text-[var(--color-text)]">מידע שנאסף במהלך השימוש:</span>
              </p>
              <ul className="text-[var(--color-muted)] space-y-2 mr-4">
                <li>• שם מלא, מספר טלפון וכתובת דוא"ל</li>
                <li>• יצירות אמנות שנוצרו על ידך בעמוד התחרות</li>
                <li>• נתונים טכניים על השימוש באתר (כתובת IP, סוג דפדפן וכו')</li>
                <li>• עוגיות וזיהוי התקנים</li>
              </ul>
              <p className="text-[var(--color-muted)] mt-4">
                <span className="font-medium text-[var(--color-text)]">הסכמה:</span> בעצם הרישום והשתתפות בתחרות, אתה מודע ומסכים לאיסוף ולעיבוד מידע זה בהתאם למדיניות זו.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">2. שימוש במידע</h2>
              <p className="text-[var(--color-muted)] mb-3">
                החברה תשתמש במידע שלך למטרות הבאות:
              </p>
              <ul className="text-[var(--color-muted)] space-y-2 mr-4">
                <li>• ניהול ותפעול התחרות</li>
                <li>• התקשר איתך בדבר זכייתך בפרס</li>
                <li>• משלוח יצירות אמנות שיצרת</li>
                <li>• משלוח דברי שיווק (ניוזלטר, הודעות, הצעות מיוחדות)</li>
                <li>• שיפור השירות והחוויה</li>
                <li>• ציות להוראות הדין</li>
              </ul>
              <p className="text-[var(--color-muted)] mt-4">
                אתה רשאי להסיר את עצמך מרשימת התפוצה בכל עת בלחיצה על קישור "התנתק" בדיוור או בפנייה לחברה.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">3. מסירת מידע לצד שלישי</h2>
              <p className="text-[var(--color-muted)] mb-3">
                החברה לא תמכור, תשכור או תעביר את המידע האישי שלך לצדדים שלישיים, למעט:
              </p>
              <ul className="text-[var(--color-muted)] space-y-2 mr-4">
                <li>• ספקי שירות טכניים המסייעים בתפעול התחרות (אל.די.אר.אס גרופ בע"מ ושותפים טכניים)</li>
                <li>• כאשר נדרש על פי חוק (רשויות, בתי משפט)</li>
                <li>• לשם הגנה על זכויות החברה או בטיחות משתמשים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">4. Cookies וטכנולוגיות עקיבה</h2>
              <p className="text-[var(--color-muted)]">
                האתר משתמש בעוגיות טכניות הנדרשות לתפקוד התחרות (זכירת מצב ההתחברות, שמירת מצב הטופס וכו'). אנו משתמשים גם בפיקסל מעקב מטא (Facebook Pixel) לצורכי ניתוח וקידום. אתה רשאי להשבית עוגיות בהגדרות הדפדפן שלך, אך זה עלול להשפיע על פונקציונליות האתר.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">5. זכות לעיין במידע</h2>
              <p className="text-[var(--color-muted)]">
                בהתאם לחוק הגנת הפרטיות, יש לך זכות לבקש עיון במידע האישי שברשותנו, לתקן מידע שגוי, או לבקש מחיקת המידע. פנה לחברה דרך המידע ליצירת קשר בתחתית דף זה.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">6. אבטחת מידע</h2>
              <p className="text-[var(--color-muted)]">
                החברה נוקטת באמצעי אבטחה מתקדמים להגנה על המידע האישי שלך, כולל הצפנה (SSL), גישה מוגבלת ומערכות אבטחה טכניות מתקדמות. המידע מאוחסן בשרתים מאובטחים.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">7. פרסומות של צדדים שלישיים</h2>
              <p className="text-[var(--color-muted)]">
                האתר עשוי להכיל קישורים לאתרים של צדדים שלישיים. החברה לא אחראית למדיניות הפרטיות של אתרים אלו. בדוק את המדיניות שלהם לפני מתן מידע אישי.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">8. שאלות ופניות</h2>
              <p className="text-[var(--color-muted)]">
                לשאלות או בקשות בנוגע למדיניות הפרטיות, ניתן ליצור עמנו קשר ב:
              </p>
              <div className="text-[var(--color-muted)] mt-3 mr-4">
                <p>טלפון: 076-5996708</p>
                <p>דוא"ל: Customer-Service-IL@sodastream.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">9. עדכונים למדיניות</h2>
              <p className="text-[var(--color-muted)]">
                סודהסטרים רשאית לעדכן מדיניות פרטיות זו מעת לעת. עדכונים יפורסמו בעמוד זה. המשך שימוש באתר לאחר עדכון מעיד על הסכמתך למדיניות המעודכנת.
              </p>
            </section>

            <section className="border-t border-[var(--color-gold-border)] pt-6">
              <h2 className="text-lg font-rubik font-medium text-[var(--color-text)] mb-4">חוקים ישימים</h2>
              <p className="text-[var(--color-muted)]">
                מדיניות פרטיות זו כפופה לחוקי מדינת ישראל. כל מחלוקת הקשורה למדיניות זו תהיה כפופה לסמכות השיפוט הבלעדית של בתי המשפט בתל אביב-יפו.
              </p>
            </section>

            <section className="border-t border-[var(--color-gold-border)] pt-6">
              <p className="text-[var(--color-muted)] text-xs">
                <span className="font-medium text-[var(--color-text)]">עדכון אחרון:</span> {new Date().toLocaleDateString('he-IL')}
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
