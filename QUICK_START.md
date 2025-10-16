# Quick Start - הגדרה מהירה

## צעדים להפעלה

### 1. התקנת תלויות
```bash
npm install
```

### 2. הגדרת משתני סביבה

העתק את `.env.example` ל-`.env.local`:
```bash
cp .env.example .env.local
```

ערוך את `.env.local` והגדר:

#### חובה:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Google Gemini
GOOGLE_API_KEY=AIzaSyxxx...

# Cron Security
CRON_SECRET=your-strong-random-secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # Gmail App Password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=admin@example.com
```

#### אופציונלי:
```env
WEBHOOK_URL=https://hooks.slack.com/xxx
WINNER_WEBHOOK_URL=https://hooks.slack.com/xxx
LEADS_WEBHOOK_URL=https://hooks.slack.com/xxx
```

### 3. הגדרת Gmail App Password

1. עבור ל-[Google Account](https://myaccount.google.com/)
2. Security > 2-Step Verification (הפעל אם לא מופעל)
3. עבור ל-[App Passwords](https://myaccount.google.com/apppasswords)
4. צור App Password חדש
5. העתק את הסיסמה ל-`EMAIL_PASSWORD`

**למדריך מפורט**: [EMAIL_SETUP.md](EMAIL_SETUP.md)

### 4. הרצה מקומית

```bash
npm run dev
```

האתר יעלה ב: http://localhost:3000

### 5. בדיקת APIs

**בדיקת דוח לידים:**
```bash
curl -X POST http://localhost:3000/api/daily-leads-report \
  -H "Authorization: Bearer your-cron-secret"
```

**בדיקת זוכה שבועי:**
```bash
curl -X POST http://localhost:3000/api/select-weekly-winner \
  -H "Authorization: Bearer your-cron-secret"
```

### 6. Deploy ל-Vercel

```bash
# התחבר ל-Vercel
npm i -g vercel
vercel login

# Deploy
vercel
```

או:
1. העלה ל-GitHub
2. חבר ל-Vercel Dashboard
3. הוסף את משתני הסביבה ב-Settings
4. Deploy

## 📋 Checklist לפני Deploy

- [x] Supabase מוגדר ועובד
- [x] Google Gemini API Key קיים
- [x] Gmail App Password נוצר
- [x] משתני סביבה הוגדרו ב-Vercel
- [x] CRON_SECRET חזק
- [x] Vercel Pro plan (ל-Cron Jobs)
- [x] טבלה `weekly_winners` נוצרה

## 🎯 Cron Jobs

המערכת כוללת 3 Cron Jobs:
1. **Worker** - כל דקה
2. **זוכה שבועי** - שבת 20:00
3. **דוח לידים** - יומי 17:00

**למידע מפורט**: [CRON_JOBS.md](CRON_JOBS.md)

## 📚 תיעוד נוסף

- [DEPLOYMENT.md](DEPLOYMENT.md) - מדריך פריסה מלא
- [EMAIL_SETUP.md](EMAIL_SETUP.md) - הגדרת מערכת המיילים
- [CRON_JOBS.md](CRON_JOBS.md) - תיעוד Cron Jobs

## 🔧 פתרון בעיות

### מייל לא נשלח
- בדוק שה-App Password נכון
- בדוק שאימות דו-שלבי מופעל ב-Gmail
- בדוק לוגים ב-Vercel Functions

### Cron Job לא רץ
- ודא ש-Vercel Pro מופעל
- בדוק בלוג של הפונקציה
- הפעל ידנית לבדיקה

### תמונות לא נטענות
- בדוק Supabase Storage
- ודא שה-bucket `artworks` קיים
- בדוק ש-RLS מכבה לbucket

## 💡 טיפים

- השתמש ב-SendGrid לפרודקשן (יותר אמין)
- הגדר monitoring ב-Vercel
- בדוק לוגים באופן קבוע
- שמור גיבוי של ה-database

## 🚀 מוכן!

הכל מוגדר ומוכן לעבודה. המערכת תשלח:
- דוח לידים כל יום ב-17:00 📊
- הודעת זוכה שבועי כל שבת ב-20:00 👑

