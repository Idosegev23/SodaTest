import { supabase } from '../../../lib/supabaseClient'
import { headers } from 'next/headers'

// Generate a unique identifier for the user based on IP and User-Agent
function getUserIdentifier(request) {
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  // Create a simple hash from IP + User Agent
  // This isn't perfect but provides reasonable protection
  return `${ip}|${userAgent}`.substring(0, 255)
}

export async function POST(request) {
  try {
    const { artworkId } = await request.json()
    
    if (!artworkId) {
      return Response.json({ error: 'Artwork ID is required' }, { status: 400 })
    }
    
    // Get user identifier
    const userIdentifier = getUserIdentifier(request)
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    
    // בדיקה אם ה-IP חסום
    const { data: blockedData } = await supabase
      .from('blocked_users')
      .select('reason')
      .eq('ip_address', ip)
      .limit(1)
    
    if (blockedData && blockedData.length > 0) {
      console.log('Blocked IP attempted to like:', ip)
      return Response.json({ 
        error: 'Access denied',
        blocked: true 
      }, { status: 403 })
    }
    
    // Rate Limiting: בדיקה כמה לייקים ה-IP הזה נתן ל-artwork הזה ב-24 השעות האחרונות
    const { data: recentLikes } = await supabase
      .from('like_rate_limit')
      .select('id')
      .eq('ip_address', ip)
      .eq('artwork_id', artworkId)
      .gte('liked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    // אם יש יותר מ-3 נסיונות - חשוד
    if (recentLikes && recentLikes.length >= 3) {
      console.log('Rate limit exceeded for IP:', ip, 'on artwork:', artworkId)
      return Response.json({ 
        error: 'Too many attempts. Please try again later.',
        rateLimited: true 
      }, { status: 429 })
    }
    
    // Check if this user already liked this artwork
    const { data: existingLike } = await supabase
      .from('artwork_likes')
      .select('id')
      .eq('artwork_id', artworkId)
      .eq('user_identifier', userIdentifier)
      .single()
    
    if (existingLike) {
      console.log('User already liked this artwork:', userIdentifier.substring(0, 30))
      return Response.json({ 
        error: 'You have already liked this artwork',
        alreadyLiked: true 
      }, { status: 409 })
    }
    
    // First get the current artwork to get current likes count
    const { data: currentArtwork, error: fetchError } = await supabase
      .from('artworks')
      .select('likes')
      .eq('id', artworkId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching current artwork:', fetchError)
      return Response.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    // Record the like in artwork_likes table
    const { error: likeError } = await supabase
      .from('artwork_likes')
      .insert([{
        artwork_id: artworkId,
        user_identifier: userIdentifier
      }])
    
    // גם שמירה ב-rate limit table למעקב
    await supabase
      .from('like_rate_limit')
      .insert([{
        ip_address: ip,
        artwork_id: artworkId
      }])
    
    if (likeError) {
      console.error('Error recording like:', likeError)
      // If it's a duplicate key error, user already liked it
      if (likeError.code === '23505') {
        return Response.json({ 
          error: 'You have already liked this artwork',
          alreadyLiked: true 
        }, { status: 409 })
      }
      return Response.json({ error: 'Failed to record like' }, { status: 500 })
    }
    
    // Increment likes count
    const newLikes = (currentArtwork.likes || 0) + 1
    const { data, error } = await supabase
      .from('artworks')
      .update({ likes: newLikes })
      .eq('id', artworkId)
      .select()
    
    if (error) {
      console.error('Error updating likes:', error)
      return Response.json({ error: 'Failed to update likes' }, { status: 500 })
    }
    
    console.log('Like recorded successfully for artwork:', artworkId)
    
    return Response.json({ 
      success: true, 
      likes: data[0]?.likes || 0 
    })
    
  } catch (error) {
    console.error('Error in like-artwork API:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
