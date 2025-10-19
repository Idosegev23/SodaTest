import { supabase } from '../../../lib/supabaseClient'
import { sendDailyLeadsReport } from '../../../lib/emailService'

export async function GET(request) {
  try {
    // בדיקת authorization - רק cron jobs או admin יכולים לקרוא לזה
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting daily leads report generation...')

    // חישוב תאריכים - יום אתמול (00:00 עד 23:59)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)

    console.log('Fetching leads from:', yesterday, 'to', yesterdayEnd)

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

    console.log(`Found ${leads?.length || 0} leads from yesterday`)

    // שליפת יצירות מהיום הקודם (לסטטיסטיקה)
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('id, user_name, user_email, prompt, likes, created_at, image_url')
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .order('likes', { ascending: false })

    if (artworksError) {
      console.error('Error fetching artworks:', artworksError)
    }

    // שליפת סטטיסטיקות כלליות (מתחילת הקמפיין)
    const { data: allArtworks } = await supabase
      .from('artworks')
      .select('id, likes, user_email, user_name, created_at', { count: 'exact' })
    
    const { data: allLeads } = await supabase
      .from('leads')
      .select('id, created_at', { count: 'exact' })

    // שליפת נתוני התור
    const { data: queueData } = await supabase
      .from('queue')
      .select('id, status')

    const topArtworks = artworks?.slice(0, 5) || []
    const totalLikes = artworks?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0

    // חישוב משתמש הכי פעיל (הכי הרבה יצירות)
    const userActivityMap = {}
    allArtworks?.forEach(artwork => {
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

    // חישוב שינוי אחוזי מהיום הקודם
    const leadsChange = previousDayLeads?.length > 0 
      ? ((leads.length - previousDayLeads.length) / previousDayLeads.length * 100).toFixed(1)
      : (leads.length > 0 ? '+100.0' : '0.0')
    
    const artworksChange = previousDayArtworks?.length > 0
      ? ((artworks.length - previousDayArtworks.length) / previousDayArtworks.length * 100).toFixed(1)
      : (artworks.length > 0 ? '+100.0' : '0.0')

    // ניתוח שעות פעילות
    const hourlyActivity = {}
    artworks?.forEach(artwork => {
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

    // יצירת דוח מפורט
    const report = {
      date: yesterday.toISOString().split('T')[0],
      is_sunday: isSunday,
      summary: {
        total_leads: leads?.length || 0,
        total_artworks_created: artworks?.length || 0,
        leads_with_consent: leads?.filter(l => l.consent).length || 0,
        total_likes: totalLikes,
        leads_change: leadsChange,
        artworks_change: artworksChange
      },
      leads: leads || [],
      yesterday_artworks: {
        total: artworks?.length || 0,
        total_likes: totalLikes,
        average_likes: artworks?.length ? (totalLikes / artworks.length).toFixed(2) : '0.00',
        top_artworks: topArtworks.map(a => ({
          user_name: a.user_name,
          prompt: a.prompt?.substring(0, 100) + '...',
          likes: a.likes || 0,
          image_url: a.image_url
        }))
      },
      overall_stats: {
        total_leads_all_time: allLeads?.length || 0,
        total_artworks_all_time: allArtworks?.length || 0,
        total_likes_all_time: allArtworks?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0,
        average_likes_all_time: allArtworks?.length ? 
          (allArtworks.reduce((sum, a) => sum + (a.likes || 0), 0) / allArtworks.length).toFixed(2) : '0.00'
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

    console.log('Report generated:', report.summary)

    // שליחת המייל עם קובץ CSV
    try {
      await sendDailyLeadsReport(report)
      console.log('Report email sent successfully')
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
            date: yesterday.toISOString().split('T')[0],
            report: report,
            formatted_message: formatReportMessage(report)
          })
        })

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', await webhookResponse.text())
        } else {
          console.log('Report sent successfully to webhook')
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

