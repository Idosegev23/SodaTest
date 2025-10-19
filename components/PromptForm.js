import { useState } from 'react'
import PremiumButton from './PremiumButton'

export default function PromptForm({ onSubmit, isLoading, compact = false }) {
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')

  // מילים וביטויים אסורים - רק מילים ספציפיות שבאמת בעייתיות
  const forbiddenTerms = [
    // אנשים וגוף - רק מילים ברורות
    'אדם', 'אנשים', 'איש', 'אישה', 'ילד', 'ילדה', 'בן אדם',
    'person', 'people', 'man', 'woman', 'child', 'human',
    'פנים', 'face', 'body', 'גוף',
    'משפחה', 'זוג', 'family', 'couple',
    
    // פוליטיקה - רק ברורים
    'פוליטיקה', 'ממשלה', 'בחירות', 'politics', 'government',
    'נתניהו', 'ביבי', 'netanyahu', 'trump', 'biden',
    'מלחמה', 'צבא', 'war', 'military', 'army',
    'פלסטין', 'palestine', 'עזה', 'gaza', 'חמאס', 'hamas',
    
    // טקסט וכתיבה - רק בקשות מפורשות
    'טקסט', 'text', 'writing',
    'כתוב', 'add text', 'with text',
    'כיתוב', 'caption',
    
    // תוכן לא הולם
    'מין', 'עירום', 'sexy', 'nude', 'nsfw', 'porn',
    'אלימות', 'דם', 'violence', 'blood', 'death', 'kill',
    'סמים', 'drugs'
  ]

  const validatePrompt = (text) => {
    if (!text.trim()) {
      return 'יש להזין תיאור ליצירה'
    }
    
    if (text.length < 10) {
      return 'התיאור קצר מדי - לפחות 10 תווים'
    }
    
    if (text.length > 500) {
      return 'התיאור ארוך מדי - עד 500 תווים'
    }
    
    // בדיקת תוכן אסור
    const lowerText = text.toLowerCase()
    for (const term of forbiddenTerms) {
      if (lowerText.includes(term.toLowerCase())) {
        return `לא ניתן להשתמש במילה "${term}" - אנא השתמש בתיאור אחר`
      }
    }
    
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationError = validatePrompt(prompt)
    
    if (validationError) {
      setError(validationError)
      return
    }
    
    setError('')
    // הוספת "בהשראת..." אוטומטית לפני הפרומפט
    const finalPrompt = `בהשראת ${prompt}`
    onSubmit(finalPrompt)
  }

  const handleInputChange = (value) => {
    setPrompt(value)
    if (error) {
      setError('')
    }
  }

  const handleExampleClick = (fullText) => {
    // Replace the current prompt with the example text
    setPrompt(fullText)
    setError('')
    
    // Focus on the textarea so user can see the text was added
    const textarea = document.getElementById('artwork-prompt')
    if (textarea) {
      textarea.focus()
      // Move cursor to end of text
      textarea.setSelectionRange(fullText.length, fullText.length)
    }
  }

  const examplePrompts = [
    {
      title: 'חוף ים טרופי בשקיעה',
      fullText: 'חוף ים טרופי מדהים בשעת השקיעה הזהובה, כשהשמש שוקעת באופק ומציירת את השמיים בגוני כתום, ורוד ואדום עזים. גלים כחולים-ירוקים מתנפצים על החוף הלבן והחלק, בעוד דקלים גבוהים ויפים מתנועעים ברוח הים הקרירה. ציפורי שחף מעופפות בשמיים הצבעוניים, וקרני השמש האחרונות מאירות את המים בזהב נוצץ ומבריק'
    },
    {
      title: 'יער קסום עם פרפרים',
      fullText: 'יער קסום ועתיק מלא בסודות, שבו עצי אלון גדולים ומפוארים מכוסים בטחב ירוק וקטיפתי מגיעים לשמיים. קרני אור זהובות מחדירות דרך הענפים הסבוכים ויוצרות מחזה מרהיב של אור וצל. פרפרים צבעוניים בגוני כחול, אדום וצהוב מרחפים בין הפרחים הבריים, בעוד צפרדעים קטנות קופצות על אבנים מכוסות טחב ליד נחל קטן וצלול שזורם בין העצים'
    },
    {
      title: 'גן יפני עם פרחי דובדבן',
      fullText: 'גן יפני מסורתי ומושלם בעונת הפריחה, מלא בפרחי דובדבן ורודים ולבנים שפורחים על הענפים העדינים. גשר עץ קטן ומעוקל חוצה את בריכת הקוי הכחולה והצלולה, שבה שוחים דגי קוי זהובים וכתומים גדולים ויפים. דבורי דבש עסוקות מרחפות בין הפרחים הצבעוניים, בעוד פנס אבן יפני מסורתי מאיר בעדינות את השביל המרוצף באבנים חלקות'
    },
    {
      title: 'נוף הרים מושלג',
      fullText: 'נוף הרים מושלג ומרהיב עם פסגות לבנות וגבוהות המגיעות לעננים, ובמרכז אגם כחול צלול ועמוק שמשקף את השמיים והפסגות המושלגות. ערפל קל ומסתורי מרחף מעל פני המים הקפואים בקצותיהם, בעוד עצי אורן ירוקים וגבוהים מכסים את המדרונות. נשרים מלכותיים מעופפים בעיגולים רחבים בשמיים הכחולים הבהירים, והשלג הטרי נוצץ באור השמש החד והבהיר'
    },
    {
      title: 'לילה כוכבי עם ירח מלא',
      fullText: 'לילה כוכבי קסום עם שמיים שחורים מלאים בכוכבים נוצצים ובשביל החלב הבולט והמרהיב החוצה את כל השמיים. ירח מלא וזוהר מאיר את הנוף בכסף עדין, בעוד עצי ארז ענקיים וגבוהים עומדים בצללית מסתורית נגד השמיים הכוכביים. ינשופים קוראים ברקע, ורוח קרירה ונעימה מנשבת בין הענפים, בעוד כוכבים נופלים מאירים את השמיים לרגעים קצרים ומקסימים'
    },
    {
      title: 'שדה חמניות צהובות',
      fullText: 'שדה חמניות ענק וצהוב מלא בפרחים גדולים ויפים הפונים אל השמש, נושבים ברוח קיצית חמה ונעימה. דבורי דבש עסוקות ושמחות מזמזמות בין הפרחים הצהובים הענקיים, אוספות צוף מתוק. שמיים כחולים בהירים וצלולים משתרעים לאין סוף, עם עננים לבנים וקטנים שמפליגים לאט. באופק רחוק נראים גבעות ירוקות ועדינות, ורוח קלה מביאה את ריח הפרחים המתוק והמרגיע'
    }
  ]

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-8"}>
        <div>
          <div className="relative" style={{ padding: '10px' }}>
            <div className="relative">
              {/* Prefix קבוע "בהשראת" */}
              <div 
                className="absolute top-4 right-6 text-lg font-heebo text-[var(--color-text)] pointer-events-none z-10"
                style={{ lineHeight: '1.5' }}
              >
                בהשראת
              </div>
              <textarea
                id="artwork-prompt"
                value={prompt}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full py-4 text-lg font-heebo border-2 border-[var(--color-gold-border)] text-[var(--color-text)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30 transition-all resize-none"
                style={{ 
                  borderRadius: '46px', 
                  background: '#12294A',
                  paddingRight: '105px',
                  paddingLeft: '24px'
                }}
                rows="5"
                placeholder="חוף ים בשקיעה עם גלים זהובים, עצים ירוקים ופרחים צבעוניים..."
                disabled={isLoading}
                maxLength={500}
                aria-describedby="prompt-help prompt-counter"
              />
            </div>
            <div 
              id="prompt-counter"
              className="absolute bottom-4 text-sm text-[var(--color-muted)]/60 font-heebo"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
              {prompt.length}/500
            </div>
          </div>
          
          {error && (
            <p className="mt-2 text-red-400 text-sm transition-all">
              {error}
            </p>
          )}
        </div>

        {/* דוגמאות מהירות - רק במצב רגיל */}
        {!compact && (
          <div>
            <p className="text-[var(--color-muted)] text-base mb-6 font-heebo font-light text-center">דוגמאות מהירות להשראה:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {examplePrompts.map((example, index) => (
                <PremiumButton
                  key={index}
                  type="button"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleExampleClick(example.fullText)
                  }}
                  className="text-sm font-heebo font-light tracking-wide h-auto text-center w-full min-h-[48px] py-3"
                  disabled={isLoading}
                  aria-label={`השתמש בדוגמה: ${example.title}`}
                >
                  {example.title}
                </PremiumButton>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '0 10px 10px 10px', background: 'transparent' }}>
          <PremiumButton
            type="submit"
            variant="primary"
            disabled={isLoading || !prompt.trim()}
            className="w-full text-base md:text-lg font-heebo font-medium tracking-wide py-3 md:py-4"
            style={{ backgroundColor: 'var(--color-gold)', color: 'black' }}
            aria-label={isLoading ? 'יוצר יצירת אמנות...' : 'צור יצירת אמנות'}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>יוצר...</span>
              </div>
            ) : (
              'צור יצירת אמנות'
            )}
          </PremiumButton>
        </div>
      </form>

      {/* הנחיות מעודכנות - רק במצב רגיל */}
      {!compact && (
        <div 
          id="prompt-help"
          className="mt-8 p-6 bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-lg"
          role="region"
          aria-label="הנחיות ליצירת אמנות"
        >
          <h3 className="text-[var(--color-text)] font-heebo font-medium mb-4">עצות ליצירה מושלמת:</h3>
          <ul className="text-[var(--color-muted)] font-heebo font-light text-sm space-y-2">
            <li>• תאר נופים, חפצים, בעלי חיים או סצנות טבע</li>
            <li>• השתמש בצבעים, תאורה ואווירות מיוחדות</li>
            <li>• ציין פרטים כמו זמן יום, מזג אוויר או עונה</li>
            <li>• <strong className="text-[var(--color-gold)]">זכור: מכשיר ®ensō יופיע תמיד ביצירה</strong></li>
            <li>• ככל שהתיאור יותר מפורט, היצירה תהיה יותר מדויקת</li>
          </ul>
        </div>
      )}
    </div>
  )
}
