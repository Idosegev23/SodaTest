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
    const data = await request.json()
    
    console.log('Webhook received:', {
      user_name: data.user_name,
      user_email: data.user_email,
      prompt: data.prompt,
      image_url: data.image_url,
      created_at: data.created_at
    })

    // כאן תוכל להוסיף לוגיקה נוספת כמו:
    // - שליחת אימייל למשתמש
    // - שליחת הודעת SMS
    // - עדכון מערכות חיצוניות
    // - שמירה בלוגים

    if (process.env.WEBHOOK_URL && process.env.WEBHOOK_URL !== 'https://your-webhook-url.com/webhook') {
      // העברת הוובהוק לכתובת חיצונית אם מוגדרת
      try {
        await fetch(process.env.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
      } catch (error) {
        console.error('Error forwarding webhook:', error)
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    }, { 
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ 
      error: 'Failed to process webhook',
      details: error.message 
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}
