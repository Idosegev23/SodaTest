import { supabase } from '../../../lib/supabaseClient'
import { validatePromptContent } from '../../../lib/contentValidation'

export async function GET() {
  try {
    console.log('Worker starting...')

    // שליפת בקשות ממתינות
    const { data: pendingItems, error: fetchError } = await supabase
      .from('queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)

    if (fetchError) {
      console.error('Error fetching pending items:', fetchError)
      return Response.json({ error: 'Failed to fetch pending items' }, { status: 500 })
    }

    if (!pendingItems || pendingItems.length === 0) {
      console.log('No pending items found')
      return Response.json({ message: 'No pending items', queueLength: 0 }, { status: 200 })
    }

    const item = pendingItems[0]
    console.log(`Processing item ${item.id} for user ${item.user_name}`)

    // עדכון סטטוס לעיבוד
    const { error: updateError } = await supabase
      .from('queue')
      .update({ status: 'processing' })
      .eq('id', item.id)

    if (updateError) {
      console.error('Error updating status:', updateError)
      return Response.json({ error: 'Failed to update status' }, { status: 500 })
    }

    try {
      // וידוא תוכן הפרומפט עם שתי שכבות בדיקה
      console.log('Validating prompt content...')
      const validationResult = await validatePromptContent(item.prompt)
      
      if (validationResult.isBlocked) {
        console.log('Prompt blocked:', validationResult.reason)
        
        // עדכון סטטוס התור ל-blocked
        await supabase
          .from('queue')
          .update({ 
            status: 'blocked',
            // הוספת שדה error_reason אם קיים בטבלה
            // error_reason: validationResult.reason 
          })
          .eq('id', item.id)
        
        return Response.json({ 
          error: 'Content blocked',
          reason: validationResult.reason,
          category: validationResult.category,
          queueLength: 0
        }, { status: 400 })
      }
      
      console.log('Prompt validation passed, proceeding with image generation...')
      
      // קריאה ל-Gemini API הפנימי - שימוש בכתובת יחסית לעקיפת Deployment Protection
      const isProduction = process.env.VERCEL_URL || process.env.NODE_ENV === 'production'
      const apiUrl = isProduction ? '/api/gemini' : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/gemini`
      
      console.log('Making request to Gemini API:', apiUrl)
      console.log('Request payload:', { prompt: item.prompt })
      console.log('Is production:', isProduction)
      
      // בפרודקשן נשתמש בכתובת יחסית, בפיתוח בכתובת מלאה
      const geminiResponse = isProduction 
        ? await import('../gemini/route.js').then(module => 
            module.POST(new Request('http://localhost/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: item.prompt })
            }))
          )
        : await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: item.prompt }),
          })

      console.log('Gemini API response status:', geminiResponse.status)
      console.log('Gemini API response statusText:', geminiResponse.statusText)

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error('Gemini API error response:', errorText)
        throw new Error(`Gemini API failed: ${geminiResponse.statusText} - ${errorText}`)
      }

      // המרת התמונה ל-buffer
      const imageBuffer = await geminiResponse.arrayBuffer()
      const imageData = Buffer.from(imageBuffer)

      // המרה ל-WebP עם Sharp לאופטימיזציה
      let finalImageData = imageData
      let contentType = 'image/png'
      let fileExtension = 'png'
      
      try {
        const sharp = require('sharp')
        finalImageData = await sharp(imageData)
          .webp({ quality: 85, effort: 6 })
          .toBuffer()
        contentType = 'image/webp'
        fileExtension = 'webp'
        console.log('Image converted to WebP successfully')
      } catch (sharpError) {
        console.error('Error converting to WebP, using original:', sharpError)
        // נשתמש בתמונה המקורית אם ההמרה נכשלה
      }

      // העלאה ל-Supabase Storage
      const fileName = `artwork_${item.id}_${Date.now()}.${fileExtension}`
      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, finalImageData, {
          contentType: contentType,
        })

      if (uploadError) {
        console.error('Error uploading to storage:', uploadError)
        throw new Error('Failed to upload image')
      }

      // קבלת URL ציבורי
      const { data: urlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName)

      const imageUrl = urlData.publicUrl

      // שמירה בטבלת artworks
      const { data: artworkData, error: artworkError } = await supabase
        .from('artworks')
        .insert([{
          user_name: item.user_name,
          user_email: item.user_email,
          user_phone: item.user_phone,
          prompt: item.prompt,
          image_url: imageUrl,
        }])
        .select()

      if (artworkError) {
        console.error('Error saving artwork:', artworkError)
        throw new Error('Failed to save artwork')
      }

      // עדכון סטטוס התור ל-done
      const { error: doneError } = await supabase
        .from('queue')
        .update({ status: 'done' })
        .eq('id', item.id)

      if (doneError) {
        console.error('Error updating to done:', doneError)
        throw new Error('Failed to update status to done')
      }

      // שליחת וובהוק
      const webhookData = {
        user_name: item.user_name,
        user_email: item.user_email,
        user_phone: item.user_phone,
        prompt: item.prompt,
        image_url: imageUrl,
        created_at: artworkData[0].created_at,
      }

      if (process.env.WEBHOOK_URL && process.env.WEBHOOK_URL !== 'https://your-webhook-url.com/webhook') {
        try {
          await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
          })
          console.log('Webhook sent successfully')
        } catch (webhookError) {
          console.error('Error sending webhook:', webhookError)
          // לא נכשיל את כל הביצוע בגלל וובהוק
        }
      }

      // בדיקת אורך התור אחרי העיבוד
      const { data: remainingItems } = await supabase
        .from('queue')
        .select('id')
        .eq('status', 'pending')
      
      console.log(`Successfully processed item ${item.id}`)
      
      // Note: We can't dispatch browser events from server-side code
      // The client-side will need to poll or use other mechanisms for real-time updates
      
      return Response.json({ 
        success: true, 
        processed: item.id,
        imageUrl,
        artworkId: artworkData[0].id,
        queueLength: remainingItems ? remainingItems.length : 0
      }, { status: 200 })

    } catch (processingError) {
      console.error('Error processing item:', processingError)
      
      // החזרת הפריט למצב pending במקרה של שגיאה
      await supabase
        .from('queue')
        .update({ status: 'pending' })
        .eq('id', item.id)

      return Response.json({ 
        error: 'Failed to process item',
        details: processingError.message 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Worker error:', error)
    return Response.json({ 
      error: 'Worker failed',
      details: error.message 
    }, { status: 500 })
  }
}

// מאפשר גם POST לצורך גמישות
export async function POST() {
  return GET()
}
