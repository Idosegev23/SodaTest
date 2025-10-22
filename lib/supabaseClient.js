import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to get artworks for gallery
export async function getArtworks() {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Error fetching artworks')
      return []
    }
    
    return data || []
  } catch (e) {
    console.error('Unexpected error fetching artworks')
    return []
  }
}

// Helper function to add to queue
export async function addToQueue(userData) {
  // First, save to leads table if consent is given
  if (userData.consent) {
    try {
      await supabase
        .from('leads')
        .insert([{
          name: userData.user_name,
          email: userData.user_email,
          phone: userData.user_phone,
          consent: userData.consent
        }])
    } catch (leadError) {
      console.error('Error saving lead:', leadError)
      // Continue even if lead saving fails
    }
  }
  
  // קבלת IP של המשתמש (client-side - לא אמין אבל טוב לפולבק)
  let userIp = userData.user_ip || 'unknown'
  
  // ניסיון לקבל IP מצד ה-client (לא אמין לחלוטין)
  if (!userData.user_ip) {
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const ipData = await ipResponse.json()
      userIp = ipData.ip || 'unknown'
    } catch (e) {
      // Could not fetch user IP
    }
  }
  
  // Then add to queue for artwork processing
  const { data, error } = await supabase
    .from('queue')
    .insert([{
      user_name: userData.user_name,
      user_email: userData.user_email,
      user_phone: userData.user_phone,
      prompt: userData.prompt,
      status: userData.status || 'pending',
      user_ip: userIp
    }])
    .select()
  
  if (error) {
    console.error('Error adding to queue:', error)
    throw error
  }
  
  return data[0]
}

// Helper function to check queue status
export async function checkQueueStatus(id) {
  const { data, error } = await supabase
    .from('queue')
    .select('status')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error checking queue status:', error)
    return null
  }
  
  return data.status
}

// Helper function to get completed artwork by queue id
export async function getCompletedArtwork(queueId) {
  // First get the queue item to get user details
  const { data: queueData, error: queueError } = await supabase
    .from('queue')
    .select('user_email, created_at')
    .eq('id', queueId)
    .single()
  
  if (queueError) return null
  
  // Then find the matching artwork by email and timestamp
  const { data: artworkData, error: artworkError } = await supabase
    .from('artworks')
    .select('*')
    .eq('user_email', queueData.user_email)
    .gte('created_at', queueData.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (artworkError) return null
  
  return artworkData
}

// Helper function to get images from Supabase Storage
export async function getImagesFromStorage(bucketName = 'artworks') {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', { 
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) {
      console.error('Error fetching storage files')
      return []
    }
    
    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && 
      file.name !== '.emptyFolderPlaceholder'
    )
    
    // Generate public URLs for the images
    const imagesWithUrls = imageFiles.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file.name)
      
      // פירוק שם הקובץ - הפרדה בין הפרומפט ושם המשתמש
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      
      // אם השם מכיל '_by_' או דפוס דומה, נפריד בינהם
      let prompt = fileNameWithoutExt
      let userName = 'משתמש'
      
      // חיפוש דפוסים שונים של הפרדה
      const separators = ['_by_', '_-_', '__', ' by ', ' - ']
      for (const separator of separators) {
        if (fileNameWithoutExt.includes(separator)) {
          const parts = fileNameWithoutExt.split(separator)
          prompt = parts[0].trim()
          userName = parts[1] ? parts[1].trim() : 'משתמש'
          break
        }
      }
      
      // אם לא נמצא מפריד, השם כולו יהיה הפרומפט
      return {
        id: file.name,
        image_url: publicUrl,
        user_name: userName,
        prompt: prompt,
        created_at: file.created_at
      }
    })
    
    return imagesWithUrls
    
  } catch (e) {
    console.error('Unexpected error in getImagesFromStorage')
    return []
  }
}
