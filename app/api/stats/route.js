import { supabase } from '../../../lib/supabaseClient'

export async function GET(request) {
  try {
    // קבלת פרמטרים מהשאילתה
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // ===== בניית תנאי תאריך =====
    let leadsQuery = supabase.from('leads').select('*', { count: 'exact', head: false })
    let artworksQuery = supabase.from('artworks').select('*', { count: 'exact', head: false })
    let viewsQuery = supabase.from('page_views').select('*', { count: 'exact', head: false })
    let sessionsQuery = supabase.from('sessions').select('*', { count: 'exact', head: false })

    if (startDate) {
      const startDateISO = new Date(startDate).toISOString()
      leadsQuery = leadsQuery.gte('created_at', startDateISO)
      artworksQuery = artworksQuery.gte('created_at', startDateISO)
      viewsQuery = viewsQuery.gte('created_at', startDateISO)
      sessionsQuery = sessionsQuery.gte('created_at', startDateISO)
    }

    if (endDate) {
      const endDateObj = new Date(endDate)
      endDateObj.setHours(23, 59, 59, 999)
      const endDateISO = endDateObj.toISOString()
      leadsQuery = leadsQuery.lte('created_at', endDateISO)
      artworksQuery = artworksQuery.lte('created_at', endDateISO)
      viewsQuery = viewsQuery.lte('created_at', endDateISO)
      sessionsQuery = sessionsQuery.lte('created_at', endDateISO)
    }

    // ===== נתונים כלליים (KPI) =====
    
    // סך הכל לידים
    const { data: allLeads, count: totalLeads } = await leadsQuery.order('created_at', { ascending: false })

    const leadsWithConsent = allLeads?.filter(l => l.consent).length || 0

    // סך הכל יצירות
    const { data: allArtworks, count: totalArtworks } = await artworksQuery.order('created_at', { ascending: false })

    // סך הכל לייקים
    const totalLikes = allArtworks?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0

    // סך הכל צפיות
    const { data: allPageViews, count: totalPageViews } = await viewsQuery

    // Sessions ייחודיים
    const { data: allSessions, count: totalSessions } = await sessionsQuery

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

    // ===== התפלגות לפי תאריכים (14 ימים אחרונים או לפי טווח שנבחר) =====
    const last14Days = []
    
    // קביעת טווח התאריכים
    let rangeStart, rangeEnd
    if (startDate && endDate) {
      rangeStart = new Date(startDate)
      rangeEnd = new Date(endDate)
    } else {
      rangeEnd = new Date()
      rangeStart = new Date()
      rangeStart.setDate(rangeStart.getDate() - 13)
    }
    
    // יצירת רשימת תאריכים
    const daysDiff = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24))
    const daysToShow = Math.min(daysDiff + 1, 30) // מקסימום 30 ימים
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(rangeEnd)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      last14Days.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
        dayName: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][date.getDay()],
        leads: 0,
        artworks: 0,
        likes: 0,
        views: 0
      })
    }

    // מילוי הנתונים לכל תאריך (המרה ל-UTC date)
    allLeads?.forEach(lead => {
      const leadDate = new Date(lead.created_at)
      const dateStr = leadDate.toISOString().split('T')[0]
      const dayData = last14Days.find(d => d.date === dateStr)
      if (dayData) {
        dayData.leads++
      }
    })

    allArtworks?.forEach(artwork => {
      const artworkDate = new Date(artwork.created_at)
      const dateStr = artworkDate.toISOString().split('T')[0]
      const dayData = last14Days.find(d => d.date === dateStr)
      if (dayData) {
        dayData.artworks++
        dayData.likes += (artwork.likes || 0)
      }
    })

    allPageViews?.forEach(view => {
      const viewDate = new Date(view.created_at)
      const dateStr = viewDate.toISOString().split('T')[0]
      const dayData = last14Days.find(d => d.date === dateStr)
      if (dayData) {
        dayData.views++
      }
    })

    const dailyActivityStats = last14Days

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
      dailyActivity: dailyActivityStats,
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

