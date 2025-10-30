import { supabase } from '../../../lib/supabaseClient'

export async function GET(request) {
  try {
    // קבלת פרמטרים מהשאילתה
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // בניית תנאי תאריך
    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter.gte = startDate
      dateFilter.lte = endDate
    }

    // ===== נתונים כלליים (KPI) =====
    
    // סך הכל לידים
    const { data: allLeads, count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: false })
      .order('created_at', { ascending: false })

    const leadsWithConsent = allLeads?.filter(l => l.consent).length || 0

    // סך הכל יצירות
    const { data: allArtworks, count: totalArtworks } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: false })
      .order('created_at', { ascending: false })

    // סך הכל לייקים
    const totalLikes = allArtworks?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0

    // סך הכל צפיות
    const { data: allPageViews, count: totalPageViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: false })

    // Sessions ייחודיים
    const { data: allSessions, count: totalSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: false })

    // סטטוס תור
    const { data: queueData } = await supabase
      .from('queue')
      .select('id, status')

    const queueStats = {
      pending: queueData?.filter(q => q.status === 'pending').length || 0,
      processing: queueData?.filter(q => q.status === 'processing').length || 0,
      done: queueData?.filter(q => q.status === 'done').length || 0,
      blocked: queueData?.filter(q => q.status === 'blocked').length || 0,
      total: queueData?.length || 0
    }

    // זוכים שבועיים
    const { data: weeklyWinners } = await supabase
      .from('weekly_winners')
      .select('*')
      .order('created_at', { ascending: false })

    // ===== התפלגות לפי ימים בשבוע =====
    const dayOfWeekMap = {
      0: 'ראשון',
      1: 'שני',
      2: 'שלישי',
      3: 'רביעי',
      4: 'חמישי',
      5: 'שישי',
      6: 'שבת'
    }

    // התפלגות לידים לפי ימים
    const leadsByDay = {}
    allLeads?.forEach(lead => {
      const day = new Date(lead.created_at).getDay()
      const dayName = dayOfWeekMap[day]
      if (!leadsByDay[dayName]) {
        leadsByDay[dayName] = 0
      }
      leadsByDay[dayName]++
    })

    // התפלגות יצירות לפי ימים
    const artworksByDay = {}
    allArtworks?.forEach(artwork => {
      const day = new Date(artwork.created_at).getDay()
      const dayName = dayOfWeekMap[day]
      if (!artworksByDay[dayName]) {
        artworksByDay[dayName] = 0
      }
      artworksByDay[dayName]++
    })

    // התפלגות לייקים לפי ימים
    const likesByDay = {}
    allArtworks?.forEach(artwork => {
      const day = new Date(artwork.created_at).getDay()
      const dayName = dayOfWeekMap[day]
      if (!likesByDay[dayName]) {
        likesByDay[dayName] = 0
      }
      likesByDay[dayName] += (artwork.likes || 0)
    })

    // התפלגות צפיות לפי ימים
    const viewsByDay = {}
    allPageViews?.forEach(view => {
      const day = new Date(view.created_at).getDay()
      const dayName = dayOfWeekMap[day]
      if (!viewsByDay[dayName]) {
        viewsByDay[dayName] = 0
      }
      viewsByDay[dayName]++
    })

    // המרה לפורמט array עבור גרפים
    const dayOrder = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    const dayOfWeekStats = dayOrder.map(day => ({
      day,
      leads: leadsByDay[day] || 0,
      artworks: artworksByDay[day] || 0,
      likes: likesByDay[day] || 0,
      views: viewsByDay[day] || 0
    }))

    // ===== התפלגות לפי שעות =====
    const hourlyStats = {}
    for (let i = 0; i < 24; i++) {
      hourlyStats[i] = {
        hour: i,
        artworks: 0,
        leads: 0,
        likes: 0,
        views: 0
      }
    }

    allArtworks?.forEach(artwork => {
      const hour = new Date(artwork.created_at).getHours()
      hourlyStats[hour].artworks++
      hourlyStats[hour].likes += (artwork.likes || 0)
    })

    allLeads?.forEach(lead => {
      const hour = new Date(lead.created_at).getHours()
      hourlyStats[hour].leads++
    })

    allPageViews?.forEach(view => {
      const hour = new Date(view.created_at).getHours()
      hourlyStats[hour].views++
    })

    const hourlyData = Object.values(hourlyStats)

    // ===== טרנדים לפי תאריך =====
    const dateMap = {}
    
    allLeads?.forEach(lead => {
      const date = new Date(lead.created_at).toISOString().split('T')[0]
      if (!dateMap[date]) {
        dateMap[date] = { date, leads: 0, artworks: 0, likes: 0, views: 0 }
      }
      dateMap[date].leads++
    })

    allArtworks?.forEach(artwork => {
      const date = new Date(artwork.created_at).toISOString().split('T')[0]
      if (!dateMap[date]) {
        dateMap[date] = { date, leads: 0, artworks: 0, likes: 0, views: 0 }
      }
      dateMap[date].artworks++
      dateMap[date].likes += (artwork.likes || 0)
    })

    allPageViews?.forEach(view => {
      const date = new Date(view.created_at).toISOString().split('T')[0]
      if (!dateMap[date]) {
        dateMap[date] = { date, leads: 0, artworks: 0, likes: 0, views: 0 }
      }
      dateMap[date].views++
    })

    const dailyTrends = Object.values(dateMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    )

    // ===== TOP יצירות =====
    const topArtworks = [...(allArtworks || [])]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 10)
      .map(a => ({
        id: a.id,
        user_name: a.user_name,
        prompt: a.prompt,
        likes: a.likes || 0,
        created_at: a.created_at,
        image_url: a.image_url
      }))

    // ===== התפלגות מכשירים =====
    const deviceStats = {}
    allPageViews?.forEach(view => {
      const device = view.device_type || 'unknown'
      deviceStats[device] = (deviceStats[device] || 0) + 1
    })

    const deviceBreakdown = Object.entries(deviceStats).map(([device, count]) => ({
      device,
      count
    }))

    // ===== התפלגות לפי מדינה =====
    const countryStats = {}
    allPageViews?.forEach(view => {
      const country = view.country || 'Unknown'
      countryStats[country] = (countryStats[country] || 0) + 1
    })

    const countryBreakdown = Object.entries(countryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    // ===== מקורות טראפיק =====
    const referrerStats = {}
    allSessions?.forEach(session => {
      const ref = session.referrer || 'Direct'
      let refName = 'Direct'
      if (ref && ref !== 'Direct') {
        try {
          const url = new URL(ref)
          refName = url.hostname.replace('www.', '')
        } catch {
          refName = ref
        }
      }
      referrerStats[refName] = (referrerStats[refName] || 0) + 1
    })

    const referrerBreakdown = Object.entries(referrerStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }))

    // ===== משתמשים פעילים =====
    const userActivityMap = {}
    allArtworks?.forEach(artwork => {
      const email = artwork.user_email
      if (email) {
        if (!userActivityMap[email]) {
          userActivityMap[email] = {
            email,
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
      .slice(0, 10)

    // ===== צפיות לפי דף =====
    const pageStats = {}
    allPageViews?.forEach(view => {
      const page = view.page_path || '/'
      pageStats[page] = (pageStats[page] || 0) + 1
    })

    const pageBreakdown = Object.entries(pageStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }))

    // ===== חישוב ממוצעים =====
    const avgLikesPerArtwork = totalArtworks > 0 ? (totalLikes / totalArtworks).toFixed(2) : 0
    const conversionRate = totalLeads > 0 ? ((totalArtworks / totalLeads) * 100).toFixed(2) : 0

    // בניית תגובה
    const stats = {
      kpi: {
        totalLeads,
        leadsWithConsent,
        totalArtworks,
        totalLikes,
        totalPageViews,
        totalSessions,
        queueStats,
        weeklyWinnersCount: weeklyWinners?.length || 0,
        avgLikesPerArtwork: parseFloat(avgLikesPerArtwork),
        conversionRate: parseFloat(conversionRate)
      },
      dayOfWeek: dayOfWeekStats,
      hourly: hourlyData,
      dailyTrends,
      topArtworks,
      deviceBreakdown,
      countryBreakdown,
      referrerBreakdown,
      topUsers,
      pageBreakdown,
      rawData: {
        leads: allLeads || [],
        artworks: allArtworks || [],
        pageViews: allPageViews || [],
        sessions: allSessions || [],
        queue: queueData || [],
        weeklyWinners: weeklyWinners || []
      }
    }

    return Response.json(stats, { status: 200 })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return Response.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    )
  }
}

