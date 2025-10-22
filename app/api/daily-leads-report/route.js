import { supabase } from '../../../lib/supabaseClient'
import { sendDailyLeadsReport } from '../../../lib/emailService'

export async function GET(request) {
  try {
    // בדיקת authorization - רק cron jobs או admin יכולים לקרוא לזה
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Starting daily leads report generation

    // חישוב תאריכים לפי שעון ישראל (Asia/Jerusalem)
    // פונקציה ליצירת תאריך בשעון ישראל
    const getIsraeliDate = (date) => {
      const israelString = date.toLocaleString('en-US', { 
        timeZone: 'Asia/Jerusalem',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      return new Date(israelString)
    }

    // 1. קבלת התאריך הנוכחי בשעון ישראל
    const israelNow = getIsraeliDate(new Date())
    
    // 2. חישוב אתמול לפי שעון ישראל
    const israelYear = israelNow.getFullYear()
    const israelMonth = israelNow.getMonth()
    const israelDay = israelNow.getDate()
    
    // 3. בניית תאריכים לאתמול בשעון מקומי (00:00:00 - 23:59:59)
    // יצירת תאריכים ב-Israel timezone
    const yesterdayDate = new Date(israelYear, israelMonth, israelDay - 1)
    const yesterdayDateString = yesterdayDate.toLocaleDateString('en-CA') // YYYY-MM-DD format
    
    // בניית ISO strings עם timezone של ישראל
    // אנחנו יודעים שישראל היא UTC+2 (חורף) או UTC+3 (קיץ)
    const testDate = new Date(yesterdayDateString + 'T12:00:00')
    const israelOffset = testDate.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem', timeZoneName: 'short' }).includes('GMT+3') ? '+03:00' : '+02:00'
    
    // יצירת ISO strings לאתמול בשעון ישראל
    const yesterdayStartISO = `${yesterdayDateString}T00:00:00${israelOffset}`
    const yesterdayEndISO = `${yesterdayDateString}T23:59:59${israelOffset}`
    
    // המרה ל-Date objects (JavaScript אוטומטית ממיר ל-UTC)
    const yesterday = new Date(yesterdayStartISO)
    const yesterdayEnd = new Date(yesterdayEndISO)

    // Date range calculated for yesterday

    // שליפת כל הלידים מהיום הקודם
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .order('created_at', { ascending: false })

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return Response.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    // Leads fetched from yesterday

    // רשימת מיילים של שופטים - לא להראות בדוח
    const judgesEmails = [
      'dede.confidential@gmail.com',
      'shai.franco@gmail.com',
      'shabo.alon@gmail.com',
      'koketit.us@gmail.com',
      'amir.bavler@gmail.com'
    ]

    // סינון למיילים ייחודיים בלבד (unique emails)
    const uniqueLeadsMap = new Map()
    leads?.forEach(lead => {
      const email = lead.email?.toLowerCase()
      if (email && !judgesEmails.includes(email)) {
        // שומר רק את הליד האחרון (לפי created_at) לכל מייל
        if (!uniqueLeadsMap.has(email) || new Date(lead.created_at) > new Date(uniqueLeadsMap.get(email).created_at)) {
          uniqueLeadsMap.set(email, lead)
        }
      }
    })
    
    // המרה חזרה למערך של לידים ייחודיים
    const uniqueLeads = Array.from(uniqueLeadsMap.values())

    // שליפת יצירות מהיום הקודם (לסטטיסטיקה) - ללא שופטים
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('id, user_name, user_email, prompt, likes, created_at, image_url')
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .order('likes', { ascending: false })

    if (artworksError) {
      console.error('Error fetching artworks:', artworksError)
    }

    // סינון שופטים מהיצירות
    const filteredArtworks = artworks?.filter(a => 
      !judgesEmails.includes(a.user_email?.toLowerCase())
    ) || []

    // שליפת סטטיסטיקות כלליות (מתחילת הקמפיין)
    const { data: allArtworks } = await supabase
      .from('artworks')
      .select('id, likes, user_email, user_name, created_at', { count: 'exact' })
    
    // סינון שופטים מהסטטיסטיקות הכלליות
    const filteredAllArtworks = allArtworks?.filter(a => 
      !judgesEmails.includes(a.user_email?.toLowerCase())
    ) || []

    const { data: allLeads } = await supabase
      .from('leads')
      .select('id, created_at', { count: 'exact' })

    // שליפת נתוני התור
    const { data: queueData } = await supabase
      .from('queue')
      .select('id, status')

    // TOP 5 יצירות - רק עם לייקים (מעל 0) וללא שופטים
    const artworksWithLikes = filteredArtworks.filter(a => (a.likes || 0) > 0)
    const topArtworks = artworksWithLikes.slice(0, 5)
    
    const totalLikes = filteredArtworks.reduce((sum, a) => sum + (a.likes || 0), 0) || 0

    // חישוב משתמש הכי פעיל (הכי הרבה יצירות) - ללא שופטים
    const userActivityMap = {}
    filteredAllArtworks.forEach(artwork => {
      const email = artwork.user_email
      if (email) {
        if (!userActivityMap[email]) {
          userActivityMap[email] = {
            email: email,
            name: artwork.user_name || 'אנונימי',
            artworks_count: 0,
            total_likes: 0
          }
        }
        userActivityMap[email].artworks_count++
        userActivityMap[email].total_likes += (artwork.likes || 0)
      }
    })

    const topUsers = Object.values(userActivityMap)
      .sort((a, b) => b.artworks_count - a.artworks_count)
      .slice(0, 5)

    const mostActiveUser = topUsers[0] || null
    const mostLikedUser = Object.values(userActivityMap)
      .sort((a, b) => b.total_likes - a.total_likes)[0] || null

    // שליפת נתונים מהיום שלפני אתמול (להשוואה)
    const dayBeforeYesterday = new Date(yesterday)
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1)
    const dayBeforeYesterdayEnd = new Date(dayBeforeYesterday)
    dayBeforeYesterdayEnd.setHours(23, 59, 59, 999)

    const { data: previousDayLeads } = await supabase
      .from('leads')
      .select('id')
      .gte('created_at', dayBeforeYesterday.toISOString())
      .lte('created_at', dayBeforeYesterdayEnd.toISOString())

    const { data: previousDayArtworks } = await supabase
      .from('artworks')
      .select('id, likes')
      .gte('created_at', dayBeforeYesterday.toISOString())
      .lte('created_at', dayBeforeYesterdayEnd.toISOString())

    // חישוב שינוי אחוזי מהיום הקודם - מבוסס על לידים ייחודיים
    const leadsChange = previousDayLeads?.length > 0 
      ? ((uniqueLeads.length - previousDayLeads.length) / previousDayLeads.length * 100).toFixed(1)
      : (uniqueLeads.length > 0 ? '+100.0' : '0.0')
    
    const artworksChange = previousDayArtworks?.length > 0
      ? ((filteredArtworks.length - previousDayArtworks.length) / previousDayArtworks.length * 100).toFixed(1)
      : (filteredArtworks.length > 0 ? '+100.0' : '0.0')

    // ניתוח שעות פעילות - ללא שופטים
    const hourlyActivity = {}
    filteredArtworks.forEach(artwork => {
      const hour = new Date(artwork.created_at).getHours()
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1
    })
    
    const peakHour = Object.entries(hourlyActivity)
      .sort((a, b) => b[1] - a[1])[0]
    
    const peakHourFormatted = peakHour 
      ? `${peakHour[0]}:00-${parseInt(peakHour[0]) + 1}:00 (${peakHour[1]} יצירות)`
      : 'אין נתונים'

    // אם זה יום ראשון - שלוף את הזוכה השבועי האחרון
    const isSunday = new Date().getDay() === 0
    let weeklyWinner = null
    
    if (isSunday) {
      const { data: latestWinner } = await supabase
        .from('weekly_winners')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (latestWinner) {
        // שליפת פרטי היצירה הזוכה
        const { data: winningArtwork } = await supabase
          .from('artworks')
          .select('*')
          .eq('id', latestWinner.artwork_id)
          .single()
        
        weeklyWinner = {
          ...latestWinner,
          artwork: winningArtwork,
          week_start: new Date(latestWinner.week_start).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' }),
          week_end: new Date(latestWinner.week_end).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
        }
      }
    }

    // יצירת דוח מפורט - מבוסס על לידים ייחודיים
    const report = {
      date: yesterdayDateString, // התאריך של אתמול לפי שעון ישראל
      is_sunday: isSunday,
      summary: {
        total_leads: uniqueLeads.length, // מיילים ייחודיים בלבד!
        total_artworks_created: filteredArtworks.length,
        leads_with_consent: uniqueLeads.filter(l => l.consent).length,
        total_likes: totalLikes,
        leads_change: leadsChange,
        artworks_change: artworksChange
      },
      leads: uniqueLeads, // רק לידים ייחודיים
      yesterday_artworks: {
        total: filteredArtworks.length,
        total_likes: totalLikes,
        average_likes: filteredArtworks.length ? (totalLikes / filteredArtworks.length).toFixed(2) : '0.00',
        top_artworks: topArtworks.map(a => ({
          user_name: a.user_name,
          prompt: a.prompt?.substring(0, 100) + '...',
          likes: a.likes || 0,
          image_url: a.image_url
        }))
      },
      overall_stats: {
        total_leads_all_time: allLeads?.length || 0,
        total_artworks_all_time: filteredAllArtworks.length,
        total_likes_all_time: filteredAllArtworks.reduce((sum, a) => sum + (a.likes || 0), 0) || 0,
        average_likes_all_time: filteredAllArtworks.length ? 
          (filteredAllArtworks.reduce((sum, a) => sum + (a.likes || 0), 0) / filteredAllArtworks.length).toFixed(2) : '0.00'
      },
      user_insights: {
        most_active_user: mostActiveUser,
        most_liked_user: mostLikedUser,
        top_5_users: topUsers,
        total_unique_users: Object.keys(userActivityMap).length
      },
      activity_insights: {
        peak_hour: peakHourFormatted,
        hourly_breakdown: hourlyActivity
      },
      queue_stats: {
        total: queueData?.length || 0,
        pending: queueData?.filter(q => q.status === 'pending').length || 0,
        processing: queueData?.filter(q => q.status === 'processing').length || 0,
        done: queueData?.filter(q => q.status === 'done').length || 0,
        blocked: queueData?.filter(q => q.status === 'blocked').length || 0
      },
      weekly_winner: weeklyWinner
    }

    // Report generated

    // שליחת המייל עם קובץ CSV
    try {
      await sendDailyLeadsReport(report)
    } catch (emailError) {
      console.error('Error sending report email:', emailError)
      // נמשיך גם אם המייל נכשל
    }

    // שליחת הדוח ל-webhook נוסף (אופציונלי - Slack, Discord וכו')
    if (process.env.LEADS_WEBHOOK_URL) {
      try {
        const webhookResponse = await fetch(process.env.LEADS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Report-Type': 'daily-leads'
          },
          body: JSON.stringify({
            type: 'daily_leads_report',
            date: yesterdayDateString,
            report: report,
            formatted_message: formatReportMessage(report)
          })
        })

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', await webhookResponse.text())
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
        // נמשיך גם אם הwebhook נכשל
      }
    }

    return Response.json({
      success: true,
      report: report
    }, { status: 200 })

  } catch (error) {
    console.error('Error generating daily leads report:', error)
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// פונקציה לעיצוב הדוח לטקסט קריא
function formatReportMessage(report) {
  return `
📊 דוח לידים יומי - ${report.date}

📈 סיכום:
• סך הכל לידים: ${report.summary.total_leads}
• לידים עם הסכמה: ${report.summary.leads_with_consent}
• יצירות שנוצרו: ${report.summary.total_artworks_created}

🎨 סטטיסטיקת יצירות:
• סך הכל לייקים: ${report.artworks_stats.total_likes}
• ממוצע לייקים ליצירה: ${report.artworks_stats.average_likes}

📋 פירוט לידים:
${report.leads.map((lead, idx) => `
${idx + 1}. ${lead.name}
   📧 ${lead.email}
   📱 ${lead.phone || 'לא צוין'}
   ✅ הסכמה: ${lead.consent ? 'כן' : 'לא'}
   ⏰ ${new Date(lead.created_at).toLocaleString('he-IL')}
`).join('\n')}

---
דוח נוצר אוטומטית ב-${new Date().toLocaleString('he-IL')}
  `.trim()
}

// Allow POST as well for manual triggering
export async function POST(request) {
  return GET(request)
}

