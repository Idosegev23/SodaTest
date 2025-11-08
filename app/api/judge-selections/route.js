import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'

// GET - שליפת בחירות של שופט
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const judgeName = searchParams.get('judgeName')
    const selectedOnly = searchParams.get('selected') === 'true'
    
    if (!judgeName) {
      return NextResponse.json(
        { error: 'judgeName is required' },
        { status: 400 }
      )
    }
    
    // אם זה מצב בדיקה (עידו), לא נחזיר כלום מהDB
    if (judgeName.toLowerCase().trim() === 'עידו') {
      return NextResponse.json({ selections: [], isDemoMode: true })
    }
    
    let query = supabase
      .from('judge_selections')
      .select('*')
      .eq('judge_name', judgeName)
      .order('viewed_at', { ascending: false })
    
    if (selectedOnly) {
      query = query.eq('is_selected', true)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching judge selections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch selections' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ selections: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - שמירת בחירה
export async function POST(request) {
  try {
    const body = await request.json()
    const { judgeName, artworkId, isSelected } = body
    
    if (!judgeName || !artworkId) {
      return NextResponse.json(
        { error: 'judgeName and artworkId are required' },
        { status: 400 }
      )
    }
    
    // אם זה מצב בדיקה (עידו), נחזיר הצלחה אבל לא נשמור
    if (judgeName.toLowerCase().trim() === 'עידו') {
      return NextResponse.json({ 
        success: true, 
        isDemoMode: true,
        message: 'Demo mode - not saved to database'
      })
    }
    
    // ניסיון להכניס או לעדכן
    const { data, error } = await supabase
      .from('judge_selections')
      .upsert({
        judge_name: judgeName,
        artwork_id: artworkId,
        is_selected: isSelected !== undefined ? isSelected : true,
        viewed_at: new Date().toISOString()
      }, {
        onConflict: 'judge_name,artwork_id'
      })
      .select()
    
    if (error) {
      console.error('Error saving judge selection:', error)
      return NextResponse.json(
        { error: 'Failed to save selection' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - מחיקת בחירה (undo)
export async function DELETE(request) {
  try {
    const body = await request.json()
    const { judgeName, artworkId } = body
    
    if (!judgeName || !artworkId) {
      return NextResponse.json(
        { error: 'judgeName and artworkId are required' },
        { status: 400 }
      )
    }
    
    // אם זה מצב בדיקה, נחזיר הצלחה אבל לא נמחק
    if (judgeName.toLowerCase().trim() === 'עידו') {
      return NextResponse.json({ 
        success: true, 
        isDemoMode: true 
      })
    }
    
    const { error } = await supabase
      .from('judge_selections')
      .delete()
      .eq('judge_name', judgeName)
      .eq('artwork_id', artworkId)
    
    if (error) {
      console.error('Error deleting judge selection:', error)
      return NextResponse.json(
        { error: 'Failed to delete selection' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

