// מערכת וידוא תוכן עם שתי שכבות בדיקה

// שכבה ראשונה - מילון מילים אסורות
const BLOCKED_WORDS = [
  // אנשים וגוף
  'אדם', 'אנשים', 'אישה', 'גבר', 'ילד', 'ילדה', 'בחור', 'בחורה', 'איש', 'אשה', 'בן', 'בת',
  'man', 'woman', 'person', 'human', 'people', 'child', 'boy', 'girl', 'guy', 'lady', 'male', 'female',
  'face', 'body', 'hand', 'leg', 'arm', 'finger', 'eye', 'nose', 'mouth',
  'גוף', 'רגל', 'זרוע', 'אצבע', 'עין', 'אף', 'פה',
  
  // פוליטיקה וממשלה
  'פוליטיקה', 'ממשלה', 'בחירות', 'מפלגה', 'כנסת', 'ביבי', 'נתניהו', 'לפיד', 'גנץ', 'בנט',
  'politics', 'government', 'election', 'party', 'parliament', 'minister', 'netanyahu', 'lapid', 'gantz',
  'פלסטינים', 'פלסטין', 'עזה', 'חמאס', 'palestine', 'gaza', 'hamas', 'fatah',
  'מלחמה', 'קרב', 'צבא', 'חיילים', 'war', 'battle', 'army', 'soldiers', 'military',
  
  // סלבריטאים ואנשי ציבור
  'celebrity', 'famous', 'actor', 'actress', 'singer', 'star', 'model',
  'סלב', 'משחק', 'שחקן', 'שחקנית', 'זמר', 'זמרת', 'כוכב', 'דוגמנית',
  
  // טקסט וכתיבה
  'text', 'writing', 'word', 'letter', 'caption', 'title', 'sign', 'label',
  'טקסט', 'כתיבה', 'מילה', 'אות', 'כיתוב', 'כותרת', 'שלט', 'תווית',
  
  // תוכן מיני ועירום
  'sex', 'sexual', 'nude', 'naked', 'nsfw', 'porn', 'erotic', 'adult', 'explicit',
  'מין', 'מיני', 'עירום', 'עירם', 'פורנו', 'ארוטי', 'מפורש',
  'breast', 'penis', 'vagina', 'genital', 'intimate',
  'חזה', 'איבר', 'אינטימי',
  
  // אלימות ומוות
  'violence', 'blood', 'death', 'kill', 'murder', 'terror', 'bomb', 'gun', 'weapon', 'knife',
  'אלימות', 'דם', 'מוות', 'הרג', 'רצח', 'טרור', 'פצצה', 'אקדח', 'נשק', 'סכין',
  'suicide', 'hurt', 'pain', 'wound', 'injury', 'attack', 'fight',
  'התאבדות', 'כאב', 'פגיעה', 'פצע', 'התקפה', 'קרב',
  
  // סמים ואלכוהול
  'drugs', 'cocaine', 'heroin', 'marijuana', 'weed', 'alcohol', 'beer', 'wine', 'cigarette', 'smoke',
  'סמים', 'קוקאין', 'הרואין', 'מריחואנה', 'גראס', 'אלכוהול', 'בירה', 'יין', 'סיגריה', 'עישון'
]

// מילים שמותר שיופיעו בהקשר טבעי ותמים
const ALLOWED_CONTEXT_WORDS = [
  // מילים הכוללות "יד" בהקשר תמים
  'ידוע', 'ידועה', 'ידועים', 'ידועות', 'ידידים', 'ידידות', 'ידיעה', 'ידיעות',
  'בידיים', 'לידי', 'עתידי', 'עתיד', 'מיידי', 'מיידית', 'חדידה', 'חדידים',
  'שדה', 'שדות', 'ירידה', 'ירידות', 'ירד', 'יורד', 'יורדת', 'יורדים',
  // מילים עם "פנים" בהקשר תמים  
  'פנימי', 'פנימית', 'מפנים', 'לפנים', 'בפנים', 'פנינה', 'פנינים',
  // מילים עם "ראש" בהקשר תמים
  'ראשי', 'ראשית', 'ראשון', 'ראשונה', 'בראש', 'לראש', 'מראש', 'ראשיתי',
  // טבע ונוף שעלולים להכיל חלקי מילים אסורות
  'גן', 'גנים', 'גינה', 'גינות', 'פרחים', 'עצים', 'שמיים', 'אדמה', 'אדמות'
]

