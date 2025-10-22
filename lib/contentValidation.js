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
  
  // פוליטיקה וממשלה - רק מילים ספציפיות
  'פוליטיקה', 'ממשלה', 'בחירות', 'מפלגה', 'כנסת', 'ביבי', 'נתניהו', 'לפיד', 'גנץ', 'בנט',
  'politics', 'government', 'election', 'parliament', 'netanyahu', 'lapid', 'gantz',
  'פלסטינים', 'פלסטין', 'עזה', 'חמאס', 'palestine', 'gaza', 'hamas', 'fatah',
  'מלחמה', 'קרב', 'צבא', 'חיילים', 'war', 'battle', 'army', 'soldiers', 'military',
  // שמות מנהיגים ופוליטיקאים ספציפיים
  'נשיא ישראל', 'נשיא ארה״ב', 'president', 'prime minister',
  'דיפלומט', 'דיפלומטים', 'diplomat', 'diplomats',
  'שגריר', 'ambassador', 'שגרירות', 'embassy',
  'הפגנה', 'protest', 'demonstration', 'rally',
  'דגל ישראל', 'דגל פלסטין', 'israeli flag', 'palestinian flag',
  'ציונות', 'ציוני', 'zionism', 'zionist',
  'מתנחל', 'התנחלות', 'settler', 'settlement',
  'אינתיפאדה', 'intifada',
  'שלום עכשיו', 'peace now',
  'ליכוד', 'עבודה', 'meretz', 'מרצ', 'ש״ס', 'shas',
  'טראמפ', 'ביידן', 'אובמה', 'trump', 'biden', 'obama', 'בוש', 'bush',
  'פוטין', 'זלנסקי', 'putin', 'zelensky',
  'ריבלין', 'הרצוג', 'rivlin', 'herzog',
  
  // סמלים פוליטיים ודתיים - רק ספציפיים
  'מגן דוד', 'star of david', 'צלב קדוש', 'crucifix',
  'סהר ירח', 'crescent moon',
  'מסגד', 'כנסייה', 'בית כנסת', 'mosque', 'church', 'synagogue',
  'הסכם אוסלו', 'oslo accord',
  'הסכם שלום', 'peace treaty', 'peace agreement',
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
  'gore', 'bloody', 'corpse', 'גופה', 'דמים', 'שופך דם',
  
  // גזענות, שנאה וסמלים נאציים
  'nazi', 'נאצי', 'נאציזם', 'nazism', 'hitler', 'היטלר',
  'swastika', 'צלב קרס', 'צלב-קרס', 'קרס', 'צלב נאצי',
  'kkk', 'ku klux klan', 'קו קלוקס קלאן', 'קלו קלאקס קלאן',
  'white supremacy', 'עליונות לבנה', 'גזענות לבנה',
  'racism', 'racist', 'גזענות', 'גזעני', 'גזענים',
  'antisemitic', 'antisemitism', 'אנטישמי', 'אנטישמיות', 'שנאת יהודים',
  'holocaust denial', 'הכחשת שואה', 'הכחשת השואה',
  'ethnic cleansing', 'טיהור אתני', 'רצח עם', 'genocide',
  'hate symbol', 'סמל שנאה', 'hate speech', 'דברי שנאה',
  'white power', 'כוח לבן', 'supremacist', 'עליונות גזעית',
  'aryan', 'אריה', 'ארי',
  'SS', 'gestapo', 'גסטפו', 'reich', 'רייך',
  'fascist', 'fascism', 'פשיסט', 'פשיזם',
  'jihad', 'ג\'יהאד', 'isis', 'דאעש', 'al qaeda', 'אל קאעידה',
  'terrorist', 'טרוריסט', 'terror attack', 'פיגוע',
  'lynching', 'לינץ\'', 'hanging', 'תליה',
  'burning cross', 'צלב בוער',
  
  // סמים ואלכוהול
  'drugs', 'cocaine', 'heroin', 'marijuana', 'weed', 'alcohol', 'beer', 'wine', 'cigarette', 'smoke',
  'סמים', 'קוקאין', 'הרואין', 'מריחואנה', 'גראס', 'אלכוהול', 'בירה', 'יין', 'סיגריה', 'עישון',
  // סמים קשים נוספים (קטגוריה 9)
  'meth', 'methamphetamine', 'מת\'',
  'crack', 'קראק', 'crack cocaine',
  'lsd', 'אל.אס.די', 'acid',
  'ecstasy', 'אקסטזי', 'mdma', 'molly',
  'opium', 'אופיום',
  'fentanyl', 'פנטניל',
  'ketamine', 'קטמין',
  'crystal meth', 'קריסטל מת\'',
  
  // קללות ושפה גסה (קטגוריה 2) - רחב
  // עברית - קללות קשות (הוסרתי "כוס" - יש context checking)
  'זין', 'זיין', 'מניאק', 'מניאקים',
  'זונה', 'בן זונה', 'חרא', 'חארה', 'לעזאזל', 'קוקסינל', 'קוקס',
  'שרמוטה', 'זבל', 'מזדיין', 'להזדיין', 'זיון', 'מזיין',
  'כוסעמק', 'כוסאמא', 'כוסאמק', 'בת זונה',
  'מטומטם', 'אידיוט', 'דביל', 'מפגר', 'אוטיסט',
  'קרעתי אותך', 'תזדיין', 'לך תזדיין', 'תפוצץ לי', 'לך לעזאזל',
  // אנגלית - קללות וביטויים פוגעניים
  'fuck', 'fucking', 'fucker', 'motherfucker',
  'shit', 'bullshit', 'shitty',
  'bitch', 'bitches', 'son of a bitch',
  'asshole', 'ass', 'dumbass', 'badass',
  'bastard', 'whore', 'slut', 'prostitute',
  'cunt', 'dick', 'cock', 'pussy', 'prick',
  'damn', 'damned', 'goddamn',
  'idiot', 'moron', 'stupid', 'dumb', 'retard', 'retarded',
  
  // סמלים דתיים קיצוניים (קטגוריה 3)
  'satanic', 'שטני', 'satan', 'שטן',
  'pentagram', 'פנטגרם', 'inverted cross', 'צלב הפוך',
  'devil', 'demon', 'שד', 'דמון',
  'cult', 'כת', 'cult leader', 'מנהיג כת',
  'occult', 'אוקולטי', 'witchcraft', 'כישוף',
  'voodoo', 'וודו', 'black magic', 'קסם שחור',
  'sacrifice', 'הקרבה', 'ritual sacrifice',
  
  // דמויות מוגנות בזכויות יוצרים (קטגוריה 5)
  'mickey mouse', 'מיקי מאוס', 'donald duck', 'דונלד דאק',
  'superman', 'סופרמן', 'batman', 'באטמן', 'joker', 'ג\'וקר',
  'spiderman', 'ספיידרמן', 'spider-man', 'iron man', 'איירון מן',
  'captain america', 'קפטן אמריקה', 'thor', 'תור',
  'hulk', 'האלק', 'black widow', 'אלמנה שחורה',
  'elsa', 'אלזה', 'frozen', 'פרוזן', 'anna', 'אנה',
  'pokemon', 'פוקימון', 'pikachu', 'פיקאצ\'ו',
  'sonic', 'סוניק', 'mario', 'מריו', 'luigi', 'לואיג\'י',
  'harry potter', 'הארי פוטר', 'hermione', 'הרמיוני',
  'star wars', 'מלחמת הכוכבים', 'darth vader', 'דארת\' ויידר',
  'minions', 'מיניונים', 'despicable me',
  
  // אסונות וטרגדיות היסטוריות (קטגוריה 6)
  '9/11', 'twin towers', 'המגדלים התאומים', 'world trade center',
  'holocaust', 'שואה', 'auschwitz', 'אושוויץ',
  'hiroshima', 'הירושימה', 'nagasaki', 'נגסאקי',
  'atomic bomb', 'פצצה אטומית', 'nuclear bomb',
  'chernobyl', 'צ\'רנוביל', 'fukushima', 'פוקושימה',
  'tsunami', 'צונאמי', 'earthquake disaster', 'רעידת אדמה קטלנית',
  'titanic', 'טיטניק',
  
  // תוכן מיני מרומז (קטגוריה 7)
  'sexy', 'סקסי', 'seductive', 'מפתה',
  'lingerie', 'הלבשה תחתונה', 'underwear', 'תחתונים',
  'bikini', 'ביקיני', 'thong', 'חוטיני',
  'stripper', 'חשפנית', 'striptease', 'חשפנות',
  'lap dance', 'ריקוד חיק', 'pole dance',
  'provocative', 'מגרה', 'sensual', 'חושני',
  'horny', 'מעורר', 'aroused', 'מעורר',
  
  // סמלים קומוניסטים ואנרכיסטים (קטגוריה 8)
  'communist', 'קומוניסט', 'communism', 'קומוניזם',
  'hammer and sickle', 'פטיש ומגל', 'soviet', 'סובייטי',
  'lenin', 'לנין', 'stalin', 'סטלין',
  'mao', 'מאו', 'mao zedong', 'מאו דזה-דונג',
  'che guevara', 'צ\'ה גווארה',
  'anarchist', 'אנרכיסט', 'anarchy', 'אנרכיה',
  'anarchy symbol', 'סמל אנרכיה',
  'red flag', 'דגל אדום', 'revolutionary', 'מהפכני',
  
  // נשק ואלימות ספציפיים (קטגוריה 10)
  'assault rifle', 'רובה סער', 'rifle', 'רובה',
  'ak47', 'ak-47', 'm16', 'uzi', 'עוזי',
  'grenade', 'רימון', 'hand grenade', 'רימון יד',
  'explosive', 'חומר נפץ', 'bomb', 'פצצה',
  'machete', 'מצ\'טה', 'chainsaw', 'מסור חשמלי',
  'sword', 'חרב', 'dagger', 'פגיון',
  'torture', 'עינויים', 'torturing', 'מענה',
  'execution', 'הוצאה להורג', 'firing squad', 'כיתת יורים',
  'decapitation', 'עריפת ראש', 'beheading', 'עריפה',
  'ammunition', 'תחמושת', 'bullet', 'כדור', 'bullets', 'כדורים',
  
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
  
  // אופנה ויוקרה (הסרתי Chanel - Coco Chanel היא אמנית היסטורית)
  'nike', 'adidas', 'puma', 'reebok', 'נייקי', 'אדידס', 'פומה', 'ריבוק',
  'gucci', 'prada', 'dior', 'versace', 'גוצ\'י', 'פראדה', 'דיור',
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

