import { supabase } from '../../../lib/supabaseClient'
import { validatePromptContent } from '../../../lib/contentValidation'

export async function GET() {
  try {
    // שליפת עד 100 בקשות ממתינות (ניצול של Gemini Tier 1: 500 RPM, 2K RPD)
    const { data: pendingItems, error: fetchError } = await supabase
      .from('queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100) // עיבוד מקבילי של עד 100 יצירות

    if (fetchError) {
      console.error('Error fetching pending items:', fetchError)
      return Response.json({ error: 'Failed to fetch pending items' }, { status: 500 })
    }

    if (!pendingItems || pendingItems.length === 0) {
      return Response.json({ message: 'No pending items', queueLength: 0 }, { status: 200 })
    }

    console.log(`Processing ${pendingItems.length} items in parallel...`)

    // עיבוד כל היצירות במקביל
    const results = await Promise.allSettled(
      pendingItems.map(item => processItem(item))
    )

    // ספירת הצלחות וכשלונות
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return Response.json({ 
      message: `Processed ${pendingItems.length} items`,
      successful,
      failed,
      queueLength: 0 
    }, { status: 200 })

  } catch (error) {
    console.error('Worker error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// פונקציה לעיבוד יצירה בודדת
async function processItem(item) {
  try {

    // וידוא שהפרומפט מתחיל ב"בהשראת" - הגנה ברמת Server
    let finalPrompt = item.prompt
    if (!finalPrompt.startsWith('בהשראת ') && !finalPrompt.startsWith('בהשראת…') && !finalPrompt.startsWith('בהשראת:')) {
      finalPrompt = `בהשראת ${finalPrompt}`
    }

    // עדכון סטטוס לעיבוד (ועדכון הפרומפט אם שונה)
    const updateData = finalPrompt !== item.prompt 
      ? { status: 'processing', prompt: finalPrompt }
      : { status: 'processing' }
    
    const { error: updateError } = await supabase
      .from('queue')
      .update(updateData)
      .eq('id', item.id)

    if (updateError) {
      console.error('Error updating status:', updateError)
      throw new Error('Failed to update status')
    }

    // וידוא תוכן הפרומפט עם שתי שכבות בדיקה
    const validationResult = await validatePromptContent(item.prompt)
    
    if (validationResult.isBlocked) {
      // עדכון סטטוס התור ל-blocked
      await supabase
        .from('queue')
        .update({ 
          status: 'blocked',
          // הוספת שדה error_reason אם קיים בטבלה
          // error_reason: validationResult.reason 
        })
        .eq('id', item.id)
      
      console.log(`Item ${item.id} blocked: ${validationResult.reason}`)
      return { success: false, blocked: true, reason: validationResult.reason }
    }
      
      // קריאה ל-Gemini API הפנימי - שימוש בכתובת יחסית לעקיפת Deployment Protection
      const isProduction = process.env.VERCEL_URL || process.env.NODE_ENV === 'production'
      const apiUrl = isProduction ? '/api/gemini' : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/gemini`
      
      // בפרודקשן נשתמש בכתובת יחסית, בפיתוח בכתובת מלאה (עם הפרומפט המעודכן)
      const geminiResponse = isProduction 
        ? await import('../gemini/route.js').then(module => 
            module.POST(new Request('http://localhost/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: finalPrompt })
            }))
          )
        : await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: finalPrompt }),
          })

      // Gemini API response received

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

      // שמירה בטבלת artworks (עם הפרומפט המעודכן + IP)
      const { data: artworkData, error: artworkError } = await supabase
        .from('artworks')
        .insert([{
          user_name: item.user_name,
          user_email: item.user_email,
          user_phone: item.user_phone,
          prompt: finalPrompt,
          image_url: imageUrl,
          user_ip: item.user_ip || 'unknown'
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

      // שליחת וובהוק (עם הפרומפט המעודכן)
      const webhookData = {
        user_name: item.user_name,
        user_email: item.user_email,
        user_phone: item.user_phone,
        prompt: finalPrompt,
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
      
      return { 
        success: true, 
        processed: item.id,
        imageUrl,
        artworkId: artworkData[0].id,
        queueLength: remainingItems ? remainingItems.length : 0
      }

  } catch (processingError) {
    console.error('Error processing item:', processingError)
    
    // החזרת הפריט למצב pending במקרה של שגיאה
    await supabase
      .from('queue')
      .update({ status: 'pending' })
      .eq('id', item.id)

    throw processingError
  }
}

// מאפשר גם POST לצורך גמישות
export async function POST() {
  return GET()
}