// פונקציה לבדיקת מילים אסורות (שכבה ראשונה) - חיפוש מילים שלמות
export function checkBlockedWords(prompt) {
  const lowerPrompt = prompt.toLowerCase()
  
  // בדיקה אם יש מילים מותרות בהקשר - אם כן, לא לחסום
  for (const allowedWord of ALLOWED_CONTEXT_WORDS) {
    if (lowerPrompt.includes(allowedWord.toLowerCase())) {
      console.log(`Found allowed context word: "${allowedWord}" - allowing prompt`)
      return {
        isBlocked: false,
        reason: null,
        category: 'allowed_context'
      }
    }
  }
  
  // יצירת רגקס לכל מילה - חיפוש מילה שלמה בלבד
  for (const word of BLOCKED_WORDS) {
    const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i')
    if (wordRegex.test(lowerPrompt)) {
      return {
        isBlocked: true,
        reason: `מכיל מילה אסורה: "${word}"`,
        category: 'blocked_word'
      }
    }
  }
  
  return {
    isBlocked: false,
    reason: null,
    category: null
  }
}

// פונקציה לבדיקה עם Gemini AI (שכבה שנייה)
export async function validateWithGemini(prompt) {
  try {
    const validationPrompt = `Analyze the following text: "${prompt}"

Check if it contains any of the following categories:

* Humans or body parts (e.g. אדם, אנשים, אישה, ילד, man, woman, person, human)
* Politics, governments, elections, leaders, parties (e.g. פוליטיקה, ביבי, נתניהו, פלסטינים, Hamas, Netanyahu, Palestine, war)
* Celebrities, famous people
* Text, writing, captions, words
* Sexual content, nudity, NSFW
* Violence, blood, death, terror
* Drugs, alcohol, cigarettes

If the text belongs to ANY of these categories, answer ONLY "BLOCK".
If the text is safe and contains ONLY neutral objects, nature, scenery, or abstract descriptions, answer ONLY "ALLOW".`

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: validationPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini validation failed: ${response.statusText}`)
    }

    const data = await response.json()
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (result === 'BLOCK') {
      return {
        isBlocked: true,
        reason: 'התוכן לא מאושר לפי המדיניות (AI validation)',
        category: 'ai_blocked'
      }
    } else if (result === 'ALLOW') {
      return {
        isBlocked: false,
        reason: null,
        category: null
      }
    } else {
      // אם התשובה לא ברורה, נחסום מטעמי זהירות
      return {
        isBlocked: true,
        reason: 'לא ניתן לוודא את התוכן (AI uncertain)',
        category: 'ai_uncertain'
      }
    }
  } catch (error) {
    console.error('Error in Gemini validation:', error)
    // במקרה של שגיאה, נאפשר להמשיך (fallback)
    return {
      isBlocked: false,
      reason: null,
      category: 'validation_error'
    }
  }
}

// פונקציה מאוחדת לוידוא תוכן (שתי השכבות)
export async function validatePromptContent(prompt) {
  console.log('Starting content validation for prompt:', prompt)
  
  // שכבה ראשונה - בדיקת מילים אסורות
  const wordCheck = checkBlockedWords(prompt)
  if (wordCheck.isBlocked) {
    console.log('Blocked by word filter:', wordCheck.reason)
    return wordCheck
  }
  
  // שכבה שנייה - בדיקה עם Gemini AI
  const aiCheck = await validateWithGemini(prompt)
  if (aiCheck.isBlocked) {
    console.log('Blocked by AI validation:', aiCheck.reason)
    return aiCheck
  }
  
  console.log('Prompt passed all validation checks')
  return {
    isBlocked: false,
    reason: null,
    category: 'approved'
  }
}


