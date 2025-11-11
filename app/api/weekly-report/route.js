import { supabase } from '../../../lib/supabaseClient'
import { sendWeeklyReport } from '../../../lib/emailService'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function GET(request) {
  try {
    // בדיקת authorization - רק cron jobs או admin יכולים לקרוא לזה
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders
      })
    }

    // Starting weekly report generation

    // חישוב תאריכים - שבוע אחרון (ראשון-שבת)
    const now = new Date()
    const lastSunday = new Date(now)
    lastSunday.setDate(now.getDate() - now.getDay()) // יום ראשון של השבוע הנוכחי
    lastSunday.setHours(0, 0, 0, 0)
    
    const lastSaturday = new Date(lastSunday)
    lastSaturday.setDate(lastSunday.getDate() + 6)
    lastSaturday.setHours(23, 59, 59, 999)

    // חישוב תאריכים של השבוע שעבר
    const previousSunday = new Date(lastSunday)
    previousSunday.setDate(lastSunday.getDate() - 7)
    
    const previousSaturday = new Date(lastSaturday)
    previousSaturday.setDate(lastSaturday.getDate() - 7)

    // Week range calculated

    // רשימת שופטים - לא לספור
    const judgesEmails = [
      'dede.confidential@gmail.com',
      'shai.franco@gmail.com',
      'shabo.alon@gmail.com',
      'koketit.us@gmail.com',
      'amir.bavler@gmail.com'
    ]

    // שליפת כל היצירות מהשבוע האחרון (ללא שופטים)
    const { data: weekArtworks, error: artworksError } = await supabase
      .from('artworks')
      .select('*')
      .gte('created_at', previousSunday.toISOString())
      .lte('created_at', previousSaturday.toISOString())
      .order('created_at', { ascending: false })

    if (artworksError) {
      console.error('Error fetching artworks:', artworksError)
      return Response.json({ error: 'Failed to fetch artworks' }, { 
        status: 500,
        headers: corsHeaders
      })
    }

    // סינון שופטים
    const filteredArtworks = weekArtworks?.filter(a => 
      !judgesEmails.includes(a.user_email?.toLowerCase())
    ) || []

    // חישוב unique users לפי מייל
    const uniqueUsers = new Set(
      filteredArtworks
        .filter(a => a.user_email)
        .map(a => a.user_email.toLowerCase())
    )

    // שליפת לידים מהשבוע
    const { data: weekLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', previousSunday.toISOString())
      .lte('created_at', previousSaturday.toISOString())

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
    }

    // חישוב סטטיסטיקות
    const totalLikes = filteredArtworks.reduce((sum, a) => sum + (a.likes || 0), 0)
    const avgLikes = filteredArtworks.length > 0 ? (totalLikes / filteredArtworks.length).toFixed(2) : '0.00'

    // TOP 5 יצירות
    const topArtworks = filteredArtworks
      .filter(a => (a.likes || 0) > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5)

    // שליפת הזוכה השבועי
    const { data: weeklyWinner } = await supabase
      .from('weekly_winners')
      .select('*')
      .gte('week_start_date', previousSunday.toISOString())
      .lte('week_end_date', previousSaturday.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let winnerDetails = null
    if (weeklyWinner) {
      const { data: winnerArtwork } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', weeklyWinner.artwork_id)
        .single()
      
      if (winnerArtwork) {
        winnerDetails = {
          ...weeklyWinner,
          artwork: winnerArtwork
        }
      }
    }

    // שליפת נתוני Analytics מ-Supabase (tracking משלנו!)
    const { data: pageViews, error: viewsError } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', previousSunday.toISOString())
      .lte('created_at', previousSaturday.toISOString())

    const { data: weekSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .gte('created_at', previousSunday.toISOString())
      .lte('created_at', previousSaturday.toISOString())

    // חישוב סטטיסטיקות analytics
    const totalPageViews = pageViews?.length || 0
    const uniqueVisitors = weekSessions?.length || 0
    
    // פילוח לפי מכשירים
    const deviceBreakdown = {}
    pageViews?.forEach(view => {
      const device = view.device_type || 'unknown'
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1
    })

    // פילוח לפי דפים
    const pageBreakdown = {}
    pageViews?.forEach(view => {
      const page = view.page_path || '/'
      pageBreakdown[page] = (pageBreakdown[page] || 0) + 1
    })
    const topPages = Object.entries(pageBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, count]) => ({ page, views: count }))

    // פילוח לפי referrers
    const referrerBreakdown = {}
    weekSessions?.forEach(session => {
      const ref = session.referrer || 'Direct'
      // חלץ דומיין בלבד
      let refName = 'Direct'
      if (ref && ref !== 'Direct') {
        try {
          const url = new URL(ref)
          refName = url.hostname.replace('www.', '')
        } catch {
          refName = ref
        }
      }
      referrerBreakdown[refName] = (referrerBreakdown[refName] || 0) + 1
    })
    const topReferrers = Object.entries(referrerBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([referrer, count]) => ({ referrer, visits: count }))

    const analyticsData = {
      total_views: totalPageViews,
      unique_visitors: uniqueVisitors,
      devices: deviceBreakdown,
      top_pages: topPages,
      referrers: topReferrers
    }
    
    // Analytics data fetched

    // יצירת הדוח
    const report = {
      week_start: previousSunday.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }),
      week_end: previousSaturday.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }),
      summary: {
        unique_users: uniqueUsers.size,
        total_artworks: filteredArtworks.length,
        total_leads: weekLeads?.length || 0,
        total_likes: totalLikes,
        average_likes: avgLikes
      },
      analytics: analyticsData,
      top_artworks: topArtworks.map(a => ({
        user_name: a.user_name,
        prompt: a.prompt?.substring(0, 100) + '...',
        likes: a.likes || 0,
        image_url: a.image_url
      })),
      weekly_winner: winnerDetails
    }

    // Weekly report generated

    // שליחת הדוח במייל למנהלים בלבד
    await sendWeeklyReport(report)

    return Response.json({ 
      message: 'Weekly report sent successfully to admins only',
      report
    }, { 
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error generating weekly report:', error)
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

