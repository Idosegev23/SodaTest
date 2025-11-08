import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabaseClient'

// GET - סיכום בחירות השופטים (Top יצירות)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // שליפת כל הבחירות (לא כולל עידו) עם פרטי היצירות
    const { data, error } = await supabase
      .from('judge_selections')
      .select(`
        artwork_id,
        judge_name,
        is_selected,
        artworks (
          id,
          user_name,
          image_url,
          prompt,
          likes,
          created_at
        )
      `)
      .eq('is_selected', true)
      .neq('judge_name', 'עידו')
    
    if (error) {
      console.error('Error fetching judge selections summary:', error)
      return NextResponse.json(
        { error: 'Failed to fetch summary' },
        { status: 500 }
      )
    }
    
    // קיבוץ לפי יצירה וספירה
    const artworkCounts = {}
    const judgesByArtwork = {}
    
    data.forEach(selection => {
      const artworkId = selection.artwork_id
      
      if (!artworkCounts[artworkId]) {
        artworkCounts[artworkId] = {
          count: 0,
          artwork: selection.artworks
        }
        judgesByArtwork[artworkId] = []
      }
      
      artworkCounts[artworkId].count++
      judgesByArtwork[artworkId].push(selection.judge_name)
    })
    
    // המרה למערך וממיון
    const summary = Object.entries(artworkCounts)
      .map(([artworkId, data]) => ({
        artwork_id: artworkId,
        ...data.artwork,
        judge_selections: data.count,
        judges: judgesByArtwork[artworkId],
        selection_percentage: Math.round((data.count / 5) * 100) // 5 שופטים
      }))
      .sort((a, b) => b.judge_selections - a.judge_selections)
      .slice(0, limit)
    
    // סטטיסטיקות כלליות
    const totalSelections = data.length
    const uniqueArtworks = Object.keys(artworkCounts).length
    const judgeNames = [...new Set(data.map(s => s.judge_name))]
    
    return NextResponse.json({
      summary,
      stats: {
        total_selections: totalSelections,
        unique_artworks: uniqueArtworks,
        active_judges: judgeNames.length,
        judges: judgeNames
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

