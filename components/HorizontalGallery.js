import { useState, useEffect } from 'react'
import { getArtworks } from '../lib/supabaseClient'

export default function HorizontalGallery() {
  const [artworks, setArtworks] = useState([])

  useEffect(() => {
    loadArtworks()
    
    // רענון כל 10 שניות
    const interval = setInterval(loadArtworks, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadArtworks = async () => {
    try {
      const fetchedArtworks = await getArtworks()
      
      // אם יש פחות מ-20 יצירות, נכפיל אותן כדי למלא את הגלריה
      let allArtworks = [...fetchedArtworks]
      while (allArtworks.length < 20) {
        allArtworks = [...allArtworks, ...fetchedArtworks]
      }
      
      setArtworks(allArtworks.slice(0, 20))
    } catch (error) {
      console.error('Error loading artworks:', error)
      // תמונות fallback במקרה של שגיאה
      setArtworks(Array.from({ length: 20 }, (_, i) => ({
        id: `fallback-${i}`,
        image_url: `https://picsum.photos/400/600?random=${i}`,
        user_name: 'אמן דיגיטלי',
        prompt: 'יצירת אמנות מרהיבה'
      })))
    }
  }

  // חלוקת היצירות ל-4 שורות אופקיות
  const distributeArtworks = (artworks) => {
    const rows = [[], [], [], []]
    artworks.forEach((artwork, index) => {
      rows[index % 4].push(artwork)
    })
    
    // הכפלת התמונות לאפקט אינסופי
    rows.forEach(row => {
      const original = [...row]
      while (row.length < 8) {
        row.push(...original)
      }
    })
    
    return rows
  }

  const rows = distributeArtworks(artworks)

  return (
    <div className="gallery">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="gallery__strip__wrapper">
          <div className={`gallery__strip ${['one', 'two', 'three', 'four'][rowIndex]}`}>
            {row.map((artwork, artworkIndex) => (
              <div key={`${artwork.id}-${artworkIndex}`} className="photo">
                <div className="photo__image">
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.prompt}
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/300/200?random=${rowIndex}${artworkIndex}`
                    }}
                  />
                </div>
                <div className="photo__name">
                  {artwork.user_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
