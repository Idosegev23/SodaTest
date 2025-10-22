import { supabase } from '../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const { pagePath, referrer, sessionId } = await request.json()

    // קבלת IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // קבלת User-Agent וזיהוי device type
    const userAgent = request.headers.get('user-agent') || ''
    let deviceType = 'desktop'
    if (/mobile/i.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet'
    }

    // שמירת page view
    const { error: viewError } = await supabase
      .from('page_views')
      .insert([{
        page_path: pagePath,
        referrer: referrer || null,
        user_agent: userAgent,
        device_type: deviceType,
        user_ip: ip,
        session_id: sessionId
      }])

    if (viewError) {
      console.error('Error tracking page view:', viewError)
    }

    // עדכון או יצירת session
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (existingSession) {
      // עדכון last_active
      await supabase
        .from('sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('session_id', sessionId)
    } else {
      // יצירת session חדש
      await supabase
        .from('sessions')
        .insert([{
          session_id: sessionId,
          user_ip: ip,
          device_type: deviceType,
          referrer: referrer || null
        }])
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in track-view:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

