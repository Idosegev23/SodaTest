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
      .select('id, user_email, likes, created_at')
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())

    if (artworksError) {
      console.error('Error fetching artworks:', artworksError)
    }

    // יצירת דוח מפורט
    const report = {
      date: yesterday.toISOString().split('T')[0],
      summary: {
        total_leads: leads?.length || 0,
        total_artworks_created: artworks?.length || 0,
        leads_with_consent: leads?.filter(l => l.consent).length || 0
      },
      leads: leads || [],
      artworks_stats: {
        total: artworks?.length || 0,
        total_likes: artworks?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0,
        average_likes: artworks?.length ? 
          (artworks.reduce((sum, a) => sum + (a.likes || 0), 0) / artworks.length).toFixed(2) : 0
      }
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