// ביטויים מותרים שיכולים להכיל מילים חסומות בהקשר תמים
const ALLOWED_PHRASES = [
  // כוס בהקשר של כלי שתיה
  'כוס סודה', 'כוס מים', 'כוס קפה', 'כוס תה', 'כוס משקה', 'כוס זכוכית',
  'glass of soda', 'glass of water', 'soda glass', 'drinking glass',
  // תוכן דתי חיובי
  'אלוהים', 'ברוך אלוהים', 'תהילה לאל', 'god', 'divine', 'blessed',
  'שמש ירח כוכבים', 'sun moon stars',
  // אמנים ואומנות היסטורית
  'אנדי וורהול', 'andy warhol', 'בסקיאט', 'basquiat', 'jean-michel basquiat',
  'coco chanel', 'קוקו שאנל',
  'מונה ליזה', 'mona lisa', 'לאונרדו דה וינצ\'י', 'leonardo da vinci',
  'וינסנט ואן גוך', 'vincent van gogh', 'פיקאסו', 'picasso',
  'הלובר', 'louvre', 'מוזיאון', 'museum',
  // ספרים ויצירות ספרות
  'הספר הוגו', 'ויקטור הוגו', 'victor hugo', 'ספר הוגו',
  // דמויות פולקלור כלליות
  'פיות', 'פייה', 'fairy', 'fairies', 'פנטזיה', 'fantasy',
  'שדונים', 'אלפים', 'elves', 'elf', 'דמויות דמיוניות',
  // הקשרים תמימים נוספים
  'השראת', 'בהשראת', 'inspired by', 'inspiration from'
]

