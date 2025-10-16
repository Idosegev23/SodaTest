# Cron Jobs Documentation

## סקירה כללית

המערכת כוללת 3 Cron Jobs אוטומטיים:

### 1. Worker - עיבוד יצירות (`/api/worker`)
**תזמון**: כל דקה (`* * * * *`)  
**תפקיד**: מעבד יצירות אמנות ממתינות מהתור

**מה הוא עושה:**
- שולף פריט ממתין מהתור
- יוצר תמונה עם Gemini AI
- מעלה ל-Supabase Storage
- שומר ב-database
- שולח webhook (אם מוגדר)

### 2. בחירת זוכה שבועי (`/api/select-weekly-winner`)
**תזמון**: כל שבת ב-20:00 IST (`0 18 * * 6` UTC)  
**תפקיד**: בוחר את הזוכה השבועי

**מה הוא עושה:**
- מחפש את היצירה עם הכי הרבה לייקים מהשבוע
- מוודא שהמשתמש לא זכה בעבר
- מוודא שהמשתמש אינו שופט
- שומר את הזוכה בטבלה `weekly_winners`
- **שולח מייל הכרזה על הזוכה** עם תמונת היצירה
- שולח התראה נוספת ל-webhook (אם מוגדר - אופציונלי)

**משתמשים חסומים (שופטים):**
- dede.confidential@gmail.com
- shai.franco@gmail.com
- shabo.alon@gmail.com
- koketit.us@gmail.com

**פורמט המייל:**
- **נושא**: `👑 זוכה שבועי נבחר - [שם] - [X] לייקים`
- **תוכן HTML מעוצב** עם:
  - שם ומייל הזוכה
  - תמונת היצירה המוטמעת
  - תיאור היצירה
  - מספר הלייקים
  - תאריכי השבוע

### 3. דוח לידים יומי (`/api/daily-leads-report`)
**תזמון**: כל יום ב-17:00 IST (`0 15 * * *` UTC)  
**תפקיד**: יוצר דוח מפורט של כל הלידים מהיום הקודם

**מה הוא עושה:**
- שולף כל הלידים שנרשמו אתמול (00:00-23:59)
- יוצר סטטיסטיקות: סך לידים, לידים עם הסכמה, יצירות שנוצרו
- **שולח מייל עם קובץ CSV מצורף** לכתובת שהוגדרה
- שולח דוח נוסף ל-webhook (אם מוגדר - אופציונלי)

**פורמט המייל:**
- **נושא**: `📊 דוח לידים יומי - YYYY-MM-DD - X לידים חדשים`
- **תוכן HTML מעוצב** עם סיכום וסטטיסטיקות
- **קובץ CSV מצורף**: `leads-YYYY-MM-DD.csv`

**קובץ ה-CSV כולל:**
```csv
תאריך יצירה,שם,מייל,טלפון,הסכמה
2025-01-10 14:32:15,משה כהן,moshe@example.com,050-1234567,כן
```

הקובץ תומך בעברית (UTF-8 with BOM) ונפתח נכון ב-Excel

## הגדרת מערכת המיילים

כדי שהמערכת תוכל לשלוח מיילים, צריך להגדיר את המשתנים הבאים ב-Vercel:

```env
EMAIL_HOST=smtp.gmail.com  # או smtp אחר
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmail App Password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com  # מי יקבל את הדוחות
```

**למדריך מפורט**: ראה [EMAIL_SETUP.md](EMAIL_SETUP.md)

## אבטחה

כל ה-Cron Jobs מוגנים ב-authentication:
```javascript
Authorization: Bearer YOUR_CRON_SECRET
```

ללא ה-header הזה, הבקשה תידחה עם שגיאת 401.

## הפעלה ידנית

ניתן להפעיל כל Cron Job ידנית:

```bash
# בחירת זוכה שבועי
curl -X POST https://your-domain.vercel.app/api/select-weekly-winner \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# דוח לידים יומי
curl -X POST https://your-domain.vercel.app/api/daily-leads-report \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Webhooks (אופציונלי)

### Winner Webhook (`WINNER_WEBHOOK_URL`)
נשלח כאשר נבחר זוכה שבועי:

```json
{
  "type": "weekly_winner_selected",
  "winner": {
    "email": "user@example.com",
    "name": "שם המשתמש",
    "likes": 42,
    "artwork_url": "https://...",
    "prompt": "תיאור היצירה"
  },
  "week": {
    "start": "2025-01-05T00:00:00.000Z",
    "end": "2025-01-11T23:59:59.999Z"
  }
}
```

### Leads Webhook (`LEADS_WEBHOOK_URL`)
נשלח עם דוח יומי:

```json
{
  "type": "daily_leads_report",
  "date": "2025-01-10",
  "report": {
    "date": "2025-01-10",
    "summary": {
      "total_leads": 15,
      "total_artworks_created": 18,
      "leads_with_consent": 12
    },
    "leads": [...],
    "artworks_stats": {
      "total": 18,
      "total_likes": 245,
      "average_likes": "13.61"
    }
  },
  "formatted_message": "טקסט מעוצב..."
}
```

## שגיאות נפוצות

### 401 Unauthorized
- בדוק ש-`CRON_SECRET` מוגדר ב-Vercel
- ודא שה-Authorization header תקין

### No eligible winner found
- אין יצירות השבוע
- כל המשתמשים כבר זכו
- רק שופטים יש ביצירות

### Webhook failed
- בדוק שה-webhook URL תקין
- ודא שהשרת מקבל POST requests
- זה לא יכשיל את התהליך - רק ייכתב ללוג

## מעקב

### Vercel Dashboard
- Functions > Logs - לראות הרצות
- Crons - לראות סטטוס ה-cron jobs

### Supabase Dashboard
- Logs - לראות queries
- weekly_winners table - לראות זוכים היסטוריים

## תזמון UTC

**חשוב**: Vercel Cron פועל ב-UTC!

- שבת 20:00 IST (חורף) = 18:00 UTC → `0 18 * * 6`
- יומי 17:00 IST (חורף) = 15:00 UTC → `0 15 * * *`

**בקיץ** (UTC+3):
- שבת 20:00 IST = 17:00 UTC → `0 17 * * 6`
- יומי 17:00 IST = 14:00 UTC → `0 14 * * *`

עדכן את `vercel.json` בהתאם לעונה!

