import { supabase } from '../../../lib/supabaseClient'
import { sendWeeklyWinnerEmail } from '../../../lib/emailService'

export async function POST(request) {
  try {
    // בדיקת authorization פשוטה - רק admin יכול לקרוא לזה
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
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
      }, { status: 404 })
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
      }, { status: 404 })
    }

    // שליחה רק למנהלים (3 מיילים ממשתני הסביבה)
    const allUsersEmails = [] // לא שולחים לכולם!

    // הכנת נתוני הזוכה למייל
    const winnerEmailData = {
      name: winnerArtwork.user_name,
      email: winnerArtwork.user_email,
      likes: winnerArtwork.likes || 0,
      prompt: winnerArtwork.prompt,
      artwork_url: winnerArtwork.image_url
    }

    // תאריכי השבוע
    const weekDates = {
      start: new Date(lastWinner.week_start_date || lastWinner.created_at),
      end: new Date(lastWinner.week_end_date || lastWinner.created_at)
    }
    
    // שליחת המייל לכל המשתמשים
    const result = await sendWeeklyWinnerEmail(
      winnerEmailData,
      weekDates,
      allUsersEmails
    )

    return Response.json({ 
      success: true,
      message: 'המייל נשלח בהצלחה לכל המשתמשים!',
      winner: {
        name: winnerArtwork.user_name,
        likes: winnerArtwork.likes,
        prompt: winnerArtwork.prompt?.substring(0, 100) + '...'
      },
      stats: {
        total_recipients: 3,
        admin_recipients: 3,
        user_recipients: 0
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error sending winner email manually:', error)
    return Response.json({ 
      error: 'Failed to send winner email',
      details: error.message
    }, { status: 500 })
  }
}

