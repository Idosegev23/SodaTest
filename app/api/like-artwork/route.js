import { supabase } from '../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const { artworkId } = await request.json()
    
    if (!artworkId) {
      return Response.json({ error: 'Artwork ID is required' }, { status: 400 })
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
    
    return Response.json({ 
      success: true, 
      likes: data[0]?.likes || 0 
    })
    
  } catch (error) {
    console.error('Error in like-artwork API:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
