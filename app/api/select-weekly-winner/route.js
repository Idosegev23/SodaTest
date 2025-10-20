import { supabase } from '../../../lib/supabaseClient'
import { sendWeeklyWinnerEmail } from '../../../lib/emailService'

export async function GET(request) {
  try {
    // בדיקת authorization - רק cron jobs או admin יכולים לקרוא לזה
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting weekly winner selection...')

    // רשימת מיילים של שופטים שלא יכולים לזכות
    const judgesEmails = [
      'dede.confidential@gmail.com',
      'shai.franco@gmail.com',
      'shabo.alon@gmail.com',
      'koketit.us@gmail.com',
      'amir.bavler@gmail.com'
    ]

    // קביעת תאריכי השבוע הנוכחי (ראשון-שבת)
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = ראשון, 6 = שבת
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - dayOfWeek) // חזרה לראשון האחרון
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // שבת
    weekEnd.setHours(23, 59, 59, 999)

    console.log('Week range:', weekStart, 'to', weekEnd)

    // שליפת כל היצירות מהשבוע הנוכחי
    const { data: weekArtworks, error: artworksError } = await supabase
      .from('artworks')
      .select('*')
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .order('likes', { ascending: false })

    if (artworksError) {
      console.error('Error fetching artworks:', artworksError)
      return Response.json({ error: 'Failed to fetch artworks' }, { status: 500 })
    }

    if (!weekArtworks || weekArtworks.length === 0) {
      console.log('No artworks found for this week')
      return Response.json({ message: 'No artworks this week', weekStart, weekEnd }, { status: 200 })
    }

    console.log(`Found ${weekArtworks.length} artworks this week`)

    // שליפת זוכים קודמים
    const { data: previousWinners } = await supabase
      .from('weekly_winners')
      .select('user_email')

    const previousWinnersEmails = previousWinners ? previousWinners.map(w => w.user_email.toLowerCase()) : []

    // סינון יצירות כשירות לזכייה (לא שופטים, לא זוכים קודמים)
    const eligibleArtworks = weekArtworks.filter(artwork => {
      const email = (artwork.user_email || '').toLowerCase()
      return !judgesEmails.includes(email) && !previousWinnersEmails.includes(email)
    })

    if (!eligibleArtworks || eligibleArtworks.length === 0) {
      console.log('No eligible winner found')
      return Response.json({ 
        message: 'No eligible winner found',
        totalArtworks: weekArtworks.length,
        weekStart,
        weekEnd
      }, { status: 200 })
    }

    // מציאת מספר הלייקים הגבוה ביותר
    const maxLikes = eligibleArtworks[0].likes || 0

    // מציאת כל היצירות עם מספר הלייקים הגבוה ביותר (תיקו)
    const topArtworks = eligibleArtworks.filter(artwork => (artwork.likes || 0) === maxLikes)

    console.log(`Found ${topArtworks.length} artworks with ${maxLikes} likes (tied for first place)`)

    // בחירה רנדומלית מבין המועמדים (במקרה של תיקו)
    const randomIndex = Math.floor(Math.random() * topArtworks.length)
    const eligibleWinner = topArtworks[randomIndex]

    console.log('Winner selected:', eligibleWinner.user_email, 'with', eligibleWinner.likes, 'likes', 
                topArtworks.length > 1 ? `(randomly selected from ${topArtworks.length} tied artworks)` : '')

    // שמירת הזוכה בטבלה
    const { data: winnerRecord, error: insertError } = await supabase
      .from('weekly_winners')
      .insert([{
        artwork_id: eligibleWinner.id,
        user_email: eligibleWinner.user_email,
        week_start_date: weekStart.toISOString().split('T')[0],
        week_end_date: weekEnd.toISOString().split('T')[0],
        likes_count: eligibleWinner.likes || 0
      }])
      .select()

    if (insertError) {
      console.error('Error saving winner:', insertError)
      return Response.json({ error: 'Failed to save winner' }, { status: 500 })
    }

    console.log('Winner saved successfully:', winnerRecord)

    // שליחת מייל על הזוכה
    try {
      await sendWeeklyWinnerEmail(
        {
          email: eligibleWinner.user_email,
          name: eligibleWinner.user_name,
          likes: eligibleWinner.likes,
          artwork_url: eligibleWinner.image_url,
          prompt: eligibleWinner.prompt
        },
        {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString()
        }
      )
      console.log('Winner email sent successfully')
    } catch (emailError) {
      console.error('Error sending winner email:', emailError)
      // לא נכשיל את כל התהליך בגלל מייל
    }

    // שליחת webhook נוסף (אופציונלי - Slack, Discord וכו')
    if (process.env.WINNER_WEBHOOK_URL) {
      try {
        await fetch(process.env.WINNER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'weekly_winner_selected',
            winner: {
              email: eligibleWinner.user_email,
              name: eligibleWinner.user_name,
              likes: eligibleWinner.likes,
              artwork_url: eligibleWinner.image_url,
              prompt: eligibleWinner.prompt
            },
            week: {
              start: weekStart.toISOString(),
              end: weekEnd.toISOString()
            }
          })
        })
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
        // לא נכשיל את כל התהליך בגלל webhook
      }
    }

    return Response.json({
      success: true,
      winner: {
        email: eligibleWinner.user_email,
        name: eligibleWinner.user_name,
        likes: eligibleWinner.likes,
        artwork_id: eligibleWinner.id
      },
      week: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString()
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error selecting weekly winner:', error)
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Allow POST as well for manual triggering
export async function POST(request) {
  return GET(request)
}

