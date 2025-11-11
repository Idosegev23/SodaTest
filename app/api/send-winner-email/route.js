import { supabase } from '../../../lib/supabaseClient'
import { sendWeeklyWinnerEmail } from '../../../lib/emailService'

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

export async function POST(request) {
  try {
    // בדיקת authorization פשוטה - רק admin יכול לקרוא לזה
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders
      })
    }

    // שליפת הזוכה האחרון
    const { data: lastWinner, error: winnerError } = await supabase
      .from('weekly_winners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (winnerError || !lastWinner) {
      return Response.json({ 
        error: 'No winner found',
        message: 'אין זוכה שבועי במסד הנתונים'
      }, { 
        status: 404,
        headers: corsHeaders
      })
    }

    // שליפת פרטי היצירה הזוכה
    const { data: winnerArtwork, error: artworkError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', lastWinner.artwork_id)
      .single()

    if (artworkError || !winnerArtwork) {
      return Response.json({ 
        error: 'Winner artwork not found',
        message: 'היצירה הזוכה לא נמצאה במסד הנתונים'
      }, { 
        status: 404,
        headers: corsHeaders
      })
    }

    // הכנת נתוני הזוכה למייל (שליחה למנהלים בלבד!)
    const winnerEmailData = {
      name: winnerArtwork.user_name,
      email: winnerArtwork.user_email,
      phone: winnerArtwork.user_phone,
      likes: winnerArtwork.likes || 0,
      prompt: winnerArtwork.prompt,
      artwork_url: winnerArtwork.image_url
    }

    // תאריכי השבוע
    const weekDates = {
      start: new Date(lastWinner.week_start_date || lastWinner.created_at),
      end: new Date(lastWinner.week_end_date || lastWinner.created_at)
    }
    
    // שליחת המייל למנהלים בלבד (לא למשתמשים!)
    const result = await sendWeeklyWinnerEmail(
      winnerEmailData,
      weekDates
    )

    return Response.json({ 
      success: true,
      message: '✅ המייל נשלח בהצלחה ל-3 מנהלים בלבד (לא למשתמשים!)',
      winner: {
        name: winnerArtwork.user_name,
        email: winnerArtwork.user_email,
        phone: winnerArtwork.user_phone,
        likes: winnerArtwork.likes,
        prompt: winnerArtwork.prompt?.substring(0, 100) + '...'
      },
      stats: {
        total_recipients: 3,
        admin_recipients: 3,
        user_recipients: 0
      }
    }, { 
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error sending winner email manually:', error)
    return Response.json({ 
      error: 'Failed to send winner email',
      details: error.message
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

