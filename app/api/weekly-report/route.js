import { supabase } from '../../../lib/supabaseClient'
import { sendWeeklyReport } from '../../../lib/emailService'

// פונקציה לשליפת נתוני Vercel Analytics
async function fetchVercelAnalytics(startDate, endDate) {
  try {
    const token = process.env.VERCEL_TOKEN
    const teamId = process.env.VERCEL_TEAM_ID
    const projectId = process.env.VERCEL_PROJECT_ID

    if (!token || !teamId || !projectId) {
      console.log('Missing Vercel credentials, skipping analytics')
      return null
    }

    // המרת תאריכים לפורמט timestamp (milliseconds)
    const since = startDate.getTime()
    const until = endDate.getTime()

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    // שליפת נתונים מ-Vercel Analytics API
    const analyticsUrl = `https://vercel.com/api/web/insights/stats/path?projectId=${projectId}&teamId=${teamId}&since=${since}&until=${until}&environment=production`
    
    console.log('Fetching Vercel Analytics from:', analyticsUrl)
    
    const response = await fetch(analyticsUrl, { headers })
    
    if (!response.ok) {
      console.error('Vercel Analytics API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return null
    }

    const data = await response.json()
    console.log('Vercel Analytics data:', JSON.stringify(data, null, 2))
    
    return {
      total_views: data.total || 0,
      unique_visitors: data.devices?.total || 0,
      devices: data.devices || {},
      top_pages: data.paths?.slice(0, 5) || [],
      countries: data.countries?.slice(0, 5) || [],
      referrers: data.referrers?.slice(0, 5) || []
    }
  } catch (error) {
    console.error('Error fetching Vercel Analytics:', error)
    return null
  }
}

export async function GET(request) {
  try {
    // בדיקת authorization - רק cron jobs או admin יכולים לקרוא לזה
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting weekly report generation...')

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

    console.log('Week range:', previousSunday.toISOString(), 'to', previousSaturday.toISOString())

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
      return Response.json({ error: 'Failed to fetch artworks' }, { status: 500 })
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
      .gte('week_start', previousSunday.toISOString())
      .lte('week_end', previousSaturday.toISOString())
      .order('selected_at', { ascending: false })
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

    // שליפת נתוני Vercel Analytics
    const analyticsData = await fetchVercelAnalytics(previousSunday, previousSaturday)
    console.log('Analytics data fetched:', analyticsData)

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

    console.log('Weekly report:', report)

    // שליחת הדוח במייל
    await sendWeeklyReport(report)

    return Response.json({ 
      message: 'Weekly report sent successfully',
      report
    }, { status: 200 })

  } catch (error) {
    console.error('Error generating weekly report:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

