import { useState } from 'react'
import PremiumButton from './PremiumButton'

export default function PromptForm({ onSubmit, isLoading }) {
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')

  // מילים וביטויים אסורים
  const forbiddenTerms = [
    'אדם', 'אנשים', 'איש', 'אישה', 'ילד', 'ילדה', 'בן אדם',
    'person', 'people', 'man', 'woman', 'child', 'human',
    'פוליטיקה', 'מדינה', 'ממשלה', 'בחירות', 'politics', 'government',
    'סלבריטי', 'מפורסם', 'celebrity', 'famous person',
    'טקסט', 'כתובת', 'מלים', 'text', 'writing', 'words',
    'מין', 'עירום', 'sexy', 'nude', 'nsfw',
    'אלימות', 'דם', 'violence', 'blood', 'death', 'kill',
    'סמים', 'drugs', 'alcohol', 'cigarette'
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
    onSubmit(prompt)
  }

  const handleInputChange = (value) => {
    setPrompt(value)
    if (error) {
      setError('')
    }
  }

  const examplePrompts = [
    'חוף ים בשקיעה עם גלים זהובים',
    'יער קסום עם פרפרים צבעוניים',
    'גן פרחים פורח עם דבורים',
    'נוף הרים עם אגם כחול ועננים',
    'כוכבים בלילה עם ירח מלא',
    'שדה חמניות צהובות ברוח'
  ]

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label 
            htmlFor="artwork-prompt"
            className="block text-xl font-heebo font-light text-[var(--color-text)] mb-6 text-center"
          >
            תאר את היצירה שתרצה ליצור
          </label>
          <div className="relative">
            <textarea
              id="artwork-prompt"
              value={prompt}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full px-6 py-4 text-lg font-heebo border-2 border-[var(--color-gold-border)] rounded bg-black/20 text-[var(--color-text)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30 transition-all resize-none backdrop-blur-sm"
              rows="5"
              placeholder="לדוגמה: חוף ים בשקיעה עם גלים זהובים, עצים ירוקים ופרחים צבעוניים..."
              disabled={isLoading}
              maxLength={500}
              aria-describedby="prompt-help prompt-counter"
            />
            <div 
              id="prompt-counter"
              className="absolute bottom-4 left-4 text-sm text-[var(--color-muted)]/60 font-heebo"
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

        {/* דוגמאות מהירות */}
        <div>
          <p className="text-[var(--color-muted)] text-base mb-4 font-heebo font-light">דוגמאות מהירות:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleInputChange(example)}
                className="px-4 py-2 text-sm font-heebo border border-[var(--color-gold-border)] text-[var(--color-muted)] rounded hover:bg-[var(--color-gold-muted)] hover:text-[var(--color-gold)] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
                disabled={isLoading}
                aria-label={`השתמש בדוגמה: ${example}`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <PremiumButton
          type="submit"
          variant="secondary"
          disabled={isLoading || !prompt.trim()}
          className="w-full text-xl font-heebo font-medium py-4"
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
      </form>

      {/* הנחיות מעודכנות */}
      <div 
        id="prompt-help"
        className="mt-8 p-6 bg-black/20 border border-[var(--color-gold-border)] rounded-lg"
        role="region"
        aria-label="הנחיות ליצירת אמנות"
      >
        <h3 className="text-[var(--color-text)] font-heebo font-medium mb-4">עצות ליצירה מושלמת:</h3>
        <ul className="text-[var(--color-muted)] font-heebo font-light text-sm space-y-2">
          <li>• תאר נופים, חפצים, בעלי חיים או סצנות טבע</li>
          <li>• השתמש בצבעים, תאורה ואווירות מיוחדות</li>
          <li>• ציין פרטים כמו זמן יום, מזג אוויר או עונה</li>
          <li>• <strong className="text-[var(--color-gold)]">זכור: מכשיר Enso יופיע תמיד ביצירה</strong></li>
          <li>• ככל שהתיאור יותר מפורט, היצירה תהיה יותר מדויקת</li>
        </ul>
      </div>
    </div>
  )
}
