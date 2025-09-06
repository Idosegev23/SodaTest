# הנחיות פריסה ב-Vercel

## שלבי הפריסה

### 1. העלאה ל-GitHub
```bash
git init
git add .
git commit -m "Initial commit - Art Generator Platform"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

### 2. חיבור ל-Vercel
1. כנס ל-[Vercel Dashboard](https://vercel.com/dashboard)
2. לחץ על "New Project"
3. חבר את ה-GitHub repository
4. בחר את הפרויקט

### 3. הגדרת משתני סביבה ב-Vercel
בעמוד הפרויקט ב-Vercel, עבור ל-Settings > Environment Variables והוסף:


**חשוב**: עדכן את `NEXT_PUBLIC_SITE_URL` לכתובת הסופית של האתר.

### 4. הגדרת Cron Jobs (Pro Plan נדרש)
הקובץ `vercel.json` כבר מוגדר עם Cron Job שרץ כל 30 שניות.

**הערה**: Cron Jobs זמינים רק ב-Vercel Pro plan ומעלה.

### 5. פריסה
1. לחץ על "Deploy" ב-Vercel
2. המתן לסיום הפריסה
3. עדכן את `NEXT_PUBLIC_SITE_URL` בהגדרות הפרויקט
4. בצע Redeploy

## בדיקת הפריסה

### אחרי הפריסה, בדוק:
1. **עמוד הבית** נטען עם הגלריה הנעה
2. **עמוד יצירה** עובד ומאפשר הזנת פרומפט
3. **Worker API** זמין ב: `https://your-domain.vercel.app/api/worker`
4. **Gemini API** זמין ב: `https://your-domain.vercel.app/api/gemini`

### בדיקת Worker:
```bash
curl https://your-domain.vercel.app/api/worker
```

צריך להחזיר: `{"message": "No pending items"}` או עיבוד של פריט.

## פתרון בעיות נפוצות

### 1. שגיאת Gemini API
- ודא שה-API Key תקין
- בדוק שיש מכסה זמינה ב-Google AI Studio

### 2. שגיאת Supabase
- ודא שכל הטבלאות קיימות
- בדוק שה-Storage bucket 'artworks' קיים
- ודא שה-RLS מוגדר נכון

### 3. Cron Jobs לא עובדים
- ודא שיש לך Vercel Pro plan
- בדוק את הלוגים ב-Functions tab

### 4. תמונות לא נטענות
- ודא שקובץ `public/file.png` קיים
- בדוק ש-Supabase Storage מוגדר נכון

## טיפים לביצועים

1. **מטמון תמונות**: Vercel מטמן תמונות אוטומטית
2. **CDN**: התמונות מ-Supabase מועברות דרך CDN
3. **דחיסה**: Next.js דוחס תמונות אוטומטית

## מעקב ולוגים

- **Function Logs**: Vercel Dashboard > Functions
- **Analytics**: Vercel Dashboard > Analytics  
- **Supabase Logs**: Supabase Dashboard > Logs

## אבטחה

1. **API Keys**: שמורים כמשתני סביבה
2. **RLS**: מופעל בכל הטבלאות
3. **Input Validation**: מיושם בכל הטפסים
4. **Content Filter**: פילטר תוכן אסור

## גיבוי

1. **Database**: Supabase מבצע גיבוי אוטומטי
2. **Storage**: Supabase Storage עם redundancy
3. **Code**: GitHub כ-source of truth
