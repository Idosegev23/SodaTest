# יוצר יצירות אומנות - פלטפורמת AI לאמנות

פלטפורמה לייצור יצירות אומנות בעזרת בינה מלאכותית, המשלבת את האובייקט שלכם בסצנות מותאמות אישית.

## 🎨 תכונות

- ✨ יצירת אומנות אוטומטית עם Google Gemini 2.5 Flash Image
- 🖼️ גלריה נעה ואינטראקטיבית עם תמונות בזמן אמת
- 🎯 שילוב מושלם של האובייקט שלכם בכל סצנה
- 📱 ממשק משתמש מותאם למובייל עם Tailwind CSS
- ⚡ עיבוד אוטומטי ברקע עם Vercel Cron Jobs
- 👑 בחירת זוכה שבועי אוטומטית (כל שבת 20:00)
- 📊 דוחות לידים יומיים עם CSV (כל יום 17:00)
- 📧 מערכת מיילים אוטומטית עם Nodemailer
- 🔗 וובהוקים לעדכונים בזמן אמת

## 🛠️ טכנולוגיות

- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Database + Storage), Google Gemini AI
- **Email**: Nodemailer (Gmail/SendGrid)
- **Image Processing**: Sharp (WebP conversion)
- **Deployment**: Vercel עם Cron Jobs (Pro)
- **UI Components**: Headless UI, Heroicons

## 🚀 התקנה מקומית

1. **שכפול הפרויקט**:
```bash
git clone <repository-url>
cd lptest
```

2. **התקנת תלויות**:
```bash
npm install
```

3. **הגדרת משתני סביבה**:
צור קובץ `.env.local` עם הערכים הבאים:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
WEBHOOK_URL=your_webhook_url (אופציונלי)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **הוספת תמונת האובייקט**:
- הכנס את התמונה שלך בשם `file.png` לתיקיית `public/`
- וודא שהתמונה יש לה רקע שקוף (PNG)

5. **הרצת השרת**:
```bash
npm run dev
```

## 📊 מבנה הנתונים

### טבלת queue
```sql
id          UUID PRIMARY KEY
user_name   TEXT NOT NULL
user_email  TEXT NOT NULL  
user_phone  TEXT NOT NULL
prompt      TEXT NOT NULL
status      TEXT DEFAULT 'pending' -- pending/processing/done
created_at  TIMESTAMP WITH TIME ZONE
```

### טבלת artworks
```sql
id          UUID PRIMARY KEY
user_name   TEXT NOT NULL
user_email  TEXT NOT NULL
user_phone  TEXT NOT NULL
prompt      TEXT NOT NULL
image_url   TEXT NOT NULL
created_at  TIMESTAMP WITH TIME ZONE
```

## 🔧 הגדרת Supabase

1. **יצירת טבלאות**:
הטבלאות נוצרות אוטומטית עם migration שמופעל בקוד.

2. **הגדרת Storage**:
```sql
-- יצירת bucket לתמונות
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true);
```

3. **הגדרת מדיניות RLS**:
המדיניות מוגדרת אוטומטית לאפשר קריאה ציבורית וכתיבה מבוקרת.

## 🚀 פריסה ב-Vercel

1. **חיבור ה-repository ל-Vercel**
2. **הגדרת משתני סביבה** בממשק Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `WEBHOOK_URL` (אופציונלי)
   - `NEXT_PUBLIC_SITE_URL` (כתובת האתר הסופית)

3. **Cron Jobs**:
קובץ `vercel.json` מגדיר Worker שרץ כל 30 שניות לעיבוד התמונות.

## 🎯 איך זה עובד

1. **משתמש מזין פרומפט** בעמוד היצירה
2. **מילוי פרטי משתמש** במודל
3. **הוספה לתור** בטבלת queue
4. **Worker מעבד** את הבקשה:
   - קורא לבינה המלאכותית של Gemini
   - מוסיף את האובייקט לסצנה
   - שומר את התמונה ב-Supabase Storage
   - מעדכן את הגלריה
5. **שליחת וובהוק** עם פרטי היצירה

## 🛡️ אבטחה ומגבלות

- **פילטר תוכן**: בדיקה אוטומטית של פרומפטים אסורים
- **RLS מופעל**: הגנה על נתונים ברמת השורה
- **ולידציה**: בדיקת נתוני משתמש לפני שליחה
- **מגבלות**: אין אנשים, טקסט, פוליטיקה או תוכן לא הולם

## 📞 תמיכה

לבעיות טכניות או שאלות, פנו לצוות הפיתוח.

## 📄 רישיון

פרויקט זה מוגן בזכויות יוצרים.