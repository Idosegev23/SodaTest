# הגדרת מערכת המיילים - Nodemailer

## סקירה כללית

המערכת שולחת 2 סוגי מיילים אוטומטיים:
1. **דוח לידים יומי** - כל יום ב-17:00 עם קובץ CSV מצורף
2. **הודעת זוכה שבועי** - כל שבת ב-20:00

## 📋 משתני סביבה נדרשים

הוסף את המשתנים הבאים ב-Vercel (Settings > Environment Variables):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
```

## 🔐 הגדרה לפי ספק מייל

### Gmail (מומלץ)

#### שלב 1: הפעלת אימות דו-שלבי
1. עבור ל-[Google Account](https://myaccount.google.com/)
2. Security > 2-Step Verification
3. הפעל אימות דו-שלבי

#### שלב 2: יצירת App Password
1. עבור ל-[App Passwords](https://myaccount.google.com/apppasswords)
2. בחר "Mail" כאפליקציה
3. בחר "Other" כמכשיר והכנס שם (למשל: "Vercel Enso")
4. לחץ על Generate
5. העתק את הסיסמה שנוצרה (16 תווים)

#### הגדרות Gmail:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password שיצרת
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com  # המייל שיקבל את הדוחות
```

### Outlook / Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
EMAIL_TO=recipient@example.com
```

**הערה**: Outlook עשוי לחסום SMTP אם אין אימות דו-שלבי. מומלץ להפעיל.

### SendGrid (לפרודקשן - מומלץ)

SendGrid מספקת 100 מיילים חינם ביום, אמינות גבוהה ו-deliverability מעולה.

#### שלב 1: הרשמה
1. עבור ל-[SendGrid](https://sendgrid.com/)
2. צור חשבון חינם
3. אמת את המייל שלך

#### שלב 2: יצירת API Key
1. Settings > API Keys
2. Create API Key
3. תן שם: "Vercel Enso"
4. בחר "Full Access"
5. העתק את ה-API Key

#### הגדרות SendGrid:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxx  # API Key שיצרת
EMAIL_FROM=verified@yourdomain.com  # מייל מאומת ב-SendGrid
EMAIL_TO=recipient@example.com
```

**חשוב**: ב-SendGrid צריך לאמת את כתובת המייל השולחת (EMAIL_FROM).

## 📧 תוכן המיילים

### דוח לידים יומי

המייל כולל:
- **נושא**: `📊 דוח לידים יומי - YYYY-MM-DD - X לידים חדשים`
- **תוכן HTML מעוצב** עם:
  - סיכום: סך לידים, לידים עם הסכמה, יצירות שנוצרו
  - סטטיסטיקות: סך לייקים, ממוצע לייקים
- **קובץ CSV מצורף**: `leads-YYYY-MM-DD.csv`
  - תאריך יצירה
  - שם
  - מייל
  - טלפון
  - הסכמה

הקובץ CSV תומך בעברית (UTF-8 with BOM) ויפתח נכון ב-Excel.

### הודעת זוכה שבועי

המייל כולל:
- **נושא**: `👑 זוכה שבועי נבחר - [שם] - [X] לייקים`
- **תוכן HTML מעוצב** עם:
  - שם ומייל הזוכה
  - תמונת היצירה
  - תיאור היצירה
  - מספר הלייקים

## 🧪 בדיקה

### בדיקה מקומית (development)

1. צור קובץ `.env.local`:
```bash
cp .env.example .env.local
```

2. ערוך ומלא את פרטי המייל

3. הרץ את השרת:
```bash
npm run dev
```

4. בדוק את ה-API ידנית:

**דוח לידים:**
```bash
curl -X POST http://localhost:3000/api/daily-leads-report \
  -H "Authorization: Bearer your-cron-secret"
```

**זוכה שבועי:**
```bash
curl -X POST http://localhost:3000/api/select-weekly-winner \
  -H "Authorization: Bearer your-cron-secret"
```

### בדיקה ב-Vercel

1. הגדר את משתני הסביבה ב-Vercel
2. עשה Deploy
3. בדוק עם ה-URL של Vercel:

```bash
curl -X POST https://your-domain.vercel.app/api/daily-leads-report \
  -H "Authorization: Bearer your-cron-secret"
```

## 🔍 פתרון בעיות

### מייל לא נשלח

**בדוק:**
1. ✅ משתני הסביבה מוגדרים נכון ב-Vercel
2. ✅ App Password נכון (Gmail)
3. ✅ אימות דו-שלבי מופעל (Gmail)
4. ✅ המייל השולח (EMAIL_FROM) מאומת (SendGrid)
5. ✅ לא חסום firewall/security

**בדוק בלוגים:**
```bash
# ב-Vercel Dashboard
Functions > Logs > בחר את הפונקציה
```

### Gmail חוסם את השליחה

**פתרון:**
1. ודא שאימות דו-שלבי מופעל
2. צור App Password חדש
3. בדוק ב-Gmail Security checkup
4. נסה ספק אחר (SendGrid)

### מייל נכנס לספאם

**פתרון:**
1. השתמש ב-SendGrid (יותר אמין)
2. אמת את הדומיין שלך ב-SendGrid
3. הוסף SPF/DKIM records

### קובץ CSV לא נפתח נכון ב-Excel

הקובץ כולל BOM (Byte Order Mark) לתמיכה בעברית.
אם עדיין יש בעיה:
1. פתח את הקובץ ב-Google Sheets
2. או ב-Excel: Data > From Text/CSV > בחר UTF-8

## 📊 פורמט קובץ ה-CSV

```csv
תאריך יצירה,שם,מייל,טלפון,הסכמה
2025-01-10 14:32:15,משה כהן,moshe@example.com,050-1234567,כן
2025-01-10 15:45:23,שרה לוי,sara@example.com,052-9876543,כן
2025-01-10 16:12:08,דוד ישראלי,david@example.com,לא צוין,לא
```

הקובץ מייצא עם קידוד UTF-8 + BOM שמבטיח תמיכה מלאה בעברית.

## 🔒 אבטחה

1. **App Passwords**: השתמש תמיד ב-App Passwords, לעולם לא בסיסמה רגילה
2. **Environment Variables**: אל תשמור סיסמאות בקוד
3. **CRON_SECRET**: הגן על ה-API routes עם secret חזק
4. **HTTPS**: כל התקשורת מוצפנת

## 💡 המלצות

### לפיתוח
- Gmail עם App Password - פשוט וקל

### לפרודקשן
- **SendGrid** - אמין, מהיר, deliverability גבוה
- 100 מיילים/יום חינם
- ניטור ודוחות מובנים

## 🎯 דוגמה מלאה

```env
# Gmail - Development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-company@gmail.com
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop
EMAIL_FROM=your-company@gmail.com
EMAIL_TO=admin@example.com

# SendGrid - Production (מומלץ)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.Kxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=admin@yourdomain.com
```

## 📞 תמיכה נוספת

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Documentation](https://docs.sendgrid.com/)

