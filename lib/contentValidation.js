// מערכת וידוא תוכן עם שתי שכבות בדיקה

// שכבה ראשונה - מילון מילים אסורות
const BLOCKED_WORDS = [
  // אנשים וגוף - הרחבה מקיפה
  'אדם', 'אנשים', 'אישה', 'גבר', 'ילד', 'ילדה', 'בחור', 'בחורה', 'איש', 'אשה', 'בן', 'בת',
  'man', 'woman', 'person', 'human', 'people', 'child', 'boy', 'girl', 'guy', 'lady', 'male', 'female',
  'face', 'body', 'hand', 'leg', 'arm', 'finger', 'eye', 'nose', 'mouth',
  'גוף', 'רגל', 'זרוע', 'אצבע', 'עין', 'אף', 'פה',
  // הרחבה חדשה - אנשים וגוף
  'דמות', 'צללית', 'silhouette', 'figure', 'character',
  'ראש', 'פנים', 'שיער', 'head', 'hair', 'beard', 'mustache', 'facial',
  'חזה', 'בטן', 'גב', 'chest', 'belly', 'back', 'torso',
  'אנושי', 'בני אדם', 'mankind', 'humanity', 'humanoid',
  'תינוק', 'נער', 'נערה', 'baby', 'teenager', 'teen', 'infant',
  'סבא', 'סבתא', 'grandfather', 'grandmother', 'grandpa', 'grandma',
  'משפחה', 'זוג', 'couple', 'family', 'parent', 'הורה',
  'skin', 'עור', 'כף', 'palm', 'fist', 'אגרוף',
  
  // פוליטיקה וממשלה - הרחבה מקיפה
  'פוליטיקה', 'ממשלה', 'בחירות', 'מפלגה', 'כנסת', 'ביבי', 'נתניהו', 'לפיד', 'גנץ', 'בנט',
  'politics', 'government', 'election', 'party', 'parliament', 'minister', 'netanyahu', 'lapid', 'gantz',
  'פלסטינים', 'פלסטין', 'עזה', 'חמאס', 'palestine', 'gaza', 'hamas', 'fatah',
  'מלחמה', 'קרב', 'צבא', 'חיילים', 'war', 'battle', 'army', 'soldiers', 'military',
  // הרחבה חדשה - פוליטיקה
  'דיפלומט', 'דיפלומטים', 'diplomat', 'diplomats', 'diplomatic',
  'נשיא', 'president', 'שר', 'שרה', 'prime minister', 'פרלמנט',
  'שגריר', 'ambassador', 'consul', 'קונסול', 'embassy', 'שגרירות',
  'מחאה', 'הפגנה', 'protest', 'demonstration', 'rally', 'מפגין',
  'דגל ישראל', 'דגל פלסטין', 'israeli flag', 'palestinian flag',
  'ציונות', 'ציוני', 'zionism', 'zionist',
  'מתנחל', 'התנחלות', 'settler', 'settlement', 'colony',
  'אינתיפאדה', 'intifada', 'uprising',
  'שלום עכשיו', 'peace now',
  'ליכוד', 'עבודה', 'meretz', 'מרצ', 'ש״ס', 'shas',
  'טראמפ', 'ביידן', 'אובמה', 'trump', 'biden', 'obama', 'בוש', 'bush',
  'פוטין', 'זלנסקי', 'putin', 'zelensky',
  'ריבלין', 'הרצוג', 'rivlin', 'herzog',
  
  // סמלים פוליטיים ודתיים
  'מגן דוד', 'star of david', 'דוד', 'צלב', 'cross', 'crucifix',
  'סהר', 'crescent', 'חצי ירח',
  'דת', 'religion', 'religious', 'דתי',
  'אסלאם', 'נצרות', 'יהדות', 'islam', 'christianity', 'judaism', 'muslim', 'christian', 'jewish',
  'מסגד', 'כנסייה', 'בית כנסת', 'mosque', 'church', 'synagogue', 'temple', 'מקדש',
  'הסכם אוסלו', 'oslo accord', 'oslo',
  'הסכם שלום', 'peace treaty', 'peace agreement', 'peace deal',
  'הסכם קמפ דיויד', 'camp david',
  
  // סלבריטאים ואנשי ציבור
  'celebrity', 'famous', 'actor', 'actress', 'singer', 'star', 'model',
  'סלב', 'משחק', 'שחקן', 'שחקנית', 'זמר', 'זמרת', 'כוכב', 'דוגמנית',
  
  // טקסט וכתיבה - הרחבה מקיפה
  'text', 'writing', 'word', 'letter', 'caption', 'title', 'sign', 'label',
  'טקסט', 'כתיבה', 'מילה', 'אות', 'כיתוב', 'כותרת', 'שלט', 'תווית',
  // הרחבה חדשה - טקסט
  'כתוב', 'הוסף טקסט', 'עם כיתוב', 'add text', 'with writing', 'write',
  'headline', 'subtitle', 'כותרת משנה',
  'עם מילים', 'with words', 'עם אותיות', 'with letters',
  'font', 'typography', 'calligraphy', 'כתב', 'גופן', 'טיפוגרפיה',
  'inscription', 'script', 'inscription', 'חריטה',
  
  // דמויות מצוירות ואנימציה
  'cartoon', 'animation', 'anime', 'manga', 'אנימציה', 'מצויר', 'animated',
  'comic', 'קומיקס', 'superhero', 'גיבור על', 'hero',
  'avatar', 'אווטאר', 'emoji', 'אמוג\'י', 'emoticon',
  'mascot', 'קמע', 'character design',
  
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
  'סמים', 'קוקאין', 'הרואין', 'מריחואנה', 'גראס', 'אלכוהול', 'בירה', 'יין', 'סיגריה', 'עישון',
  
  // מותגים מסחריים - הגנה מסחרית
  // טכנולוגיה
  'apple', 'iphone', 'ipad', 'mac', 'macbook', 'airpods', 'אפל', 'אייפון', 'אייפד', 'מק',
  'samsung', 'galaxy', 'סמסונג', 'גלקסי',
  'google', 'pixel', 'גוגל', 'פיקסל',
  'microsoft', 'windows', 'xbox', 'מיקרוסופט', 'ווינדוס',
  'sony', 'playstation', 'סוני', 'פלייסטיישן',
  'nintendo', 'switch', 'נינטנדו',
  'tesla', 'טסלה',
  'meta', 'facebook', 'instagram', 'whatsapp', 'פייסבוק', 'אינסטגרם', 'וואטסאפ',
  
  // רכב
  'mercedes', 'bmw', 'audi', 'volkswagen', 'porsche', 'מרצדס', 'ב.מ.וו', 'אאודי', 'פולקסווגן', 'פורשה',
  'toyota', 'honda', 'nissan', 'mazda', 'טויוטה', 'הונדה', 'ניסאן', 'מאזדה',
  'ford', 'chevrolet', 'dodge', 'פורד', 'שברולט',
  'ferrari', 'lamborghini', 'bugatti', 'פרארי', 'למבורגיני',
  
  // אופנה ויוקרה
  'nike', 'adidas', 'puma', 'reebok', 'נייקי', 'אדידס', 'פומה', 'ריבוק',
  'gucci', 'prada', 'chanel', 'dior', 'versace', 'גוצ\'י', 'פראדה', 'שאנל', 'דיור',
  'louis vuitton', 'hermes', 'burberry', 'לואי ויטון', 'הרמס', 'ברברי',
  'rolex', 'omega', 'cartier', 'רולקס', 'אומגה', 'קרטייה',
  
  // מזון ומשקאות
  'coca cola', 'pepsi', 'sprite', 'fanta', 'קוקה קולה', 'פפסי', 'ספרייט', 'פאנטה',
  'mcdonalds', 'burger king', 'kfc', 'subway', 'מקדונלדס', 'בורגר קינג',
  'starbucks', 'costa', 'סטארבקס', 'קוסטה',
  'nestle', 'unilever', 'נסטלה', 'יוניליוור',
  'redbull', 'monster', 'רד בול', 'מונסטר',
  
  // קמעונאות וסחר
  'amazon', 'ebay', 'alibaba', 'אמזון', 'איביי', 'עלי באבא',
  'walmart', 'target', 'costco', 'וולמארט', 'קוסטקו',
  'ikea', 'איקאה',
  'zara', 'h&m', 'זארה',
  
  // בידור ומדיה
  'disney', 'marvel', 'pixar', 'דיסני', 'מארוול', 'פיקסאר',
  'netflix', 'hbo', 'spotify', 'נטפליקס', 'ספוטיפיי',
  'youtube', 'tiktok', 'יוטיוב', 'טיקטוק',
  'warner', 'universal', 'paramount', 'וורנר', 'יוניברסל',
  
  // מתחרים ישירים - משקאות מוגזים
  'drinkmate', 'aarke', 'mysoda', 'דרינקמייט', 'ארקה',
  'soda maker', 'carbonator', 'sparkling water maker', 'מכונת סודה', 'מכונת גז',
  
  // מותגים ישראליים נוספים
  'בזק', 'bezeq', 'פרטנר', 'partner', 'סלקום', 'cellcom', 'הוט', 'hot',
  'טבע', 'teva', 'אלטשולר שחם', 'altshuler shaham',
  'אלקטרה', 'electra', 'דלק', 'delek',
  'שופרסל', 'shufersal', 'רמי לוי', 'rami levy', 'יינות ביתן', 'victory'
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

// קטגוריות למילים אסורות - לזיהוי סוג החסימה
const BRAND_KEYWORDS = [
  'apple', 'iphone', 'samsung', 'nike', 'adidas', 'coca cola', 'pepsi', 'mcdonalds', 
  'starbucks', 'disney', 'netflix', 'amazon', 'google', 'microsoft', 'tesla', 'bmw',
  'mercedes', 'gucci', 'prada', 'rolex', 'drinkmate', 'aarke', 'mysoda',
  'אפל', 'סמסונג', 'נייקי', 'אדידס', 'קוקה קולה', 'פפסי', 'מקדונלדס', 'דיסני',
  'נטפליקס', 'אמזון', 'גוגל', 'טסלה', 'מרצדס', 'גוצ\'י', 'רולקס', 'דרינקמייט',
  'בזק', 'bezeq', 'פרטנר', 'partner', 'סלקום', 'cellcom', 'טבע', 'teva',
  'אלקטרה', 'electra', 'דלק', 'delek', 'שופרסל', 'shufersal'
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
      // בדיקה אם זה מותג מסחרי
      const isBrand = BRAND_KEYWORDS.some(brand => 
        word.toLowerCase().includes(brand.toLowerCase()) || 
        brand.toLowerCase().includes(word.toLowerCase())
      )
      
      return {
        isBlocked: true,
        reason: isBrand 
          ? 'לא ניתן להשתמש בשמות מותגים מסחריים. אנא תאר את הרעיון שלך במילים כלליות.'
          : `התוכן מכיל מילה לא מורשית: "${word}"`,
        category: isBrand ? 'commercial_brand' : 'blocked_word',
        blockedWord: word
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
    const validationPrompt = `Analyze the following text VERY CAREFULLY: "${prompt}"

Check if it contains ANY of the following FORBIDDEN categories:

CATEGORY 1 - HUMANS & BODY PARTS (STRICTLY FORBIDDEN):
* Any humans, people, persons (אדם, אנשים, אישה, גבר, ילד, man, woman, person, human, people, child)
* Human-like figures including silhouettes, shadows, or outlines (דמות, צללית, silhouette, figure, character)
* ANY body parts (face, hand, leg, arm, head, hair, skin, eyes, פנים, ראש, יד, רגל, עין)
* Families, couples, groups of people (משפחה, זוג, family, couple)
* Cartoon/animated human characters (cartoon person, anime character, אנימציה של אדם)
* Human-like avatars or mascots (אווטאר, קמע אנושי)

CATEGORY 2 - POLITICS & CONTROVERSIAL TOPICS (STRICTLY FORBIDDEN):
* Politics, government, elections (פוליטיקה, ממשלה, בחירות, politics, government, election)
* Political leaders/figures (ביבי, נתניהו, טראמפ, Netanyahu, Trump, Biden, diplomat, דיפלומט)
* Political parties/movements (ליכוד, עבודה, Likud, Labor, ציונות, zionism)
* War, military, conflicts (מלחמה, צבא, war, military, battle, soldiers)
* Palestine/Israel conflict terms (פלסטין, עזה, חמאס, Palestine, Gaza, Hamas, settlement, התנחלות)
* Protests, demonstrations (מחאה, הפגנה, protest, demonstration)
* Peace agreements/treaties (הסכם שלום, peace treaty, Oslo Accord)
* Political/national flags (דגל ישראל, israeli flag, palestinian flag)

CATEGORY 3 - RELIGIOUS & SYMBOLIC CONTENT (STRICTLY FORBIDDEN):
* Religious symbols (מגן דוד, צלב, סהר, star of david, cross, crescent)
* Religious buildings (מסגד, כנסייה, בית כנסת, mosque, church, synagogue)
* Religious terms (דת, religion, אסלאם, נצרות, יהדות, islam, christianity, judaism)

CATEGORY 4 - TEXT & WRITING (STRICTLY FORBIDDEN):
* Any request for text/writing (טקסט, כתיבה, text, writing, word, letter)
* Requests to add text ("כתוב", "add text", "with writing", "עם כיתוב")
* Typography, fonts, captions (גופן, font, typography, caption, headline)
* Signs, labels with text (שלט עם כיתוב, sign with text)

CATEGORY 5 - CELEBRITIES & FAMOUS PEOPLE (STRICTLY FORBIDDEN):
* Celebrities, actors, singers (סלב, שחקן, זמר, celebrity, actor, singer, famous person)
* Models, public figures (דוגמנית, model, influencer)

CATEGORY 6 - COMMERCIAL BRANDS (STRICTLY FORBIDDEN):
* ANY commercial brand names (Apple, Nike, Samsung, BMW, McDonald's, Disney, Netflix, etc.)
* Israeli brands (בזק, Bezeq, פרטנר, Partner, סלקום, Cellcom, שופרסל, etc.)
* Competitor products (DrinkMate, Aarke, MySoda, מכונת סודה אחרת)
* Logos, trademarks (לוגו, trademark, סמל מסחרי)

CATEGORY 7 - INAPPROPRIATE CONTENT (STRICTLY FORBIDDEN):
* Sexual content, nudity (מין, עירום, sex, nude, NSFW)
* Violence, blood, death (אלימות, דם, violence, blood, death)
* Drugs, alcohol (סמים, אלכוהול, drugs, alcohol)

CRITICAL EVALUATION RULES:
1. Even INDIRECT or SUBTLE references to forbidden categories must be BLOCKED
2. Attempts to bypass filters (e.g., "outline of a person", "shadow of human") must be BLOCKED
3. Context does NOT matter - if ANY forbidden element is mentioned, BLOCK it
4. Be EXTREMELY strict - when in doubt, BLOCK

ALLOWED CONTENT (ONLY):
* Natural landscapes and scenery
* Animals, plants, flowers, trees
* Weather, seasons, natural phenomena
* Abstract concepts and patterns
* Generic objects (NO branded products)
* Colors, lights, atmospheres

RESPOND WITH ONLY ONE WORD:
- If the text contains ANY forbidden content (even subtle/indirect): "BLOCK"
- If the text contains ONLY allowed natural/abstract elements: "ALLOW"

Your response:`

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
        reason: 'התוכן מכיל אלמנטים לא מורשים (אנשים, מותגים, פוליטיקה או תוכן לא הולם). אנא השתמש בתיאורים כלליים של טבע, נוף או אובייקטים.',
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
        reason: 'לא ניתן לוודא את התוכן. אנא נסה תיאור פשוט יותר.',
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