// אמנים ויוצרים היסטוריים (לא לחסום)
const ALLOWED_ARTISTS = [
  'andy warhol', 'אנדי וורהול',
  'basquiat', 'בסקיאט', 'jean-michel basquiat',
  'pablo picasso', 'פיקאסו',
  'vincent van gogh', 'ואן גוך',
  'claude monet', 'מונה',
  'salvador dali', 'דאלי',
  'leonardo da vinci', 'דה וינצ\'י',
  'michelangelo', 'מיכלאנג\'לו',
  'rembrandt', 'רמברנדט',
  'frida kahlo', 'פרידה קאלו',
  'coco chanel', 'קוקו שאנל',
  'victor hugo', 'ויקטור הוגו'
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

// פונקציה לנורמליזציה של טקסט - מזהה וריאציות ועקיפות
function normalizeText(text) {
  return text.toLowerCase()
    // החלפת תווים שמשמשים לעקיפה
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '') // הסרת רווחים (למשל: f u c k -> fuck)
}

// פונקציה לבדיקת מילים אסורות (שכבה ראשונה) - חיפוש מילים שלמות
export function checkBlockedWords(prompt) {
  const lowerPrompt = prompt.toLowerCase()
  const normalizedPrompt = normalizeText(prompt)
  
  // בדיקה 1: ביטויים מותרים (prioritize over blocked words)
  for (const phrase of ALLOWED_PHRASES) {
    if (lowerPrompt.includes(phrase.toLowerCase())) {
      return {
        isBlocked: false,
        reason: null,
        category: 'allowed_phrase'
      }
    }
  }
  
  // בדיקה 2: אמנים היסטוריים מותרים
  for (const artist of ALLOWED_ARTISTS) {
    if (lowerPrompt.includes(artist.toLowerCase())) {
      return {
        isBlocked: false,
        reason: null,
        category: 'allowed_artist'
      }
    }
  }
  
  // בדיקה 3: מילים מותרות בהקשר
  for (const allowedWord of ALLOWED_CONTEXT_WORDS) {
    if (lowerPrompt.includes(allowedWord.toLowerCase())) {
      return {
        isBlocked: false,
        reason: null,
        category: 'allowed_context'
      }
    }
  }
  
  // בדיקה 4: מילים אסורות
  for (const word of BLOCKED_WORDS) {
    const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i')
    const normalizedWord = normalizeText(word)
    
    // בדיקה ראשונה - טקסט מקורי
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
    
    // בדיקה שנייה - טקסט מנורמל (זיהוי וריאציות כמו n@zi, f*ck)
    if (normalizedPrompt.includes(normalizedWord)) {
      return {
        isBlocked: true,
        reason: `התוכן מכיל מילה לא מורשית (זוהתה וריאציה של: "${word}")`,
        category: 'blocked_word_variation',
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
    const validationPrompt = `Analyze this text: "${prompt}"

Check if it contains these FORBIDDEN categories:

FORBIDDEN - HUMANS:
* Any people, persons, humans (אדם, אנשים, אישה, גבר, ילד, man, woman, person, human, child)
* Body parts (face, hand, body, פנים, יד, גוף)
* Families, couples (משפחה, זוג, family, couple)

FORBIDDEN - POLITICS:
* Political topics (פוליטיקה, ממשלה, politics, government, election)
* War, military (מלחמה, צבא, war, military, army)
* Israel/Palestine conflict (פלסטין, עזה, חמאס, Palestine, Gaza, Hamas)
* Political leaders by name (נתניהו, ביבי, Trump, Biden, Netanyahu)

FORBIDDEN - TEXT REQUESTS:
* Requests to add text to image (טקסט, כתוב, text, writing, add text, with text, caption)

FORBIDDEN - INAPPROPRIATE:
* Sexual/nude content (מין, עירום, sex, nude, NSFW, porn)
* Violence, blood, gore (אלימות, דם, violence, blood, death, kill, gore)
* Drugs (סמים, drugs)

FORBIDDEN - HATE & EXTREMISM:
* Nazi symbols, swastikas (נאצי, צלב קרס, nazi, swastika, Hitler)
* KKK, white supremacy (kkk, ku klux klan, white power, עליונות לבנה)
* Racism, hate symbols (גזענות, racism, hate symbol, סמל שנאה)
* Antisemitism (אנטישמיות, antisemitism, שנאת יהודים)
* Terrorism, ISIS, extremism (טרור, isis, דאעש, terrorist, jihad)
* Holocaust denial (הכחשת שואה)
* Ethnic violence (טיהור אתני, genocide, לינץ')

FORBIDDEN - PROFANITY & OFFENSIVE LANGUAGE:
* Strong profanity (fuck, shit, bitch, זין, כוס, חרא, זונה)
* Offensive slurs and insults (whore, slut, מטומטם, אידיוט)
* Vulgar expressions in any language

FORBIDDEN - OCCULT & SATANIC:
* Satanic symbols (pentagram, inverted cross, פנטגרם, צלב הפוך)
* Demon, devil worship (שטן, devil, demon, שד)
* Cult activities (כת, cult, witchcraft, קסם שחור)

FORBIDDEN - COPYRIGHTED CHARACTERS:
* Disney characters (Mickey Mouse, Elsa, Frozen, מיקי מאוס, אלזה)
* Marvel/DC heroes (Superman, Batman, Spiderman, סופרמן, באטמן)
* Pokemon, Nintendo characters (Pikachu, Mario, פוקימון, מריו)
* Star Wars, Harry Potter characters

ALLOWED - HISTORICAL ART & ARTISTS:
* Historical artists ARE ALLOWED (Andy Warhol, Basquiat, Picasso, Van Gogh, Coco Chanel, Victor Hugo, etc.)
* Art museums and galleries ARE ALLOWED (Louvre, הלובר, museum, מוזיאון)
* Famous artworks ARE ALLOWED (Mona Lisa, מונה ליזה)
* Literary works and books ARE ALLOWED (הספר הוגו, ספר)

ALLOWED - INNOCENT CONTEXTS:
* "כוס סודה", "כוס מים", "glass of soda" - innocent drinking glass context - ALLOWED
* "אלוהים", "god" in positive/spiritual context - ALLOWED
* "פיות", "fairies", "fantasy" - generic folklore creatures - ALLOWED
* "שמש ירח כוכבים" - celestial bodies - ALLOWED

FORBIDDEN - HISTORICAL TRAGEDIES:
* 9/11, twin towers (המגדלים התאומים)
* Holocaust, Auschwitz (שואה, אושוויץ)
* Hiroshima, atomic bombs (הירושימה, פצצה אטומית)
* Major disasters (Chernobyl, tsunami disasters)

FORBIDDEN - SEXUAL CONTENT (including suggestive):
* Sexy, seductive imagery (סקסי, מפתה, sexy, seductive)
* Lingerie, bikinis (הלבשה תחתונה, ביקיני, lingerie, bikini)
* Strip clubs, provocative (חשפנית, stripper, provocative)

FORBIDDEN - COMMUNIST/ANARCHIST SYMBOLS:
* Hammer and sickle (פטיש ומגל)
* Soviet symbols, Lenin, Stalin (סובייטי, לנין, סטלין)
* Che Guevara, Mao (צ'ה גווארה, מאו)
* Anarchy symbols (סמל אנרכיה, anarchy symbol)

FORBIDDEN - HARD DRUGS:
* Meth, crack, LSD (מת', קראק, אל.אס.די)
* Ecstasy, MDMA, fentanyl (אקסטזי, פנטניל)
* Opium, ketamine (אופיום, קטמין)

FORBIDDEN - WEAPONS & EXTREME VIOLENCE:
* Assault rifles (רובה סער, AK47, M16, Uzi)
* Grenades, explosives (רימון, חומר נפץ, grenade, explosive)
* Torture, execution (עינויים, הוצאה להורג, torture, execution)
* Chainsaw, machete violence (מסור חשמלי, מצ'טה)

FORBIDDEN - COMMERCIAL:
* Brand names (Apple, Nike, Samsung, McDonald's, etc.)
* Competitor products (DrinkMate, Aarke, MySoda)

ALLOWED:
* Natural landscapes, scenery
* Animals, plants, flowers, trees
* Weather, seasons
* Abstract patterns
* Generic objects
* Colors and atmospheres

IMPORTANT: Be reasonable - only block OBVIOUS violations. Natural phrases like "השראה" (inspiration) should be ALLOWED even if they contain short substrings.

Respond with ONLY:
"BLOCK" - if text clearly violates above rules
"ALLOW" - if text is safe and natural

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
  // שכבה ראשונה - בדיקת מילים אסורות
  const wordCheck = checkBlockedWords(prompt)
  if (wordCheck.isBlocked) {
    return wordCheck
  }
  
  // שכבה שנייה - בדיקה עם Gemini AI
  const aiCheck = await validateWithGemini(prompt)
  if (aiCheck.isBlocked) {
    return aiCheck
  }
  return {
    isBlocked: false,
    reason: null,
    category: 'approved'
  }
}


