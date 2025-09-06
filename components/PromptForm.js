import { useState } from 'react'

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
    'נוף הרים עם אגם כחול ועננים',
    'יער קסום עם פרפרים צבעוניים',
    'חוף ים בשקיעה עם גלים קטנים',
    'גן פרחים עם דבורים וצבעים חמים',
    'כוכבים בלילה עם ירח מלא'
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-white mb-4 text-center">
            תאר את היצירה שאתה רוצה ליצור
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all resize-none"
              rows="4"
              placeholder="לדוגמה: נוף הרים עם אגם כחול בשקיעה, עם עצים ירוקים ופרחים צבעוניים..."
              disabled={isLoading}
              maxLength={500}
            />
            <div className="absolute bottom-3 left-3 text-sm text-white/60">
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
          <p className="text-white/80 text-sm mb-3">דוגמאות לקוחה מהירה:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleInputChange(example)}
                className="px-3 py-1 text-sm bg-white/10 text-white/80 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>יוצר...</span>
            </div>
          ) : (
            'צור יצירת אומנות'
          )}
        </button>
      </form>

      {/* הנחיות */}
      <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <h3 className="text-white font-medium mb-2">הנחיות ליצירה:</h3>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• תאר נופים, חפצים, בעלי חיים או סצנות טבע</li>
          <li>• השתמש בצבעים ורגשות לתיאור המקום</li>
          <li>• הימנע מאנשים, טקסט או תוכן פוליטי</li>
          <li>• ככל שהתיאור יותר מפורט, היצירה תהיה יותר מדויקת</li>
        </ul>
      </div>
    </div>
  )
}
